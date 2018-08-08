pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "./AccessControl.sol";
import "../installed_contracts/zeppelin/contracts/token/StandardToken.sol";
// import '../installed_contracts/zeppelin/math/SafeMath.sol';

contract OPCToken is AccessControl, StandardToken {

    bool public open;
    address public owner;

    struct FundingApplication {
        address addr;
        uint amount;
    }

    FundingApplication[] fundingApplications;

    // currently a limitiation of this implementation is that an address can only apply for funding once
    // this is to avoid storing all addresses
    mapping(address => uint) votes;

    uint votingIndex = 0;

    constructor() {
        owner = msg.sender;
        open = false;
    }

    modifier openForApplications() {
        require(open == true);
        _;
    }

    modifier onlySingleApplications() {
        bool senderFound = false;
        uint arrayLength = fundingApplications.length;
        for (uint i = votingIndex; i < arrayLength; i++) {
            if (fundingApplications[i].addr == msg.sender) {
                senderFound = true;
            }
        }
        require(senderFound == false);
        _;
    }

    function openApplications() external onlyCLevel {
        open = true;
    }

    function closeFunding() external onlyCLevel {
        open = false;
        votingIndex = fundingApplications.length; // we reset the votingIndex so we know where to search from during the next set of interactions
        // this is because delete operations are most costly - and any further searches would have to search through the entire stack otherwise
    }

    function submitFundingApplication(uint requestedAmount) external openForApplications onlySingleApplications {
        fundingApplications.push(FundingApplication(
            msg.sender,
            requestedAmount
        ));
    }

    function voteForApplication(FundingApplication fundingApplication, uint tokenAmount) {
        // remove tokens from the user
        require(transferFrom(msg.sender, this, tokenAmount));
        // increment the votes 
        votes[fundingApplication.addr] += tokenAmount;

        // pass on number of votes to the funding application
    }

    function deliverFundsToWinner() external onlyCLevel {
        // find the application with the most votes

        delete fundingApplications; // reset all funding Applications
    }
}