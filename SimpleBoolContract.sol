// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleBoolContract {
    bool public flag;
    uint256 public dueTime;
    string public emailAddress;
    bool public isFunded;

    constructor(uint256 _duration, string memory _emailAddress) {
        flag = true;
        emailAddress = _emailAddress;
        dueTime = block.timestamp + _duration;
        isFunded = false;
    }

    function fundContract() public {
        isFunded = true;
    }
    

    function checkDueTime() public view returns (bool) {
        return block.timestamp > dueTime;
    }

    function updateFlag() public {
        flag = false;
    }
}
