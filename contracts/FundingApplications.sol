pragma solidity ^0.4.23;
import "./AccessControl.sol";
import "./SafeMath.sol";
import "./Application.sol";


contract FundingApplications is AccessControl {
    using SafeMath for uint256;

    bool public applicationsOpen;
    bool public votingOpen;

    uint public applicationCost;

    uint public lastOpenApplicationsIndex;
    uint public numberOfApplications;

    Proposal[] public proposals;

    struct Proposal {
        address submissionAddress;
        address fundingApplicationAddress;
        string applicationName;
        string description; 
        uint requestedFunds;
    }

    event ApplicationSubmitted(
        address submissionAddress,
        address fundingApplicationAddress,
        string applicationName,
        string description,
        uint requestedFunds
    );

    event ApplicationCostUpdated(
        uint newCost
    );

    constructor() public {
        applicationsOpen = false;
        votingOpen = false;
        applicationCost = 4000000000000000 wei;
        lastOpenApplicationsIndex = 0;
        numberOfApplications = 0;
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

    function openApplications() external onlyCLevel votingClosed {
        applicationsOpen = true;
    }

    function closeApplications() external onlyCLevel {
        applicationsOpen = false;
    }

    function openVoting() external onlyCLevel applicationsClosed {
        votingOpen = true;
        uint proposalsArrayLength = proposals.length;
        for (uint i = lastOpenApplicationsIndex; i < proposalsArrayLength; i++) {
            // open each application to voting
            Application(proposals[i].fundingApplicationAddress).openApplicationToVoting();
        }
        // reset the index for the next round of applications
        // TODO: should consider overflow and underflow here?!
        lastOpenApplicationsIndex = numberOfApplications;
    }

    function closeVoting() external onlyCLevel {
        votingOpen = false;
        Proposal memory highestNumberOfVotes;
        Proposal memory highestNumberOfVotesAndMetTarget;
        uint proposalsArrayLength = proposals.length;
        for (uint i = lastOpenApplicationsIndex; i < proposalsArrayLength; i++) {
            // funds should be allocated primarily to an application which has met targer *AND* has the highest number of votes
            // if none have met target, funds are allocated to the application with the highest number of votes

            // PSUEDO-CODE:

            // close each application to voting
            // check whether it is the highest votes
            // check whether is has met target
        }   
    }

    function setApplicationCostInWei(uint newCost) external onlyCLevel {
        applicationCost = newCost;
        emit ApplicationCostUpdated(newCost);
    }

    function submitApplication(
        string _applicationName, 
        string _description, 
        uint _requestedFunds
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
        proposal.requestedFunds = _requestedFunds;
        proposal.fundingApplicationAddress = new Application(
            this,
            msg.sender,
            _applicationName,
            _description,
            _requestedFunds
        );
        proposals.push(proposal);

        // this is used to track the indexes to loop through, lowering gas costs
        numberOfApplications++;

        emit ApplicationSubmitted(
            msg.sender,
            proposal.fundingApplicationAddress,
            _applicationName,
            _description,
            _requestedFunds
        );
    }
}