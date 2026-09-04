// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.13;

interface IOracle {
    function price() external view returns (uint256);
}

contract SettableOracle is IOracle {
    error NotOwner();

    address public immutable owner;
    uint256 public override price;

    constructor() {
        owner = msg.sender;
    }

    function setPrice(uint256 newPrice) external {
        if (msg.sender != owner) revert NotOwner();
        price = newPrice;
    }
}

contract SettableOraclePoc {
    function test_DeployerCanChangeTheReportedPrice() public {
        SettableOracle oracle = new SettableOracle();

        oracle.setPrice(1e36);
        require(oracle.price() == 1e36, "initial price not set");

        oracle.setPrice(2e36);
        require(oracle.price() == 2e36, "price not changed");
    }
}
