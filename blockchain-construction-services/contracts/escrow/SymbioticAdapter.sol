// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ISymbioticVault } from "../interfaces/ISymbioticVault.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * Adapter that allows EscrowVault to deposit/withdraw from an external vault (Symbiotic Vault).
 * The adapter stores shares per escrowId to be able to withdraw proportionally later.
 */
contract SymbioticAdapter {
    using SafeERC20 for IERC20;

    ISymbioticVault public immutable vault;
    IERC20 public immutable asset;

    // tracks shares minted for each escrow id
    mapping(uint256 => uint256) public escrowShares;
    // total shares recorded by adapter (for simple accounting / debug)
    uint256 public totalAdapterShares;

    event DepositedToVault(uint256 indexed escrowId, uint256 amount, uint256 shares);
    event WithdrewFromVault(uint256 indexed escrowId, uint256 shares, uint256 amountOut);

    constructor(address _vault, address _asset) {
        vault = ISymbioticVault(_vault);
        asset = IERC20(_asset);
    }

    function depositForEscrow(uint256 escrowId, uint256 amount) external returns (uint256 shares) {
        require(amount > 0, "amount=0");
        // adapter must be approved by escrow to move asset from escrow contract
        asset.safeIncreaseAllowance(address(vault), amount);
        shares = vault.deposit(address(asset), amount);
        escrowShares[escrowId] += shares;
        totalAdapterShares += shares;
        emit DepositedToVault(escrowId, amount, shares);
        return shares;
    }

    function withdrawForEscrow(uint256 escrowId, uint256 amountNeeded) external returns (uint256 amountOut) {
        uint256 totalAssets = vault.totalAssets(address(asset));
        uint256 totalShares = vault.totalShares();
        require(totalAssets > 0 && totalShares > 0, "vault empty");

        // compute shares to cover amountNeeded (ceil)
        uint256 shares = (amountNeeded * totalShares + totalAssets - 1) / totalAssets;
        if (shares > escrowShares[escrowId]) {
            shares = escrowShares[escrowId];
        }

        amountOut = vault.withdraw(address(asset), shares);
        escrowShares[escrowId] -= shares;
        totalAdapterShares -= shares;
        emit WithdrewFromVault(escrowId, shares, amountOut);
        return amountOut;
    }
}
