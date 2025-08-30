// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingRewards is ReentrancyGuard, Ownable {
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
    }

    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public authorizedContracts;
    
    uint256 public totalStaked;
    uint256 public rewardRate = 500; // 5% APY
    uint256 public constant REWARD_PRECISION = 10000;
    uint256 public lastRewardTime;
    uint256 public accRewardPerShare;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ContractAuthorized(address indexed contractAddr, bool authorized);

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() {
        lastRewardTime = block.timestamp;
    }

    function authorizeContract(address contractAddr, bool authorized) external onlyOwner {
        authorizedContracts[contractAddr] = authorized;
        emit ContractAuthorized(contractAddr, authorized);
    }

    function updateRewards() internal {
        if (totalStaked == 0) {
            lastRewardTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - lastRewardTime;
        uint256 reward = (totalStaked * rewardRate * timeElapsed) / (365 days * REWARD_PRECISION);
        accRewardPerShare += (reward * 1e12) / totalStaked;
        lastRewardTime = block.timestamp;
    }

    function stake() external payable onlyAuthorized nonReentrant {
        require(msg.value > 0, "Cannot stake 0");
        
        updateRewards();
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        if (userStake.amount > 0) {
            uint256 pending = (userStake.amount * accRewardPerShare) / 1e12 - userStake.rewardDebt;
            if (pending > 0) {
                (bool success, ) = msg.sender.call{value: pending}("");
                require(success, "Reward transfer failed");
                emit RewardsClaimed(msg.sender, pending);
            }
        }
        
        userStake.amount += msg.value;
        userStake.timestamp = block.timestamp;
        userStake.rewardDebt = (userStake.amount * accRewardPerShare) / 1e12;
        
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 amount) external onlyAuthorized nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient staked amount");
        
        updateRewards();
        
        uint256 pending = (userStake.amount * accRewardPerShare) / 1e12 - userStake.rewardDebt;
        
        userStake.amount -= amount;
        userStake.rewardDebt = (userStake.amount * accRewardPerShare) / 1e12;
        
        totalStaked -= amount;
        
        uint256 totalWithdraw = amount + pending;
        (bool success, ) = msg.sender.call{value: totalWithdraw}("");
        require(success, "Withdrawal failed");
        
        emit Unstaked(msg.sender, amount);
        if (pending > 0) {
            emit RewardsClaimed(msg.sender, pending);
        }
    }

    function claimRewards() external nonReentrant {
        updateRewards();
        
        StakeInfo storage userStake = stakes[msg.sender];
        uint256 pending = (userStake.amount * accRewardPerShare) / 1e12 - userStake.rewardDebt;
        
        require(pending > 0, "No rewards available");
        
        userStake.rewardDebt = (userStake.amount * accRewardPerShare) / 1e12;
        
        (bool success, ) = msg.sender.call{value: pending}("");
        require(success, "Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, pending);
    }

    function getPendingRewards(address user) external view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 tempAccRewardPerShare = accRewardPerShare;
        if (totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - lastRewardTime;
            uint256 reward = (totalStaked * rewardRate * timeElapsed) / (365 days * REWARD_PRECISION);
            tempAccRewardPerShare += (reward * 1e12) / totalStaked;
        }
        
        return (userStake.amount * tempAccRewardPerShare) / 1e12 - userStake.rewardDebt;
    }

    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        require(_rewardRate <= 2000, "Reward rate too high"); // Max 20%
        updateRewards();
        rewardRate = _rewardRate;
    }

    receive() external payable {
        if (authorizedContracts[msg.sender]) {
            stake();
        }
    }
}
