pragma solidity ^0.4.23;

contract ExternalContractExample {

  uint public totalPaidIn;

  event ExternalContractPaid(
    string _message,
    uint amount
  );

  constructor () {
    totalPaidIn = 10;
  }

  function paymentExample() public payable {
    totalPaidIn += msg.value;
    emit ExternalContractPaid('External Contract was paid!', msg.value);
  }
}
