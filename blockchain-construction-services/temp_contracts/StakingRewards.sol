// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingRewards is ReentrancyGuard, Ownable {
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
        address contractor; // The contractor associated with this stake
        uint256 contractId; // The contract ID this stake is associated with
    }

    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public authorizedContracts;
    
    uint256 public totalStaked;
    uint256 public rewardRate = 500; // 5% APY
    uint256 public constant REWARD_PRECISION = 10000;
    uint256 public lastRewardTime;
    uint256 public accRewardPerShare;
    
    address public constant BUILDTRUST_TREASURY = address(0x8d613ff3e545b5673b462124ac830f6fdd52aa7a); 

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ContractAuthorized(address indexed contractAddr, bool authorized);

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address _usdtAddress) {
        USDT = IERC20(_usdtAddress);
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

    function stake(address contractor, uint256 contractId, uint256 amount) external onlyAuthorized nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(contractor != address(0), "Invalid contractor address");
        require(USDT.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");
        
        updateRewards();
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        if (userStake.amount > 0) {
            uint256 pending = (userStake.amount * accRewardPerShare) / 1e12 - userStake.rewardDebt;
            if (pending > 0) {
                // Send yield rewards to BuildTrust treasury
                (bool success, ) = BUILDTRUST_TREASURY.call{value: pending}("");
                require(success, "Reward transfer to treasury failed");
                emit RewardsClaimed(BUILDTRUST_TREASURY, pending);
            }
        }
        
        userStake.amount += amount;
        userStake.timestamp = block.timestamp;
        userStake.rewardDebt = (userStake.amount * accRewardPerShare) / 1e12;
        userStake.contractor = contractor;
        userStake.contractId = contractId;
        
        totalStaked += amount;
        
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
        
        // Send principal amount in USDT to contractor
        require(USDT.transfer(userStake.contractor, amount), "USDT transfer to contractor failed");
        
        // Send yield in USDT to BuildTrust treasury
        if (pending > 0) {
            require(USDT.transfer(BUILDTRUST_TREASURY, pending), "USDT yield transfer to treasury failed");
        }
        
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
        // Only accept direct payments from authorized contracts
        require(authorizedContracts[msg.sender], "Only authorized contracts can send Ether");
    }
}
