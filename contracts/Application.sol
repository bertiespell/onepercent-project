pragma solidity ^0.4.23;


contract Application {

    address public submissionAddress;

    address public fundingApplicationAddress;

    string public applicationName;

    string public description;

    uint public requestedFunds;

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
    }

    // withdraw the funds - this can either be C level or the submission address!
    // function withdrawFunds() public {

    // }
}
