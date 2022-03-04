// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPTokenTest is ERC20 {
    constructor(uint256 initialSupply) ERC20("LP Token", "LP_TOKEN") {
        _mint(msg.sender, initialSupply);
    }
}

contract MyTokenTest is ERC20 {
    constructor(uint256 initialSupply) ERC20("My Token", "MY_TOKEN") {
        _mint(msg.sender, initialSupply);
    }
}
