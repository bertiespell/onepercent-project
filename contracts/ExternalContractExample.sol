pragma solidity ^0.4.23;


/// @title ExternalContractExample is used here as a placeholder so that the payment pipe can call an external contract
contract ExternalContractExample {

    uint public totalPaidIn;

    /// @dev emitted when a payment is made
    event ExternalContractPaid(
        string _message,
        uint amount
    );

    constructor () public {
        totalPaidIn = 10;
    }

    /// @dev an example payable method to interact with the payment pipe
    function paymentExample() 
        public 
        payable 
    {
        totalPaidIn += msg.value;
        emit ExternalContractPaid("External Contract was paid!", msg.value);
    }
}
