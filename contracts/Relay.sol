pragma solidity ^0.4.23;


/// @title Relay handles upgrades to contracts and managers their address
contract Relay {
    address public currentVersion;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor (address initAddr) public {
        currentVersion = initAddr;
        owner = msg.sender; // this owner may be another contract with multisig, not a single contract owner
    }

    function() {
        require(currentVersion.delegatecall(msg.data));
    }

    function changeContract(address newVersion) public
    onlyOwner()
    {
        currentVersion = newVersion;
    }
}
