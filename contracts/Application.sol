pragma solidity ^0.4.23;
import "./AccessControl.sol";
import { OPCToken } from "./OPCToken.sol";
import "./SafeMath.sol";


/// @title Encapsulates a users funding application data and the number of votes
contract Application is AccessControl {

    using SafeMath for uint256;

    /// @dev the address of the account that submitted the application
    // this is the address which will be reimbursed if the application wins the voting round
    address public submissionAddress;

    /// @dev the address of the FundingApplication
    /// used to restrict access to certain functionality
    address public fundingApplicationAddress;

    /// @dev user inputted name
    string public applicationName;

    /// @dev a short description of the project
    string public description;

    /// @dev determined whether the application is open to be voted on
    bool public isOpenToVote;

    /// @dev tracks the vote count
    uint public voteCount;

    /// @dev here we define the opcToken in order to transfer tokens during voting
    OPCToken public opcToken;

    /// @dev the address of the OPCToken
    address public opcTokenAddress;

    /// @dev the address of the payment pipe
    address public paymentPipeAddress;

    /// @dev emitted when the application becomes open to voting
    event ApplicationOpenToVotes(
        string indexed _applicationName,
        address applicationAddress
    );

    /// @dev emitted when the application becomes close to voting
    event ApplicationClosedToVotes(
        string indexed _applicationName,
        address applicationAddress
    );

    constructor(
        address _fundingApplication,
        address _submissionAddress,
        string _applicationName,
        string _description,
        address pipeAddress,
        address tokenAddress
    ) public {
        // ---- Initialize addresses needed for functionality in contract ----
        fundingApplicationAddress = _fundingApplication;
        submissionAddress = _submissionAddress;
        applicationName = _applicationName;
        description = _description;
        /// default voting to false initially
        isOpenToVote = false;
        voteCount = 0;
        paymentPipeAddress = pipeAddress;
        opcTokenAddress = tokenAddress;
    }

    /// @dev modifier used to restrict access to the Funding Application contract
    modifier isFundingApplication() {
        require(msg.sender == fundingApplicationAddress);
        _;
    }

    /// @dev modifer used to transfer the OPC tokens back to the payment pipe
    modifier transferTokensToPaymentPipe(uint numberOfTokens) {
        opcToken = OPCToken(opcTokenAddress);
        /// requires that the opc tokens be approved first
        opcToken.approve(msg.sender, numberOfTokens);
        bool transferred = opcToken.transferFrom(msg.sender, paymentPipeAddress, numberOfTokens);
        require(transferred);
        _;
    }

    /// @dev modifier used to ensure application is open to votes
    modifier votingIsOpen() {
        require(isOpenToVote == true);
        _;
    }

    /// @dev access modifier to ensure the calling contract is the FundingApplication
    modifier isFundingApplicationsContract() {
        require(msg.sender == fundingApplicationAddress);
        _;
    }
    
    /// @dev used to set new OPC Token address
    /// restricted to C level addresses
    function setOPCTokenAddress(address tokenAddress) 
        external 
        onlyCLevel 
        whenNotPaused
    {
        opcTokenAddress = tokenAddress;
    }

    /// @dev used to set new Payment Pipe address
    /// restricted to C level addresses
    function setPaymentPipeAddress(address pipeAddress) 
        external 
        onlyCLevel 
        whenNotPaused
    {
        paymentPipeAddress = pipeAddress;
    }

    /// @dev opens the application to voting
    /// can only be called by the FundingApplication
    function openApplicationToVoting() 
        external 
        isFundingApplicationsContract 
        whenNotPaused
    {
        isOpenToVote = true;
        emit ApplicationOpenToVotes(
            applicationName,
            this
        );
    }

    /// @dev closes the application to voting
    /// can only be called by the FundingApplication
    function closeApplicationToVoting() 
        external 
        isFundingApplicationsContract 
        whenNotPaused
    {
        isOpenToVote = false;
        emit ApplicationClosedToVotes(
            applicationName,
            this
        );
    }

    /// @dev used to vote for an application
    /// @param numberOfTokens the number of OPCTokens to use - these are translated to votes
    function voteForApplication(
        uint numberOfTokens
    ) 
        external 
        transferTokensToPaymentPipe(numberOfTokens)
        votingIsOpen
        whenNotPaused
    {
        voteCount = voteCount + numberOfTokens;
    }

    /// @dev this method calls selfdestruct() and removes the contract from the blockchain.
    /// Access is limited to the funding applications. 
    function kill() 
        external 
        isFundingApplication 
        whenNotPaused
    {
        selfdestruct(this);
    }
}
