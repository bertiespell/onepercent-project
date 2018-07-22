pragma solidity ^0.4.23;

contract PaymentPipe {

  address externalContractAddress;

  event ExternalContractCall(
    string _message
  );

  event GetTotalFunds(
    string _message,
    uint totalfunds
  );

  uint public totalFunds;

  address public owner;

  constructor() {
    owner = msg.sender;
  }

  function payAccountWithOnePercentTax(address externalAccount) payable {
    uint onePercent = msg.value/100;
    totalFunds += onePercent;
    uint totalToSend = msg.value - onePercent;
    externalAccount.transfer(totalToSend);
  }

  // this should likely be the contract address, and then a hash of the method to call...
  function callExternalContractWithOnePercentTax(address externalAccount, string methodNameSignature) payable {
    uint onePercent = msg.value/100;
    totalFunds += onePercent;
    uint totalToSend = msg.value - onePercent;
    externalContractAddress = externalAccount;
    /* externalAccount.call(bytes4(keccak256(methodNameSignature))); */

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
    emit ExternalContractCall('External Contract call made with amount!');
  }

  function getTotalFunds() public returns (uint) {
    emit GetTotalFunds('total funds', totalFunds);
    return totalFunds;
  }
}
