// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * Simple MockSymbioticVault for local testing:
 * - deposit() takes tokens from msg.sender and mints 1:1 shares
 * - withdraw() burns shares and returns amount to caller
 * - totalAssets(address) returns total deposited
 *
 * WARNING: Mock is for local dev/testing ONLY.
 */
contract MockSymbioticVault {
    IERC20 public asset;
    uint256 public totalDeposited;
    uint256 private _totalShares;

    mapping(address => uint256) public sharesOf;

    constructor(address _asset) {
        asset = IERC20(_asset);
    }

    /// deposit tokens; returns minted shares (1:1 in mock)
    function deposit(address, uint256 amount) external returns (uint256 shares) {
        require(amount > 0, "amount=0");
        require(asset.transferFrom(msg.sender, address(this), amount), "transferFrom failed");
        shares = amount;
        sharesOf[msg.sender] += shares;
        _totalShares += shares;
        totalDeposited += amount;
        return shares;
    }

    /// withdraw shares; returns amountOut
    function withdraw(address, uint256 shares) external returns (uint256 amountOut) {
        require(sharesOf[msg.sender] >= shares, "insufficient shares");
        sharesOf[msg.sender] -= shares;
        _totalShares -= shares;
        amountOut = shares; // 1:1 in mock
        totalDeposited -= amountOut;
        require(asset.transfer(msg.sender, amountOut), "transfer failed");
        return amountOut;
    }

    function totalAssets(address) external view returns (uint256) {
        return totalDeposited;
    }

    function totalShares() external view returns (uint256) {
        return _totalShares;
    }
}
