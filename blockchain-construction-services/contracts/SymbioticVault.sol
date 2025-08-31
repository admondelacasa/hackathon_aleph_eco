// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SymbioticVault
 * @dev Tranche-Based Yield Vault for Symbiotic Network
 * Enables shared security across multiple networks with risk-based yield tranches
 */
contract SymbioticVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Vault Configuration
    struct VaultConfig {
        IERC20 stakingToken;
        uint256 minStakeAmount;
        uint256 maxTotalStake;
        uint256 withdrawalDelay;
        uint256 slashingWindow;
        bool isActive;
    }

    // Tranche Configuration
    struct Tranche {
        string name;
        uint256 riskLevel; // 1-10 (1 = lowest risk, 10 = highest risk)
        uint256 expectedYield; // Annual percentage yield in basis points
        uint256 totalStaked;
        uint256 maxCapacity;
        uint256 minStake;
        bool isActive;
    }

    // Staker Information
    struct StakerInfo {
        uint256 totalStaked;
        uint256 activeTrancheId;
        uint256 stakingTimestamp;
        uint256 withdrawalRequestTimestamp;
        uint256 pendingWithdrawal;
        uint256 earnedRewards;
        bool isSlashed;
        mapping(uint256 => uint256) trancheStakes;
    }

    // Network Security Request
    struct SecurityRequest {
        address network;
        uint256 securityAmount;
        uint256 duration;
        uint256 premiumRate;
        uint256 collateralRatio;
        bool isActive;
        bool isFulfilled;
    }

    // Events
    event Staked(address indexed staker, uint256 trancheId, uint256 amount);
    event WithdrawalRequested(address indexed staker, uint256 amount);
    event Withdrawn(address indexed staker, uint256 amount);
    event RewardsClaimed(address indexed staker, uint256 amount);
    event TrancheCreated(uint256 indexed trancheId, string name, uint256 riskLevel);
    event SecurityProvided(address indexed network, uint256 amount, uint256 premium);
    event SlashingOccurred(address indexed staker, uint256 amount, string reason);

    // State Variables
    VaultConfig public vaultConfig;
    uint256 public totalStaked;
    uint256 public totalRewards;
    uint256 public nextTrancheId;
    uint256 public nextSecurityRequestId;

    mapping(uint256 => Tranche) public tranches;
    mapping(address => StakerInfo) public stakers;
    mapping(uint256 => SecurityRequest) public securityRequests;
    mapping(address => bool) public authorizedNetworks;
    
    // Symbiotic Network Integration
    address public symbioticCore;
    address public relaySDK;
    
    // LayerZero Integration
    address public layerZeroEndpoint;
    mapping(uint16 => bytes) public trustedRemoteLookup;

    constructor(
        address _stakingToken,
        uint256 _minStakeAmount,
        uint256 _maxTotalStake,
        address _symbioticCore,
        address _layerZeroEndpoint
    ) {
        vaultConfig = VaultConfig({
            stakingToken: IERC20(_stakingToken),
            minStakeAmount: _minStakeAmount,
            maxTotalStake: _maxTotalStake,
            withdrawalDelay: 7 days,
            slashingWindow: 30 days,
            isActive: true
        });

        symbioticCore = _symbioticCore;
        layerZeroEndpoint = _layerZeroEndpoint;
        
        // Initialize default tranches
        _createTranche("Conservative", 2, 800, 10000 ether, 10 ether); // 8% APY
        _createTranche("Balanced", 5, 1200, 5000 ether, 50 ether);    // 12% APY  
        _createTranche("Aggressive", 8, 2000, 2000 ether, 100 ether); // 20% APY
    }

    /**
     * @dev Create a new risk tranche
     */
    function createTranche(
        string memory _name,
        uint256 _riskLevel,
        uint256 _expectedYield,
        uint256 _maxCapacity,
        uint256 _minStake
    ) external onlyOwner {
        _createTranche(_name, _riskLevel, _expectedYield, _maxCapacity, _minStake);
    }

    function _createTranche(
        string memory _name,
        uint256 _riskLevel,
        uint256 _expectedYield,
        uint256 _maxCapacity,
        uint256 _minStake
    ) internal {
        require(_riskLevel >= 1 && _riskLevel <= 10, "Invalid risk level");
        
        uint256 trancheId = nextTrancheId++;
        tranches[trancheId] = Tranche({
            name: _name,
            riskLevel: _riskLevel,
            expectedYield: _expectedYield,
            totalStaked: 0,
            maxCapacity: _maxCapacity,
            minStake: _minStake,
            isActive: true
        });

        emit TrancheCreated(trancheId, _name, _riskLevel);
    }

    /**
     * @dev Stake tokens in a specific tranche
     */
    function stakeInTranche(uint256 _trancheId, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(tranches[_trancheId].isActive, "Tranche not active");
        require(_amount >= tranches[_trancheId].minStake, "Below minimum stake");
        require(
            tranches[_trancheId].totalStaked + _amount <= tranches[_trancheId].maxCapacity,
            "Tranche capacity exceeded"
        );
        require(totalStaked + _amount <= vaultConfig.maxTotalStake, "Vault capacity exceeded");

        StakerInfo storage staker = stakers[msg.sender];
        
        // Transfer tokens
        vaultConfig.stakingToken.safeTransferFrom(msg.sender, address(this), _amount);

        // Update staker info
        staker.totalStaked += _amount;
        staker.trancheStakes[_trancheId] += _amount;
        staker.activeTrancheId = _trancheId;
        staker.stakingTimestamp = block.timestamp;

        // Update tranche and vault totals
        tranches[_trancheId].totalStaked += _amount;
        totalStaked += _amount;

        emit Staked(msg.sender, _trancheId, _amount);
    }

    /**
     * @dev Request withdrawal from vault
     */
    function requestWithdrawal(uint256 _amount) external nonReentrant {
        StakerInfo storage staker = stakers[msg.sender];
        require(staker.totalStaked >= _amount, "Insufficient staked amount");
        require(staker.pendingWithdrawal == 0, "Withdrawal already pending");

        staker.pendingWithdrawal = _amount;
        staker.withdrawalRequestTimestamp = block.timestamp;

        emit WithdrawalRequested(msg.sender, _amount);
    }

    /**
     * @dev Complete withdrawal after delay period
     */
    function withdraw() external nonReentrant {
        StakerInfo storage staker = stakers[msg.sender];
        require(staker.pendingWithdrawal > 0, "No pending withdrawal");
        require(
            block.timestamp >= staker.withdrawalRequestTimestamp + vaultConfig.withdrawalDelay,
            "Withdrawal delay not met"
        );

        uint256 amount = staker.pendingWithdrawal;
        uint256 trancheId = staker.activeTrancheId;

        // Update state
        staker.totalStaked -= amount;
        staker.pendingWithdrawal = 0;
        staker.trancheStakes[trancheId] -= amount;
        
        tranches[trancheId].totalStaked -= amount;
        totalStaked -= amount;

        // Transfer tokens
        vaultConfig.stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Provide security to external network
     */
    function provideSecurityToNetwork(
        address _network,
        uint256 _securityAmount,
        uint256 _duration,
        uint256 _premiumRate
    ) external returns (uint256) {
        require(authorizedNetworks[_network], "Network not authorized");
        require(_securityAmount <= totalStaked, "Insufficient total stake");

        uint256 requestId = nextSecurityRequestId++;
        securityRequests[requestId] = SecurityRequest({
            network: _network,
            securityAmount: _securityAmount,
            duration: _duration,
            premiumRate: _premiumRate,
            collateralRatio: 150, // 150% collateralization
            isActive: true,
            isFulfilled: false
        });

        // Calculate and distribute premiums to stakers
        uint256 totalPremium = (_securityAmount * _premiumRate * _duration) / (365 days * 10000);
        _distributePremiums(totalPremium);

        emit SecurityProvided(_network, _securityAmount, totalPremium);
        return requestId;
    }

    /**
     * @dev Distribute premiums to stakers based on tranche and risk
     */
    function _distributePremiums(uint256 _totalPremium) internal {
        // Implementation for premium distribution across tranches
        // Higher risk tranches get proportionally more premiums
        totalRewards += _totalPremium;
    }

    /**
     * @dev Slash stakers in case of network security breach
     */
    function slashStakers(
        address[] calldata _stakers,
        uint256[] calldata _amounts,
        string calldata _reason
    ) external onlyOwner {
        require(_stakers.length == _amounts.length, "Array length mismatch");

        for (uint256 i = 0; i < _stakers.length; i++) {
            StakerInfo storage staker = stakers[_stakers[i]];
            require(staker.totalStaked >= _amounts[i], "Insufficient stake to slash");

            staker.totalStaked -= _amounts[i];
            staker.isSlashed = true;
            totalStaked -= _amounts[i];

            // Update tranche totals
            uint256 trancheId = staker.activeTrancheId;
            tranches[trancheId].totalStaked -= _amounts[i];

            emit SlashingOccurred(_stakers[i], _amounts[i], _reason);
        }
    }

    /**
     * @dev Calculate rewards for a staker
     */
    function calculateRewards(address _staker) public view returns (uint256) {
        StakerInfo storage staker = stakers[_staker];
        if (staker.totalStaked == 0) return 0;

        uint256 trancheId = staker.activeTrancheId;
        uint256 stakingDuration = block.timestamp - staker.stakingTimestamp;
        uint256 annualYield = tranches[trancheId].expectedYield;
        
        return (staker.totalStaked * annualYield * stakingDuration) / (365 days * 10000);
    }

    /**
     * @dev Claim earned rewards
     */
    function claimRewards() external nonReentrant {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards to claim");

        stakers[msg.sender].earnedRewards += rewards;
        
        // Mint or transfer reward tokens
        // Implementation depends on reward token mechanism
        
        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @dev LayerZero cross-chain messaging for shared security
     */
    function sendSecurityUpdate(
        uint16 _dstChainId,
        bytes calldata _payload
    ) external payable {
        // LayerZero cross-chain communication
        // Implementation for sending security updates across chains
    }

    // Admin functions
    function authorizeNetwork(address _network) external onlyOwner {
        authorizedNetworks[_network] = true;
    }

    function updateTrancheCapacity(uint256 _trancheId, uint256 _newCapacity) external onlyOwner {
        tranches[_trancheId].maxCapacity = _newCapacity;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // View functions
    function getTrancheInfo(uint256 _trancheId) external view returns (Tranche memory) {
        return tranches[_trancheId];
    }

    function getStakerInfo(address _staker) external view returns (
        uint256 totalStaked,
        uint256 activeTrancheId,
        uint256 pendingWithdrawal,
        uint256 earnedRewards,
        bool isSlashed
    ) {
        StakerInfo storage staker = stakers[_staker];
        return (
            staker.totalStaked,
            staker.activeTrancheId,
            staker.pendingWithdrawal,
            staker.earnedRewards,
            staker.isSlashed
        );
    }

    function getTotalValueLocked() external view returns (uint256) {
        return totalStaked;
    }

    function getTrancheUtilization(uint256 _trancheId) external view returns (uint256) {
        Tranche memory tranche = tranches[_trancheId];
        if (tranche.maxCapacity == 0) return 0;
        return (tranche.totalStaked * 100) / tranche.maxCapacity;
    }
}
