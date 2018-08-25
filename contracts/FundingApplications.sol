pragma solidity ^0.4.23;
import "./AccessControl.sol";
import "./SafeMath.sol";
import "./Application.sol";
import "./PaymentPipe.sol";


/// @title FundingApplications managers users' applications and voting cycles
contract FundingApplications is AccessControl {

    using SafeMath for uint256;

    /// @dev used to track whether applications are open
    bool public applicationsOpen;

    /// @dev used to track whether voting is open
    bool public votingOpen;

    /// @dev used to determine the cost of submitting an application
    /// this can be reset using the method below
    uint public applicationCost;

    /// @dev this tracks the index of the first application of which to vote on
    /// this is updated each time applications open (with the length of the applications array)
    /// this is used to manage the size of the loop
    /// mitigates the possibility of an out of gas exception
    uint public votingStartIndex;

    /// @dev this tracks the index of the last applications of which to vote on
    /// this is updated each time applications close (with the length of the applications array)
    /// this is used to manage the size of the loop
    /// mitigates the possibility of an out of gas exception
    uint public votingEndIndex;

    /// @dev stores all of the submitted proposals
    Proposal[] public proposals;

    /// @dev used to track the opcToken address
    /// The token address is passed to each newly instantiated application
    /// This allows applications to manage their own voting
    address public opcTokenAddress;

    /// @dev used to track the payment pipe address
    /// this is used to set and pay winners
    address public paymentPipeAddress;

    /// @dev this is used to track tied addresses during vote counting
    /// it is reset every cycle
    address[] public tiedAddresses;
    
    /// @dev used to store information about a funding proposal
    /// similar to the information stored in each application contract
    struct Proposal {
        address submissionAddress;
        address fundingApplicationAddress;
        string applicationName;
        string description; 
    }

    /// @dev emitted whenever a new application is submitted
    event ApplicationSubmitted(
        address submissionAddress,
        address fundingApplicationAddress,
        string applicationName,
        string description
    );

    /// @dev emitted whenever the cost of submitting an application is updated
    event ApplicationCostUpdated(
        uint newCost
    );

    constructor(
        address pipeAddress, 
        address tokenAddress
    ) public {
        // ---- Initialize state ----
        applicationsOpen = false;
        votingOpen = false;
        // ---- Initialize cost associated with submitting an application ----
        applicationCost = 4000000000000000 wei;
        // ---- Initialize the indexes which track how many applications have been submitted ----
        votingStartIndex = 0;
        votingEndIndex = 0;
        // ---- Initialize addresses ----
        paymentPipeAddress = pipeAddress;
        opcTokenAddress = tokenAddress;
    }

    /// @dev modifier used to restrict functionality to when applications are open
    modifier applicationsAreOpen() {
        require(applicationsOpen == true);
        _;
    }

    /// @dev modifier used to restrict functionality to when applications are closed
    modifier applicationsClosed() {
        require(applicationsOpen == false);
        _;
    }

    /// @dev modifier used to restrict functionality to when voting is open
    modifier votingIsOpen() {
        require(votingOpen == true);
        _;
    }

    /// @dev modifier used to restrict functionality to when voting is closed
    modifier votingClosed() {
        require(votingOpen == false);
        _;
    }

    /// @dev modifier used to restrict the submission of applications
    /// submissions must pay the minimum cost
    modifier meetsPaymentCriteria() {
        require(msg.value >= applicationCost);
        _;
    }

    /// @dev method used to open the contract to new applications
    /// access is restricted to C level accounts
    /// applications and voting must already be closed
    /// this tracks the index to begin to interate over when opening contracts to votes
    function openApplications() 
        external 
        onlyCLevel 
        applicationsClosed 
        votingClosed 
        whenNotPaused
    {
        applicationsOpen = true;
        votingStartIndex = proposals.length;
    }

    /// @dev method used to close the contract to new applications
    /// access is restricted to C level accounts
    /// applications must be open and voting must be closed
    /// this tracks the index to stop at when counting votes
    function closeApplications() 
        external 
        onlyCLevel 
        applicationsAreOpen 
        votingClosed 
        whenNotPaused
    {
        applicationsOpen = false;
        votingEndIndex = proposals.length;
    }

    /// @dev method used to open the contract to voting
    /// access is restricted to C level accounts
    /// voting must have be closed and applications must also be closed
    /// iterates over the last batch of proposals and opens them to voting
    function openVoting() external 
        onlyCLevel 
        votingClosed 
        applicationsClosed 
        whenNotPaused
    {
        votingOpen = true;
        for (uint i = votingStartIndex; i < votingEndIndex; i++) {
            Application(proposals[i].fundingApplicationAddress).openApplicationToVoting();
        }
    }

    /// @dev method used to close the contract to voting
    /// calculates and pays the winenrs who received the most votes
    /// access is restricted to C level accounts
    /// voting must be open and applications must be closed
    /// calls selfdestruct() on applications once their votes have been counted
    function closeVoting() 
        external 
        onlyCLevel 
        applicationsClosed 
        votingIsOpen 
        whenNotPaused
    {
        votingOpen = false;
        uint highestVotes = 0;
        // track the winning address to pay so that we may call selfdestruct on the application
        // avoids multiple loops or losing the necessary data in the for loop below
        address addressesToPay;
        // track the index of the tied addresses
        uint tiedAddressesIndex = tiedAddresses.length;
        // track whether the result was tied
        bool tiedResult = false;
        for (uint i = votingStartIndex; i < votingEndIndex; i++) {
            Application application = Application(proposals[i].fundingApplicationAddress);
            uint votes = application.voteCount();
            if (votes > highestVotes) {
                // keep track of the tiedAddressesIndex so we know which addresses in the array are the highest voted
                tiedAddressesIndex = tiedAddresses.length;
                tiedAddresses.push(application.submissionAddress());
                
                highestVotes = votes;
                addressesToPay = application.submissionAddress();
                tiedResult = false;
            } else if (
                (votes == highestVotes) && (votes > 0)
            ) { // stops the first application with no votes from being counted
                tiedAddresses.push(application.submissionAddress());
                // emit Info(tiedResult);
                tiedResult = true;
            }
            application.kill();
        }

        PaymentPipe paymentPipe = PaymentPipe(paymentPipeAddress);

        if (tiedResult) {
            for (uint j = tiedAddressesIndex; j < tiedAddresses.length; j++) {
                // set each payee to be a winner
                paymentPipe.setMultipleWinners(tiedAddresses[j]);
            }
            // let paymentPipe determine the share to pay to each winner
            paymentPipe.payWinners();
        } else if (addressesToPay != address(0)) { // catch the case where no-one won / the applications list was empty
            paymentPipe.payWinner(addressesToPay);
        }
    }

    /// @dev set a new application cost in wei
    /// access is restricted to C level accounts
    /// @param newCost the new cost required to submit an application
    function setApplicationCostInWei(uint newCost) external onlyCLevel {
        applicationCost = newCost;
        emit ApplicationCostUpdated(newCost);
    }

    /// @dev method used to submit an application
    /// @param _applicationName the name of the application
    /// @param _description a short description of the proposal
    /// here it is assumed that the gas and application fee will deter poison data
    /// restricted to when the application is not paused
    /// applications must be open
    /// sender must meet minimum payment criteria
    function submitApplication(
        string _applicationName, 
        string _description 
    ) 
        public
        payable
        whenNotPaused
        applicationsAreOpen
        meetsPaymentCriteria
    {
        Proposal memory proposal;
        proposal.submissionAddress = msg.sender;
        proposal.applicationName = _applicationName;
        proposal.description = _description;
        proposal.fundingApplicationAddress = new Application(
            this,
            msg.sender,
            _applicationName,
            _description,
            paymentPipeAddress,
            opcTokenAddress
        );
        proposals.push(proposal);

        emit ApplicationSubmitted(
            msg.sender,
            proposal.fundingApplicationAddress,
            _applicationName,
            _description
        );
    }

    /** @dev this method calls selfdestruct() and removes the contract from the blockchain. 
     * Access is limited to the CEO. 
     */
    function kill() 
        public 
        onlyCEO 
        whenNotPaused
    {
        selfdestruct(this);
    }

    function getVotingStatus() public view returns (bool) {
        return votingOpen;
    }

    function getApplicationStatus() 
        public 
        view 
        returns (bool) 
    {
        return applicationsOpen;
    }
}