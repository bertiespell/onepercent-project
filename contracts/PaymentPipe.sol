pragma solidity ^0.4.23;

contract PaymentPipe {

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

  function callExternalContractWithOnePercentTax(address externalAccount, uint amount) {
    uint onePercent = amount/100;
    totalFunds += onePercent;
    uint totalToSend = amount - onePercent;
    externalAccount.transfer(totalToSend);
  }

  function getTotalFunds() view returns (uint totalFunds) {
    return totalFunds;
  }
}
