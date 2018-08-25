pragma solidity ^0.4.23;

import "./AccessControl.sol";
import "../installed_contracts/zeppelin/contracts/token/StandardToken.sol";


/// @title the OPCToken is awared to users for using the payment pipe
contract OPCToken is AccessControl, StandardToken {

    /// @dev the owner of the contract
    address public owner;

    /// @dev the symbol representing the token
    string public symbol;

    /// @dev the name of the token
    string public  name;

    /// @dev the number of decimals used to determine the total supply
    uint8 public decimals;
    
    constructor() public {
        // ---- Initialize owner address ----
        owner = msg.sender;
        // ---- Initialize token data ----
        symbol = "OPC";
        name = "One Percent Token";
        decimals = 18;
        totalSupply = 1000000 * 10**uint(decimals);
        balances[owner] = totalSupply;
        // ---- Transfer the total supply to the owner of the contract ----
        emit Transfer(address(0), owner, totalSupply);
    }
    
    /// @dev this method calls selfdestruct() and removes the contract from the blockchain. 
    /// Access is limited to the CEO. 
    function kill() public onlyCEO {
        selfdestruct(this);
    }
}