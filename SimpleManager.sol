// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SimpleBoolContract.sol";

contract SimpleManager {
    mapping (address => SimpleBoolContract) public boolContracts;

    event ContractDeployed(address newContract, uint256 dueTime, string emailAddress);
    event ContractFunded(address contractAddress, string emailAddress);

    function checkContractFlag(address _contract) public view returns (bool) {
        return boolContracts[_contract].flag();
    }

    function fundContract(address _contract) public {
        boolContracts[_contract].fundContract();
        emit ContractFunded(_contract, boolContracts[_contract].emailAddress());
    }

    function updateContractFlag(address _contract) public {
        boolContracts[_contract].updateFlag();
    }

    function deplyContract(uint256 _time, string memory _emailAddress) public returns (address) {
        SimpleBoolContract newContract = new SimpleBoolContract(_time * 1000, _emailAddress);
        boolContracts[address(newContract)] = newContract;
        emit ContractDeployed(address(newContract), _time, _emailAddress);
        return address(newContract);
    }
}
