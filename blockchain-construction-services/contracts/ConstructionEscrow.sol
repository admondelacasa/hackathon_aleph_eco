// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ConstructionEscrow is ReentrancyGuard, Ownable {
    IERC20 public immutable USDT;
    uint256 private constant USDT_DECIMALS = 6;
    
    struct Contract {
        uint256 id;
        address client;
        address contractor;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 milestones;
        uint256 completedMilestones;
        ContractStatus status;
        string description;
        uint256 createdAt;
        uint256 deadline;
    }

    struct Milestone {
        uint256 contractId;
        uint256 milestoneIndex;
        string description;
        uint256 amount;
        bool completed;
        bool approved;
        uint256 completedAt;
    }

    enum ContractStatus {
        Created,
        InProgress,
        Completed,
        Disputed,
        Cancelled
    }

    enum ContractType {
        Gardening,
        Plumbing,
        Electrical,
        Construction
    }

    mapping(uint256 => Contract) public contracts;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(address => uint256[]) public clientContracts;
    mapping(address => uint256[]) public contractorContracts;
    mapping(uint256 => ContractType) public contractTypes;

    uint256 public nextContractId = 1;
    uint256 public platformFeePercent = 250; // 2.5%
    address public stakingContract;
    
    event ContractCreated(uint256 indexed contractId, address indexed client, address indexed contractor, uint256 amount);
    event MilestoneCompleted(uint256 indexed contractId, uint256 milestoneIndex, uint256 amount);
    event PaymentReleased(uint256 indexed contractId, uint256 amount, address to);
    event ContractCompleted(uint256 indexed contractId);
    event DisputeRaised(uint256 indexed contractId, address raisedBy);
    event MilestonesInitialized(uint256 indexed contractId, uint256 totalMilestones, string[] descriptions, uint256 amountPerMilestone);
    event MilestoneCreated(uint256 indexed contractId, uint256 indexed milestoneIndex, string description, uint256 amount);

    modifier onlyContractParty(uint256 contractId) {
        require(
            msg.sender == contracts[contractId].client || 
            msg.sender == contracts[contractId].contractor,
            "Not authorized for this contract"
        );
        _;
    }

    constructor(address _stakingContract, address _usdtAddress) {
        stakingContract = _stakingContract;
        USDT = IERC20(_usdtAddress);
    }

    function createContract(
        address _contractor,
        uint256 _milestones,
        string memory _description,
        uint256 _deadline,
        ContractType _contractType,
        string[] memory _milestoneDescriptions
    ) external nonReentrant {
        require(_contractor != address(0), "Invalid contractor address");
        require(_contractor != msg.sender, "Cannot hire yourself");
        require(_milestones > 0 && _milestones <= 10, "Invalid milestone count");
        require(_milestoneDescriptions.length == _milestones, "Milestone descriptions mismatch");
        
        // Calculate total amount needed in USDT (using USDT decimals)
        uint256 totalAmount = _amount * (10 ** USDT_DECIMALS);
        require(USDT.allowance(msg.sender, address(this)) >= totalAmount, "Insufficient USDT allowance");
        require(USDT.balanceOf(msg.sender) >= totalAmount, "Insufficient USDT balance");

        uint256 contractId = nextContractId++;
        
        // Transfer USDT from client to contract
        require(USDT.transferFrom(msg.sender, address(this), totalAmount), "USDT transfer failed");

        contracts[contractId] = Contract({
            id: contractId,
            client: msg.sender,
            contractor: _contractor,
            totalAmount: totalAmount,
            releasedAmount: 0,
            milestones: _milestones,
            completedMilestones: 0,
            status: ContractStatus.Created,
            description: _description,
            createdAt: block.timestamp,
            deadline: _deadline
        });

        contractTypes[contractId] = _contractType;
        clientContracts[msg.sender].push(contractId);
        contractorContracts[_contractor].push(contractId);

        // Calculate milestone amount
        uint256 amountPerMilestone = msg.value / _milestones;
        
        // Create first milestone and emit event for off-chain milestone creation
        milestones[contractId][0] = Milestone({
            contractId: contractId,
            milestoneIndex: 0,
            description: _milestoneDescriptions[0],
            amount: amountPerMilestone,
            completed: false,
            approved: false,
            completedAt: 0
        });
        
        emit MilestonesInitialized(contractId, _milestones, _milestoneDescriptions, amountPerMilestone);

        // Transfer USDT to staking contract for yield generation
        if (stakingContract != address(0)) {
            require(USDT.transfer(stakingContract, totalAmount), "Failed to transfer USDT to staking");
        }

        emit ContractCreated(contractId, msg.sender, _contractor, msg.value);
    }

    function completeMilestone(uint256 contractId, uint256 milestoneIndex) 
        external 
        onlyContractParty(contractId) 
    {
        require(contracts[contractId].status == ContractStatus.InProgress || contracts[contractId].status == ContractStatus.Created, "Contract not active");
        require(milestoneIndex < contracts[contractId].milestones, "Invalid milestone");
        require(!milestones[contractId][milestoneIndex].completed, "Milestone already completed");
        require(msg.sender == contracts[contractId].contractor, "Only contractor can complete milestones");

        milestones[contractId][milestoneIndex].completed = true;
        milestones[contractId][milestoneIndex].completedAt = block.timestamp;

        if (contracts[contractId].status == ContractStatus.Created) {
            contracts[contractId].status = ContractStatus.InProgress;
        }

        emit MilestoneCompleted(contractId, milestoneIndex, milestones[contractId][milestoneIndex].amount);
    }

    function approveMilestone(uint256 contractId, uint256 milestoneIndex) 
        external 
        onlyContractParty(contractId) 
        nonReentrant 
    {
        require(msg.sender == contracts[contractId].client, "Only client can approve milestones");
        require(milestones[contractId][milestoneIndex].completed, "Milestone not completed");
        require(!milestones[contractId][milestoneIndex].approved, "Milestone already approved");

        milestones[contractId][milestoneIndex].approved = true;
        contracts[contractId].completedMilestones++;
        
        uint256 releaseAmount = milestones[contractId][milestoneIndex].amount;
        contracts[contractId].releasedAmount += releaseAmount;

        // Release USDT payment to contractor
        require(USDT.transfer(contracts[contractId].contractor, releaseAmount), "USDT transfer to contractor failed");

        emit PaymentReleased(contractId, releaseAmount, contracts[contractId].contractor);

        // Check if all milestones are completed
        if (contracts[contractId].completedMilestones == contracts[contractId].milestones) {
            contracts[contractId].status = ContractStatus.Completed;
            emit ContractCompleted(contractId);
        }
    }

    function raiseDispute(uint256 contractId) external onlyContractParty(contractId) {
        require(contracts[contractId].status == ContractStatus.InProgress, "Contract not in progress");
        contracts[contractId].status = ContractStatus.Disputed;
        emit DisputeRaised(contractId, msg.sender);
    }

    function resolveDispute(uint256 contractId, bool favorClient) external onlyOwner {
        require(contracts[contractId].status == ContractStatus.Disputed, "Contract not disputed");
        
        if (favorClient) {
            // Refund remaining amount to client
            uint256 refundAmount = contracts[contractId].totalAmount - contracts[contractId].releasedAmount;
            if (refundAmount > 0) {
                (bool success, ) = contracts[contractId].client.call{value: refundAmount}("");
                require(success, "Refund failed");
            }
        } else {
            // Release remaining amount to contractor
            uint256 releaseAmount = contracts[contractId].totalAmount - contracts[contractId].releasedAmount;
            if (releaseAmount > 0) {
                contracts[contractId].releasedAmount = contracts[contractId].totalAmount;
                (bool success, ) = contracts[contractId].contractor.call{value: releaseAmount}("");
                require(success, "Payment release failed");
            }
        }
        
        contracts[contractId].status = ContractStatus.Completed;
    }

    function getContract(uint256 contractId) external view returns (Contract memory) {
        return contracts[contractId];
    }

    function getMilestone(uint256 contractId, uint256 milestoneIndex) external view returns (Milestone memory) {
        require(milestoneIndex < contracts[contractId].milestones, "Invalid milestone index");
        return milestones[contractId][milestoneIndex];
    }

    function createMilestone(uint256 contractId, uint256 milestoneIndex, string calldata description) external {
        require(msg.sender == owner(), "Only owner can create milestones");
        require(milestoneIndex < contracts[contractId].milestones, "Invalid milestone index");
        require(milestoneIndex > 0, "First milestone already created"); // First milestone created in createContract
        require(milestones[contractId][milestoneIndex].contractId == 0, "Milestone already exists");

        uint256 amountPerMilestone = contracts[contractId].totalAmount / contracts[contractId].milestones;
        
        milestones[contractId][milestoneIndex] = Milestone({
            contractId: contractId,
            milestoneIndex: milestoneIndex,
            description: description,
            amount: amountPerMilestone,
            completed: false,
            approved: false,
            completedAt: 0
        });

        emit MilestoneCreated(contractId, milestoneIndex, description, amountPerMilestone);
    }

    function getClientContracts(address client) external view returns (uint256[] memory) {
        return clientContracts[client];
    }

    function getContractorContracts(address contractor) external view returns (uint256[] memory) {
        return contractorContracts[contractor];
    }

    function setStakingContract(address _stakingContract) external onlyOwner {
        stakingContract = _stakingContract;
    }

    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = _feePercent;
    }

    receive() external payable {}
}
