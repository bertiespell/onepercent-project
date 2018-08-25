pragma solidity ^0.4.23;

import "./AccessControl.sol";
import { OPCToken } from "./OPCToken.sol";
import "./SafeMath.sol";


/// @title the PaymentPipe is used to pass payments to users and external contracts. It passes on 99% of the original value and keeps 1% to use to fund projects. In return is dispenses OPCTokens, which a user is able to spend in order to vote for different applications.
contract PaymentPipe is AccessControl {

    using SafeMath for uint;

    address externalContractAddress;

    mapping(address => uint) public coinBalances;

    uint public totalFunds;

    address public owner;

    OPCToken public opcToken;

    address[] public playersToPay;

    address public fundingApplicationAddress;
    bool public fundingApplicationAddressSet;

    uint public minimumPayment;

    event WinnerPaid(
        address winner,
        uint amount
    );

    event NewFundingApplicationAddressSet(
        address fundingApplicationAddress
    );

    event NewMinimumPaymentSet (
        uint newMininmumPayment
    );

    event FallbackTriggered(
        address indexed sender,
        uint value
    );

    constructor(address _opcToken) public {
        owner = msg.sender;
        opcToken = OPCToken(_opcToken);
        minimumPayment = 1000000000000000 wei;
        fundingApplicationAddressSet = false;
        totalFunds = 0;
    }

    modifier onlyFundingApplication() {
        require(msg.sender == fundingApplicationAddress);
        _;
    }

    modifier addressSetForFundingApplication() {
        require(fundingApplicationAddressSet == true);
        _;
    }

    modifier balanceIsNotZero() {
        require(address(this).balance > 0);
        _;
    }

    function() public payable {
        // this registers an event so that we can know something went wrong with a call
        emit FallbackTriggered(msg.sender, msg.value);
    }

    /** @dev transfers the balance in the payment pipe to the winner
     * @param winner The winner to pay
     * @return void
     */
    function payWinner(
        address winner
    ) 
    external 
    addressSetForFundingApplication 
    onlyFundingApplication balanceIsNotZero {
        uint paymentAmount = address(this).balance;
        winner.transfer(paymentAmount);
        emit WinnerPaid(winner, paymentAmount);
    }

    /** @dev transfers the balance to multiple winners. These must be set via the setMultipleWinners method below
     * @return void
     */
    function payWinners() external addressSetForFundingApplication onlyFundingApplication balanceIsNotZero {
        uint numberOfPlayers = playersToPay.length;
        uint amountToPay = address(this).balance.div(numberOfPlayers);
        for (uint i = 0; i < numberOfPlayers; i++) {
            // pay the winner
            playersToPay[i].transfer(amountToPay);
            emit WinnerPaid(playersToPay[i], amountToPay);
        }
        delete playersToPay;
    }

    /** @dev set multiple winners to pay. These can then be paid via the payWinners method above.
     * @param winner A single winner address to pay. This may be called multiple times.
     */
    function setMultipleWinners(address winner) external addressSetForFundingApplication onlyFundingApplication {
        playersToPay.push(winner);
    }

    /** @dev sets the address of the funding application. This address is used in the modifier onlyFundingApplication above. This restricts access of certain methods (setting and paying winners) to the funding application address.
     * @param _fundingApplicationAddress
     */
    function setFundingApplicationAddress(address _fundingApplicationAddress) public onlyCLevel {
        fundingApplicationAddress = _fundingApplicationAddress;
        fundingApplicationAddressSet = true;
        emit NewFundingApplicationAddressSet(_fundingApplicationAddress);
    }

    /** @dev sets a new minimum payment amount requires to receive an OPC token. This amount is checked in the payAccountWithOnePercentTax and callUntrustedContractWithOnePercentTax methods below.
     * @param newAmount a uint representing the new minimum amount a user needs to send in order to receive a token from the payment pipe.
     */
    function setNewMinimumPayment(uint newAmount) public onlyCLevel {
        minimumPayment = newAmount;
        emit NewMinimumPaymentSet(newAmount);
    }

    /** @dev this is the main method a user interacts with. They pass through the address that they ultimately want to pay. This methods passes 99% of the value on and keeps 1% within the payment pipe for later use to pay winners of the funding application
     * @param externalAccount an external account to pay
     */
    function payAccountWithOnePercentTax(address externalAccount) public payable {
        uint onePercent = msg.value/100;
        uint totalToSend = msg.value - onePercent;
        if (checkPaymentIsHighEnoughForToken()) {
            totalFunds += onePercent;
            opcToken.transfer(msg.sender, 1);
        }
        externalAccount.transfer(totalToSend);
    }

    /** @dev this is the other main method a user interacts with. They pass through the contract address that they ultimately want to pay. This methods passes 99% of the value on and keeps 1% within the payment pipe for later use to pay winners of the funding application.
     * UNTRUSTED
     * @param externalAccount an external account to pay
     * @param methodNameSignature is the signature of the method to call on the external contract.
     */
    function callUntrustedContractWithOnePercentTax(
        address externalAccount, 
        string methodNameSignature
    ) public payable {
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

    /** @dev used to retrieve the amount of funds that have been paid into the payment pipe. This is useful for the front-end to show the users globally generated amonut
     */
    function getTotalFunds() public view returns (uint) {
        return totalFunds;
    }

    /** @dev this method calls selfdestruct() and removes the contract from the blockchain. Access is limited to the CEO. 
     */
    function kill() public onlyCEO {
        selfdestruct(this);
    }

    /** @dev this internal method checks whether a user is attempting to transfer the minimum payment required to receive OPC tokens. 
     */
    function checkPaymentIsHighEnoughForToken() internal view returns (bool) {
        return msg.value >= minimumPayment;
    }
}
