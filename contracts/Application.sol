pragma solidity ^0.4.23;
import "./AccessControl.sol";
import { OPCToken } from "./OPCToken.sol";


contract Application is AccessControl {

    address public submissionAddress;

    address public fundingApplicationAddress;

    string public applicationName;

    string public description;

    bool public isOpenToVote;

    uint public voteCount;

    OPCToken public opcToken;

    address public opcTokenAddress;

    address public paymentPipeAddress;

    event ApplicationOpenToVotes(
        string indexed _applicationName,
        address applicationAddress
    );

    event ApplicationClosedToVotes(
        string indexed _applicationName,
        address applicationAddress
    );

    event Info(
        bool trans
    );

    constructor(
        address _fundingApplication,
        address _submissionAddress,
        string _applicationName,
        string _description,
        address pipeAddress,
        address tokenAddress
    ) public {
        fundingApplicationAddress = _fundingApplication;
        submissionAddress = _submissionAddress;
        applicationName = _applicationName;
        description = _description;
        isOpenToVote = false;
        voteCount = 0;
        paymentPipeAddress = pipeAddress;
        opcTokenAddress = tokenAddress;
    }

    modifier transferTokensToPaymentPipe(uint numberOfTokens) {
        opcToken = OPCToken(opcTokenAddress);
        // opcToken.delegatecall(bytes4(sha3("approve(address,uint256)")), numberOfTokens);
        // 
        opcToken.approve(msg.sender, numberOfTokens);
        bool transferred = opcToken.transferFrom(msg.sender, paymentPipeAddress, numberOfTokens);
        emit Info(
            transferred
        );
        require(transferred);
        _;
    }

    modifier votingIsOpen() {
        require(isOpenToVote == true);
        _;
    }

    modifier isFundingApplicationsContract() {
        require(msg.sender == fundingApplicationAddress);
        _;
    }
    
    function setOPCTokenAddress(address tokenAddress) external onlyCLevel {
        opcTokenAddress = tokenAddress;
    }

    function setPaymentPipeAddress(address pipeAddress) external onlyCLevel {
        paymentPipeAddress = pipeAddress;
    }

    function openApplicationToVoting() external isFundingApplicationsContract {
        isOpenToVote = true;
        emit ApplicationOpenToVotes(
            applicationName,
            this
        );
    }

    function closeApplicationToVoting() external isFundingApplicationsContract {
        isOpenToVote = false;
        emit ApplicationClosedToVotes(
            applicationName,
            this
        );
    }

    function voteForApplication(
        uint numberOfTokens
    ) 
    external 
    transferTokensToPaymentPipe(numberOfTokens)
    votingIsOpen
    {
        voteCount = voteCount + numberOfTokens;
    }

    // suicide function
}
