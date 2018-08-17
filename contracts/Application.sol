pragma solidity ^0.4.23;


contract Application {

    address public submissionAddress;

    string public applicationName;

    uint public requestedFunds;

    constructor(
        address _submissionAddress,
        string _applicationName,
        uint _requestedFunds
    ) public {
        submissionAddress = _submissionAddress;
        applicationName = _applicationName;
        requestedFunds = _requestedFunds;
    }

    
}
