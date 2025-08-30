// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ConstructionEscrow is ReentrancyGuard, Ownable {
    struct Service {
        uint256 id;
        address client;
        address contractor;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 milestones;
        uint256 completedMilestones;
        ServiceStatus status;
        string description;
        uint256 createdAt;
        uint256 deadline;
    }

    struct Milestone {
        uint256 serviceId;
        uint256 milestoneIndex;
        string description;
        uint256 amount;
        bool completed;
        bool approved;
        uint256 completedAt;
    }

    enum ServiceStatus {
        Created,
        InProgress,
        Completed,
        Disputed,
        Cancelled
    }

    enum ServiceType {
        Gardening,
        Plumbing,
        Electrical,
        Construction
    }

    mapping(uint256 => Service) public services;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(address => uint256[]) public clientServices;
    mapping(address => uint256[]) public contractorServices;
    mapping(uint256 => ServiceType) public serviceTypes;

    uint256 public nextServiceId = 1;
    uint256 public platformFeePercent = 250; // 2.5%
    address public stakingContract;
    
    event ServiceCreated(uint256 indexed serviceId, address indexed client, address indexed contractor, uint256 amount);
    event MilestoneCompleted(uint256 indexed serviceId, uint256 milestoneIndex, uint256 amount);
    event PaymentReleased(uint256 indexed serviceId, uint256 amount, address to);
    event ServiceCompleted(uint256 indexed serviceId);
    event DisputeRaised(uint256 indexed serviceId, address raisedBy);

    modifier onlyServiceParty(uint256 serviceId) {
        require(
            msg.sender == services[serviceId].client || 
            msg.sender == services[serviceId].contractor,
            "Not authorized for this service"
        );
        _;
    }

    constructor(address _stakingContract) {
        stakingContract = _stakingContract;
    }

    function createService(
        address _contractor,
        uint256 _milestones,
        string memory _description,
        uint256 _deadline,
        ServiceType _serviceType,
        string[] memory _milestoneDescriptions
    ) external payable nonReentrant {
        require(_contractor != address(0), "Invalid contractor address");
        require(_contractor != msg.sender, "Cannot hire yourself");
        require(msg.value > 0, "Payment required");
        require(_milestones > 0 && _milestones <= 10, "Invalid milestone count");
        require(_milestoneDescriptions.length == _milestones, "Milestone descriptions mismatch");

        uint256 serviceId = nextServiceId++;
        
        services[serviceId] = Service({
            id: serviceId,
            client: msg.sender,
            contractor: _contractor,
            totalAmount: msg.value,
            releasedAmount: 0,
            milestones: _milestones,
            completedMilestones: 0,
            status: ServiceStatus.Created,
            description: _description,
            createdAt: block.timestamp,
            deadline: _deadline
        });

        serviceTypes[serviceId] = _serviceType;
        clientServices[msg.sender].push(serviceId);
        contractorServices[_contractor].push(serviceId);

        // Create milestones with equal payment distribution
        uint256 amountPerMilestone = msg.value / _milestones;
        for (uint256 i = 0; i < _milestones; i++) {
            milestones[serviceId][i] = Milestone({
                serviceId: serviceId,
                milestoneIndex: i,
                description: _milestoneDescriptions[i],
                amount: amountPerMilestone,
                completed: false,
                approved: false,
                completedAt: 0
            });
        }

        // Send funds to staking contract for yield generation
        if (stakingContract != address(0)) {
            (bool success, ) = stakingContract.call{value: msg.value}("");
            require(success, "Failed to stake funds");
        }

        emit ServiceCreated(serviceId, msg.sender, _contractor, msg.value);
    }

    function completeMilestone(uint256 serviceId, uint256 milestoneIndex) 
        external 
        onlyServiceParty(serviceId) 
    {
        require(services[serviceId].status == ServiceStatus.InProgress || services[serviceId].status == ServiceStatus.Created, "Service not active");
        require(milestoneIndex < services[serviceId].milestones, "Invalid milestone");
        require(!milestones[serviceId][milestoneIndex].completed, "Milestone already completed");
        require(msg.sender == services[serviceId].contractor, "Only contractor can complete milestones");

        milestones[serviceId][milestoneIndex].completed = true;
        milestones[serviceId][milestoneIndex].completedAt = block.timestamp;

        if (services[serviceId].status == ServiceStatus.Created) {
            services[serviceId].status = ServiceStatus.InProgress;
        }

        emit MilestoneCompleted(serviceId, milestoneIndex, milestones[serviceId][milestoneIndex].amount);
    }

    function approveMilestone(uint256 serviceId, uint256 milestoneIndex) 
        external 
        onlyServiceParty(serviceId) 
        nonReentrant 
    {
        require(msg.sender == services[serviceId].client, "Only client can approve milestones");
        require(milestones[serviceId][milestoneIndex].completed, "Milestone not completed");
        require(!milestones[serviceId][milestoneIndex].approved, "Milestone already approved");

        milestones[serviceId][milestoneIndex].approved = true;
        services[serviceId].completedMilestones++;
        
        uint256 releaseAmount = milestones[serviceId][milestoneIndex].amount;
        services[serviceId].releasedAmount += releaseAmount;

        // Release payment to contractor
        (bool success, ) = services[serviceId].contractor.call{value: releaseAmount}("");
        require(success, "Payment release failed");

        emit PaymentReleased(serviceId, releaseAmount, services[serviceId].contractor);

        // Check if all milestones are completed
        if (services[serviceId].completedMilestones == services[serviceId].milestones) {
            services[serviceId].status = ServiceStatus.Completed;
            emit ServiceCompleted(serviceId);
        }
    }

    function raiseDispute(uint256 serviceId) external onlyServiceParty(serviceId) {
        require(services[serviceId].status == ServiceStatus.InProgress, "Service not in progress");
        services[serviceId].status = ServiceStatus.Disputed;
        emit DisputeRaised(serviceId, msg.sender);
    }

    function resolveDispute(uint256 serviceId, bool favorClient) external onlyOwner {
        require(services[serviceId].status == ServiceStatus.Disputed, "Service not disputed");
        
        if (favorClient) {
            // Refund remaining amount to client
            uint256 refundAmount = services[serviceId].totalAmount - services[serviceId].releasedAmount;
            if (refundAmount > 0) {
                (bool success, ) = services[serviceId].client.call{value: refundAmount}("");
                require(success, "Refund failed");
            }
        } else {
            // Release remaining amount to contractor
            uint256 releaseAmount = services[serviceId].totalAmount - services[serviceId].releasedAmount;
            if (releaseAmount > 0) {
                services[serviceId].releasedAmount = services[serviceId].totalAmount;
                (bool success, ) = services[serviceId].contractor.call{value: releaseAmount}("");
                require(success, "Payment release failed");
            }
        }
        
        services[serviceId].status = ServiceStatus.Completed;
    }

    function getService(uint256 serviceId) external view returns (Service memory) {
        return services[serviceId];
    }

    function getServiceMilestones(uint256 serviceId) external view returns (Milestone[] memory) {
        Milestone[] memory serviceMilestones = new Milestone[](services[serviceId].milestones);
        for (uint256 i = 0; i < services[serviceId].milestones; i++) {
            serviceMilestones[i] = milestones[serviceId][i];
        }
        return serviceMilestones;
    }

    function getClientServices(address client) external view returns (uint256[] memory) {
        return clientServices[client];
    }

    function getContractorServices(address contractor) external view returns (uint256[] memory) {
        return contractorServices[contractor];
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
