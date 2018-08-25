pragma solidity ^0.4.23;

import "./AccessControl.sol";
import { OPCToken } from "./OPCToken.sol";
import "./SafeMath.sol";


/// @title the PaymentPipe is used to pass payments to users and external contracts.
/// It passes on 99% of the original value and keeps 1% to use to fund projects.
/// In return is dispenses OPCTokens, which a user is able to spend in order to vote for different applications.
contract PaymentPipe is AccessControl {

    using SafeMath for uint;

    /// @dev storage variable used to hold the address of the most recent external contract being called    
    address externalContractAddress;

    /// @dev used to track the total funds submitted to the pipe
    uint public totalFunds;

    /// @dev used to track the owner of the payment pipe
    address public owner;

    /// @dev the opcToken. This is set in the constructor and used to transfer tokens from the payment pipe to users.
    /// @dev requires that the payment pipe has OPC tokens to spend - this is handled in the deployment script.
    OPCToken public opcToken;

    /// @dev an array to track recent funding winners to pay
    address[] public winnersToPay;

    /// @dev tracks the address of the funding application
    address public fundingApplicationAddress;

    /// @dev tracks whether the funding application address has been set
    /// this is initialised to false and is updated once the funding application is deployed, in the deployment script.
    bool public fundingApplicationAddressSet;

    /// @dev the minimum payment required to spend in order to receive an OPC token.
    uint public minimumPayment;

    /// @dev emitted whenever a winner is paid
    event WinnerPaid(
        address winner,
        uint amount
    );

    /// @dev emitted whenever a new address is set for the funding application contract
    event NewFundingApplicationAddressSet(
        address fundingApplicationAddress
    );

    /// @dev emitted when a new minimum payment is set
    event NewMinimumPaymentSet (
        uint newMininmumPayment
    );

    /// @dev emitted when the fallback is triggered
    event FallbackTriggered(
        address indexed sender,
        uint value
    );

    constructor(address _opcToken) public {
        // ---- Initialize owner address ----
        owner = msg.sender;
        // ---- Initialize the OPC token with the appropriate address ----
        opcToken = OPCToken(_opcToken);
        // ---- Initialize minimum payment value ----
        minimumPayment = 1000000000000000 wei;
        // ---- Initialize state of the funding application is not set ----
        fundingApplicationAddressSet = false;
        // ---- Initialize total funds ----
        totalFunds = 0;
    }

    /// @dev access modifier that restricts access to the funding application
    modifier onlyFundingApplication() {
        require(msg.sender == fundingApplicationAddress);
        _;
    }

    /// @dev modifier which ensures that the funding application address has been set
    modifier addressSetForFundingApplication() {
        require(fundingApplicationAddressSet == true);
        _;
    }

    /// @dev modifier to ensure that the balance is not 0
    modifier balanceIsNotZero() {
        require(address(this).balance > 0);
        _;
    }

    /// @dev fallback function
    function() public payable {
        // this registers an event so that we can know something went wrong with a call
        emit FallbackTriggered(msg.sender, msg.value);
    }

    /// @dev transfers the balance in the payment pipe to the winner
    /// @param winner The winner to pay
    function payWinner(
        address winner
    ) 
        external 
        addressSetForFundingApplication 
        onlyFundingApplication
        balanceIsNotZero
        whenNotPaused 
    {
        uint paymentAmount = address(this).balance;
        winner.transfer(paymentAmount);
        emit WinnerPaid(winner, paymentAmount);
    }

    /// @dev transfers the balance to multiple winners. These must be set via the setMultipleWinners method below
    /// @return void
    function payWinners() 
        external 
        addressSetForFundingApplication 
        onlyFundingApplication 
        balanceIsNotZero 
        whenNotPaused 
    {
        uint numberOfPlayers = winnersToPay.length;
        uint amountToPay = address(this).balance.div(numberOfPlayers);
        for (uint i = 0; i < numberOfPlayers; i++) {
            // pay the winner
            winnersToPay[i].transfer(amountToPay);
            emit WinnerPaid(winnersToPay[i], amountToPay);
        }
        delete winnersToPay;
    }

    /// @dev set multiple winners to pay. These can then be paid via the payWinners method above.
    /// @param winner A single winner address to pay. This may be called multiple times.
    function setMultipleWinners(
        address winner
    ) 
        external 
        addressSetForFundingApplication 
        onlyFundingApplication 
        whenNotPaused 
    {
        winnersToPay.push(winner);
    }

    /// @dev sets the address of the funding application.
    /// This address is used in the modifier onlyFundingApplication above.
    /// This restricts access of certain methods (setting and paying winners) to the funding application address.
    /// @param _fundingApplicationAddress the address of the funding application
    function setFundingApplicationAddress(
        address _fundingApplicationAddress
    ) 
        public 
        onlyCLevel 
        whenNotPaused 
    {
        fundingApplicationAddress = _fundingApplicationAddress;
        fundingApplicationAddressSet = true;
        emit NewFundingApplicationAddressSet(_fundingApplicationAddress);
    }

    /// @dev sets a new minimum payment amount requires to receive an OPC token.
    /// This amount is checked in the payAccountWithOnePercentTax and callUntrustedContractWithOnePercentTax.
    /// @param newAmount a uint representing the new minimum amount required to receive a token from the payment pipe.
    function setNewMinimumPayment(
        uint newAmount
    ) 
        public 
        onlyCLevel 
        whenNotPaused 
    {
        minimumPayment = newAmount;
        emit NewMinimumPaymentSet(newAmount);
    }

    /// @dev this is the main method a user interacts with.
    /// They pass through the address that they ultimately want to pay.
    /// Passes 99% of the value on
    /// Keeps 1% within the payment pipe for later use to pay winners of the funding application
    /// @param externalAccount an external account to pay
    function payAccountWithOnePercentTax(
        address externalAccount
    ) 
        public 
        payable 
        whenNotPaused 
    {
        uint onePercent = msg.value/100;
        uint totalToSend = msg.value - onePercent;
        if (checkPaymentIsHighEnoughForToken()) {
            totalFunds += onePercent;
            opcToken.transfer(msg.sender, 1);
        }
        externalAccount.transfer(totalToSend);
    }

    /// @dev this is the other main method a user interacts with.
    /// They pass through the contract address that they ultimately want to pay.
    /// Passes 99% of the value on
    /// Keeps 1% within the payment pipe for later use to pay winners of the funding application.
    /// UNTRUSTED
    /// @param externalAccount an external account to pay
    /// @param methodNameSignature is the signature of the method to call on the external contract.
    function callUntrustedContractWithOnePercentTax(
        address externalAccount, 
        string methodNameSignature
    ) 
        public 
        payable 
        whenNotPaused 
    {
        uint onePercent = msg.value/100;
        uint totalToSend = msg.value - onePercent;
        externalContractAddress = externalAccount;

        if (checkPaymentIsHighEnoughForToken()) {
            totalFunds += onePercent;
            opcToken.transfer(msg.sender, 1);
        }
        //  I couldn't find a way to alter the amount of ether to send 
        // and delegate the call without using assembly code
        bytes4 sig = bytes4(keccak256(methodNameSignature));
        assembly {
            // move pointer to free memory spot
            let ptr := mload(0x40)
            // put function sig at memory spot
            mstore(ptr, sig)

            let result := call(
                15000, // gas limit
                sload(externalContractAddress_slot),  // to addr. append var to _slot to access storage variable
                totalToSend, // amount of ether to transfer
                ptr, // Inputs are stored at location ptr
                0x24, // Inputs are 36 bytes long
                ptr,  //Store output over input
                0x20
                ) //Outputs are 32 bytes long

            if eq(result, 0) {
                revert(0, 0)
            }

            mstore(0x40, add(ptr, 0x24)) // Set storage pointer to new space
        }
    }

    /// @dev used to retrieve the amount of funds that have been paid into the payment pipe.
    /// This is useful for the front-end to show the users globally generated amount
    /// @return uint of the total funds
    function getTotalFunds() 
        public 
        view 
        returns (uint) 
    {
        return totalFunds;
    }

    /// @dev this method calls selfdestruct() and removes the contract from the blockchain.
    /// Access is limited to the CEO. 
    function kill() 
        public 
        onlyCEO 
    {
        selfdestruct(this);
    }

    /// @dev checks whether a user is attempting to transfer the minimum payment required to receive OPC tokens. 
    function checkPaymentIsHighEnoughForToken() 
        internal 
        view 
        returns (bool) 
    {
        return msg.value >= minimumPayment;
    }
}
