pragma solidity ^0.4.23;
import "./AccessControl.sol";
import "./SafeMath.sol";
import "./Application.sol";


contract FundingApplications is AccessControl {
    using SafeMath for uint256;

    bool public applicationsOpen;
    bool public votingOpen;

    uint public applicationCost;

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

    constructor() public {
        applicationsOpen = false;
        votingOpen = false;
        applicationCost = 3800 szabo;
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
    }

    function closeVoting() external onlyCLevel {
        votingOpen = false;       
    }

    function setApplicationCost(uint newCost) external onlyCLevel {
        applicationCost = newCost;
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

        emit ApplicationSubmitted(
            msg.sender,
            proposal.fundingApplicationAddress,
            _applicationName,
            _description,
            _requestedFunds
        );
    }
}