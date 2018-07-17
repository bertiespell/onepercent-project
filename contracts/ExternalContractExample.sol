pragma solidity ^0.4.23;

contract PayableExample {

  uint public totalPaidIn;

  constructor () {
    totalPaidIn = 0;
  }

  function paymentExample(uint amount) public payable {
    totalPaidIn += msg.value;
  }
}
