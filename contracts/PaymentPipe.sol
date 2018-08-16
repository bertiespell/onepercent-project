pragma solidity ^0.4.23;

import "./AccessControl.sol";
import { OPCToken } from "./OPCToken.sol";


contract PaymentPipe is AccessControl {

    address externalContractAddress;

    mapping(address => uint) public coinBalances;

    uint public totalFunds;

    address public owner;

    OPCToken public opcToken;

    event FallbackTriggered(
        address indexed sender,
        uint value
    );

    constructor(address _opcToken) public {
        owner = msg.sender;
        opcToken = OPCToken(_opcToken);
    }

    function() public payable {
        // this registers an event so that we can know something went wrong with a call
        emit FallbackTriggered(msg.sender, msg.value);
    }

    function payAccountWithOnePercentTax(address externalAccount) public payable {
        uint onePercent = msg.value/100;
        totalFunds += onePercent;
        uint totalToSend = msg.value - onePercent;
        opcToken.transfer(msg.sender, 1);
        externalAccount.transfer(totalToSend);
    }

    function callExternalContractWithOnePercentTax(address externalAccount, string methodNameSignature) public payable {
        uint onePercent = msg.value/100;
        totalFunds += onePercent;
        uint totalToSend = msg.value - onePercent;
        externalContractAddress = externalAccount;

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
        opcToken.transfer(msg.sender, 1);
    }

    function getTotalFunds() public view returns (uint) {
        return totalFunds;
    }

    function issueRefund(address accountToRefund, uint amount) public onlyCLevel {
      // TODO: this function makes no sense 
        totalFunds -= amount;
        accountToRefund.transfer(amount);
    }

    function payOut(address accountToPay, uint amountToPay) public onlyCLevel {
        totalFunds -= amountToPay;
        accountToPay.transfer(amountToPay);
    }
}
