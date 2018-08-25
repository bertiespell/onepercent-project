pragma solidity ^0.4.23;


/// @title ExternalContractExample is used here as a placeholder so that the payment pipe can call an external contract
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
        emit ExternalContractPaid("External Contract was paid!", msg.value);
    }
}
