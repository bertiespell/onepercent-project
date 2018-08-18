pragma solidity ^0.4.23;
import "./AccessControl.sol";


contract Application is AccessControl {

    address public submissionAddress;

    address public fundingApplicationAddress;

    string public applicationName;

    string public description;

    uint public requestedFunds;

    bool public isOpenToVote;

    event ApplicationOpenToVotes(
        string indexed _applicationName,
        address applicationAddress
    );

    event ApplicationClosedToVotes(
        string indexed _applicationName,
        address applicationAddress
    );

    constructor(
        address _fundingApplication,
        address _submissionAddress,
        string _applicationName,
        string _description,
        uint _requestedFunds
    ) public {
        fundingApplicationAddress = _fundingApplication;
        submissionAddress = _submissionAddress;
        applicationName = _applicationName;
        description = _description;
        requestedFunds = _requestedFunds;
        isOpenToVote = false;
    }

    modifier isFundingApplicationsContract() {
        require(msg.sender == fundingApplicationAddress);
        _;
    }

    function openApplicationToVoting() external isFundingApplicationsContract {
        isOpenToVote = true;
        emit ApplicationOpenToVotes(
            applicationName,
            this
        );
    }

    function closeApplicationToVoting() external isFundingApplicationsContract {
        isOpenToVote = false;
        emit ApplicationClosedToVotes(
            applicationName,
            this
        );
    }
}
