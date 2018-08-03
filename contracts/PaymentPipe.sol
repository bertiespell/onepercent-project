pragma solidity ^0.4.23;

import "./ConvertLib.sol";

contract PaymentPipe {

  address externalContractAddress;

  mapping(address => uint) public coinBalances;

  uint public totalFunds;

  address public owner;

  constructor() {
    owner = msg.sender;
  }

  /* function getCoinBalance() returns (uint){
    return coinBalances[msg.sender];
  } */

  function payAccountWithOnePercentTax(address externalAccount) payable {
    uint onePercent = msg.value/100;
    totalFunds += onePercent;
    uint totalToSend = msg.value - onePercent;
    coinBalances[msg.sender] += 1;
    externalAccount.transfer(totalToSend);
  }

  // this should likely be the contract address, and then a hash of the method to call...
  function callExternalContractWithOnePercentTax(address externalAccount, string methodNameSignature) payable {
    uint onePercent = msg.value/100;
    totalFunds += onePercent;
    uint totalToSend = msg.value - onePercent;
    externalContractAddress = externalAccount;

    /*  Couldn't find a way to do this and alter the amount of ether to send*/
    bytes4 sig = bytes4(keccak256(methodNameSignature));
    assembly {
        // move pointer to free memory spot
        let ptr := mload(0x40)
        // put function sig at memory spot
        mstore(ptr,sig)

        let result := call(
          15000, // gas limit
          sload(externalContractAddress_slot),  // to addr. append var to _slot to access storage variable
          totalToSend, // amount of ether to transfer
          ptr, // Inputs are stored at location ptr
          0x24, // Inputs are 36 bytes long
          ptr,  //Store output over input
          0x20) //Outputs are 32 bytes long

        if eq(result, 0) {
            revert(0, 0)
        }

        mstore(0x40,add(ptr,0x24)) // Set storage pointer to new space
    }

    coinBalances[msg.sender] += 1;
  }

  function getTotalFunds() public returns (uint) {
    return totalFunds;
  }


  function getCoinBalanceInEth() public view returns(uint){
		return ConvertLib.convert(getCoinBalance(),2);
	}

	function getCoinBalance() public view returns(uint) {
		return coinBalances[msg.sender];
	}
}
