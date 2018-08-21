pragma solidity ^0.4.23;
import "./AccessControl.sol";
import "./SafeMath.sol";
import "./Application.sol";
import "./PaymentPipe.sol";


contract FundingApplications is AccessControl {
    using SafeMath for uint256;

    bool public applicationsOpen;
    bool public votingOpen;

    uint public applicationCost;

    uint public lastOpenApplicationsIndex;

    uint public votingStartIndex;
    uint public votingEndIndex;

    Proposal[] public proposals;

    address public opcTokenAddress;
    address public paymentPipeAddress;

    address[] public tiedAddresses;
    
    struct Proposal {
        address submissionAddress;
        address fundingApplicationAddress;
        string applicationName;
        string description; 
    }

    event ApplicationSubmitted(
        address submissionAddress,
        address fundingApplicationAddress,
        string applicationName,
        string description
    );

    event ApplicationCostUpdated(
        uint newCost
    );

    constructor(
        address pipeAddress, 
        address tokenAddress
    ) public {
        applicationsOpen = false;
        votingOpen = false;
        applicationCost = 4000000000000000 wei;
        lastOpenApplicationsIndex = 0;
        votingStartIndex = 0;
        votingEndIndex = 0;
        paymentPipeAddress = pipeAddress;
        opcTokenAddress = tokenAddress;
    }

    modifier applicationsAreOpen() {
        require(applicationsOpen == true);
        _;
    }

    modifier applicationsClosed() {
        require(applicationsOpen == false);
        _;
    }

    modifier votingIsOpen() {
        require(votingOpen == true);
        _;
    }

    modifier votingClosed() {
        require(votingOpen == false);
        _;
    }

    modifier meetsPaymentCriteria() {
        require(msg.value >= applicationCost);
        _;
    }

    function openApplications() external onlyCLevel applicationsClosed votingClosed {
        applicationsOpen = true;
        // this tracks the index to begin to interate over when opening contracts to votes
        votingStartIndex = proposals.length;
    }

    function closeApplications() external onlyCLevel applicationsAreOpen votingClosed {
        applicationsOpen = false;
        // this tracks the index to stop at when counting votes
        // TODO: should consider overflow and underflow here?!
        votingEndIndex = proposals.length;
    }

    function openVoting() external onlyCLevel votingClosed applicationsClosed {
        votingOpen = true;
        for (uint i = votingStartIndex; i < votingEndIndex; i++) {
            Application(proposals[i].fundingApplicationAddress).openApplicationToVoting();
        }
    }

    function closeVoting() external onlyCLevel applicationsClosed votingIsOpen {
        votingOpen = false;
        uint highestVotes = 0;
        address addressesToPay;
        uint tiedAddressesIndex = tiedAddresses.length;
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
            } else if ((votes == highestVotes) && (votes > 0)) { // stops the first application with no votes from being counted
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

    function setApplicationCostInWei(uint newCost) external onlyCLevel {
        applicationCost = newCost;
        emit ApplicationCostUpdated(newCost);
    }

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

    function kill() public onlyCLevel {
        selfdestruct(this);
    }

    function getVotingStatus() public view returns (bool) {
        return votingOpen;
    }

    function getApplicationStatus() public view returns (bool) {
        return applicationsOpen;
    }
}