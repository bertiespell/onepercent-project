pragma solidity ^0.4.23;
import "./AccessControl.sol";
import "./SafeMath.sol";


contract FundingApplications is AccessControl {
    using SafeMath for uint256;

    bool public applicationsOpen;
    bool public votingOpen;

    constructor() public {
        applicationsOpen = false;
        votingOpen = false;
    }

    modifier applicationsClosed() {
        require(applicationsOpen == false);
        _;
    }

    modifier votingClosed() {
        require(votingOpen == false);
        _;
    }

    function openApplications() external onlyCLevel votingClosed {
        applicationsOpen = true;
    }

    function closeApplications() external onlyCLevel {
        applicationsOpen = false;       
    }

    function openVoting() external onlyCLevel applicationsClosed {
        votingOpen = true;
    }

    function closeVoting() external onlyCLevel {
        votingOpen = false;       
    }
}