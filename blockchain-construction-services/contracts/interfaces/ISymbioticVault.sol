// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISymbioticVault
 * @dev Interface for Symbiotic Vault interactions
 * Defines the standard methods expected from a Symbiotic vault implementation
 */
interface ISymbioticVault {
    /**
     * @dev Deposit assets into the vault
     * @param asset The asset address to deposit
     * @param amount The amount to deposit
     * @return shares The number of shares minted
     */
    function deposit(address asset, uint256 amount) external returns (uint256 shares);

    /**
     * @dev Withdraw assets from the vault
     * @param asset The asset address to withdraw
     * @param shares The number of shares to burn
     * @return amountOut The amount of assets withdrawn
     */
    function withdraw(address asset, uint256 shares) external returns (uint256 amountOut);

    /**
     * @dev Get total assets in the vault for a specific asset
     * @param asset The asset address
     * @return Total assets amount
     */
    function totalAssets(address asset) external view returns (uint256);

    /**
     * @dev Get total shares issued by the vault
     * @return Total shares amount
     */
    function totalShares() external view returns (uint256);

    /**
     * @dev Get shares owned by a specific address
     * @param account The account address
     * @return Shares amount
     */
    function sharesOf(address account) external view returns (uint256);
}
