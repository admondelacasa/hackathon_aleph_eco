// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title EscrowVault
 * @dev Enhanced escrow contract for construction services with Symbiotic integration
 * Manages milestone-based payments with additional security from Symbiotic Network
 */
contract EscrowVault is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    // Enums
    enum ContractStatus { 
        Created, 
        Active, 
        Completed, 
        Disputed, 
        Cancelled,
        AwaitingSymbiotic 
    }
    
    enum MilestoneStatus { 
        Pending, 
        InProgress, 
        Completed, 
        Disputed, 
        Released 
    }

    // Structs
    struct ServiceContract {
        uint256 id;
        address client;
        address contractor;
        uint256 totalAmount;
        uint256 releasedAmount;
        ContractStatus status;
        uint256 createdAt;
        uint256 completedAt;
        string serviceDescription;
        bool symbioticSecured;
        uint256 symbioticStakeId;
    }

    struct Milestone {
        uint256 id;
        uint256 contractId;
        string description;
        uint256 amount;
        uint256 dueDate;
        MilestoneStatus status;
        bool clientApproved;
        bool contractorConfirmed;
        uint256 completedAt;
    }

    struct DisputeInfo {
        uint256 contractId;
        address initiator;
        string reason;
        uint256 timestamp;
        bool resolved;
        address resolver;
    }

    // State variables
    IERC20 public paymentToken;
    address public symbioticAdapter;
    
    uint256 public contractCounter;
    uint256 public milestoneCounter;
    uint256 public disputeCounter;
    
    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    uint256 public constant COMPLETION_TIMEOUT = 30 days;
    uint256 public platformFeePercent = 250; // 2.5%
    uint256 public constant BASIS_POINTS = 10000;

    // Mappings
    mapping(uint256 => ServiceContract) public contracts;
    mapping(uint256 => Milestone) public milestones;
    mapping(uint256 => uint256[]) public contractMilestones; // contractId => milestoneIds
    mapping(uint256 => DisputeInfo) public disputes;
    mapping(address => uint256[]) public userContracts; // user => contractIds

    // Events
    event ContractCreated(
        uint256 indexed contractId,
        address indexed client,
        address indexed contractor,
        uint256 totalAmount
    );
    
    event MilestoneCreated(
        uint256 indexed milestoneId,
        uint256 indexed contractId,
        uint256 amount,
        string description
    );
    
    event MilestoneCompleted(
        uint256 indexed milestoneId,
        uint256 indexed contractId,
        address completedBy
    );
    
    event PaymentReleased(
        uint256 indexed contractId,
        uint256 indexed milestoneId,
        uint256 amount,
        address to
    );
    
    event DisputeRaised(
        uint256 indexed contractId,
        uint256 indexed disputeId,
        address indexed initiator
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        address indexed resolver,
        bool clientFavored
    );

    event SymbioticSecurityEnabled(
        uint256 indexed contractId,
        uint256 stakeAmount
    );

    constructor(
        address _paymentToken,
        address _symbioticAdapter
    ) {
        paymentToken = IERC20(_paymentToken);
        symbioticAdapter = _symbioticAdapter;
    }

    /**
     * @dev Create a new service contract with escrow
     * @param contractor The contractor address
     * @param totalAmount Total contract amount
     * @param serviceDescription Description of the service
     * @param enableSymbiotic Whether to enable Symbiotic security
     * @return contractId The created contract ID
     */
    function createContract(
        address contractor,
        uint256 totalAmount,
        string calldata serviceDescription,
        bool enableSymbiotic
    ) external returns (uint256) {
        require(contractor != address(0), "Invalid contractor address");
        require(contractor != msg.sender, "Client and contractor cannot be same");
        require(totalAmount > 0, "Amount must be greater than 0");

        contractCounter = contractCounter.add(1);
        uint256 contractId = contractCounter;

        // Transfer tokens to escrow
        require(
            paymentToken.transferFrom(msg.sender, address(this), totalAmount),
            "Token transfer failed"
        );

        contracts[contractId] = ServiceContract({
            id: contractId,
            client: msg.sender,
            contractor: contractor,
            totalAmount: totalAmount,
            releasedAmount: 0,
            status: enableSymbiotic ? ContractStatus.AwaitingSymbiotic : ContractStatus.Created,
            createdAt: block.timestamp,
            completedAt: 0,
            serviceDescription: serviceDescription,
            symbioticSecured: enableSymbiotic,
            symbioticStakeId: 0
        });

        // Add to user contracts
        userContracts[msg.sender].push(contractId);
        userContracts[contractor].push(contractId);

        emit ContractCreated(contractId, msg.sender, contractor, totalAmount);

        // Enable Symbiotic security if requested
        if (enableSymbiotic && symbioticAdapter != address(0)) {
            _enableSymbioticSecurity(contractId, totalAmount.div(10)); // 10% stake
        }

        return contractId;
    }

    /**
     * @dev Add milestone to a contract
     * @param contractId The contract ID
     * @param description Milestone description
     * @param amount Milestone amount
     * @param dueDate Milestone due date
     */
    function addMilestone(
        uint256 contractId,
        string calldata description,
        uint256 amount,
        uint256 dueDate
    ) external {
        ServiceContract storage serviceContract = contracts[contractId];
        require(serviceContract.client == msg.sender, "Only client can add milestones");
        require(serviceContract.status == ContractStatus.Created, "Contract not in created state");
        require(amount > 0, "Amount must be greater than 0");
        require(dueDate > block.timestamp, "Due date must be in future");

        // Check total milestone amounts don't exceed contract amount
        uint256 totalMilestoneAmount = 0;
        uint256[] memory existingMilestones = contractMilestones[contractId];
        for (uint256 i = 0; i < existingMilestones.length; i++) {
            totalMilestoneAmount = totalMilestoneAmount.add(milestones[existingMilestones[i]].amount);
        }
        require(
            totalMilestoneAmount.add(amount) <= serviceContract.totalAmount,
            "Total milestone amount exceeds contract amount"
        );

        milestoneCounter = milestoneCounter.add(1);
        uint256 milestoneId = milestoneCounter;

        milestones[milestoneId] = Milestone({
            id: milestoneId,
            contractId: contractId,
            description: description,
            amount: amount,
            dueDate: dueDate,
            status: MilestoneStatus.Pending,
            clientApproved: false,
            contractorConfirmed: false,
            completedAt: 0
        });

        contractMilestones[contractId].push(milestoneId);

        emit MilestoneCreated(milestoneId, contractId, amount, description);
    }

    /**
     * @dev Activate contract after milestones are set
     * @param contractId The contract ID
     */
    function activateContract(uint256 contractId) external {
        ServiceContract storage serviceContract = contracts[contractId];
        require(
            serviceContract.client == msg.sender,
            "Only client can activate contract"
        );
        require(
            serviceContract.status == ContractStatus.Created,
            "Contract not in created state"
        );
        require(
            contractMilestones[contractId].length > 0,
            "Contract must have at least one milestone"
        );

        serviceContract.status = ContractStatus.Active;
    }

    /**
     * @dev Mark milestone as completed by contractor
     * @param milestoneId The milestone ID
     */
    function completeMilestone(uint256 milestoneId) external {
        Milestone storage milestone = milestones[milestoneId];
        ServiceContract storage serviceContract = contracts[milestone.contractId];
        
        require(
            serviceContract.contractor == msg.sender,
            "Only contractor can mark milestone complete"
        );
        require(milestone.status == MilestoneStatus.Pending, "Milestone not pending");
        require(serviceContract.status == ContractStatus.Active, "Contract not active");

        milestone.status = MilestoneStatus.InProgress;
        milestone.contractorConfirmed = true;
        milestone.completedAt = block.timestamp;

        emit MilestoneCompleted(milestoneId, milestone.contractId, msg.sender);
    }

    /**
     * @dev Approve milestone and release payment
     * @param milestoneId The milestone ID
     */
    function approveMilestone(uint256 milestoneId) external nonReentrant {
        Milestone storage milestone = milestones[milestoneId];
        ServiceContract storage serviceContract = contracts[milestone.contractId];
        
        require(
            serviceContract.client == msg.sender,
            "Only client can approve milestone"
        );
        require(
            milestone.status == MilestoneStatus.InProgress,
            "Milestone not in progress"
        );
        require(milestone.contractorConfirmed, "Contractor has not confirmed completion");

        milestone.status = MilestoneStatus.Completed;
        milestone.clientApproved = true;

        // Release payment
        _releaseMilestonePayment(milestoneId);
    }

    /**
     * @dev Raise a dispute for a contract
     * @param contractId The contract ID
     * @param reason The dispute reason
     */
    function raiseDispute(uint256 contractId, string calldata reason) external {
        ServiceContract storage serviceContract = contracts[contractId];
        require(
            serviceContract.client == msg.sender || serviceContract.contractor == msg.sender,
            "Only contract parties can raise disputes"
        );
        require(
            serviceContract.status == ContractStatus.Active,
            "Contract not active"
        );

        serviceContract.status = ContractStatus.Disputed;
        disputeCounter = disputeCounter.add(1);

        disputes[disputeCounter] = DisputeInfo({
            contractId: contractId,
            initiator: msg.sender,
            reason: reason,
            timestamp: block.timestamp,
            resolved: false,
            resolver: address(0)
        });

        emit DisputeRaised(contractId, disputeCounter, msg.sender);
    }

    /**
     * @dev Resolve a dispute (only owner or designated resolver)
     * @param disputeId The dispute ID
     * @param clientFavored Whether to favor the client
     */
    function resolveDispute(uint256 disputeId, bool clientFavored) external onlyOwner {
        DisputeInfo storage dispute = disputes[disputeId];
        require(!dispute.resolved, "Dispute already resolved");
        
        ServiceContract storage serviceContract = contracts[dispute.contractId];
        require(serviceContract.status == ContractStatus.Disputed, "Contract not disputed");

        dispute.resolved = true;
        dispute.resolver = msg.sender;
        
        if (clientFavored) {
            // Refund remaining amount to client
            uint256 remainingAmount = serviceContract.totalAmount.sub(serviceContract.releasedAmount);
            if (remainingAmount > 0) {
                require(
                    paymentToken.transfer(serviceContract.client, remainingAmount),
                    "Refund transfer failed"
                );
            }
        } else {
            // Release remaining amount to contractor
            uint256 remainingAmount = serviceContract.totalAmount.sub(serviceContract.releasedAmount);
            if (remainingAmount > 0) {
                uint256 platformFee = remainingAmount.mul(platformFeePercent).div(BASIS_POINTS);
                uint256 contractorAmount = remainingAmount.sub(platformFee);
                
                require(
                    paymentToken.transfer(serviceContract.contractor, contractorAmount),
                    "Contractor payment failed"
                );
                require(
                    paymentToken.transfer(owner(), platformFee),
                    "Platform fee transfer failed"
                );
            }
        }

        serviceContract.status = ContractStatus.Completed;
        serviceContract.completedAt = block.timestamp;

        emit DisputeResolved(disputeId, msg.sender, clientFavored);
    }

    /**
     * @dev Cancel a contract (only if not started)
     * @param contractId The contract ID
     */
    function cancelContract(uint256 contractId) external nonReentrant {
        ServiceContract storage serviceContract = contracts[contractId];
        require(
            serviceContract.client == msg.sender,
            "Only client can cancel contract"
        );
        require(
            serviceContract.status == ContractStatus.Created,
            "Can only cancel created contracts"
        );

        serviceContract.status = ContractStatus.Cancelled;
        
        // Refund the client
        uint256 refundAmount = serviceContract.totalAmount.sub(serviceContract.releasedAmount);
        if (refundAmount > 0) {
            require(
                paymentToken.transfer(serviceContract.client, refundAmount),
                "Refund transfer failed"
            );
        }
    }

    /**
     * @dev Internal function to release milestone payment
     * @param milestoneId The milestone ID
     */
    function _releaseMilestonePayment(uint256 milestoneId) internal {
        Milestone storage milestone = milestones[milestoneId];
        ServiceContract storage serviceContract = contracts[milestone.contractId];

        uint256 platformFee = milestone.amount.mul(platformFeePercent).div(BASIS_POINTS);
        uint256 contractorAmount = milestone.amount.sub(platformFee);

        // Update contract state
        serviceContract.releasedAmount = serviceContract.releasedAmount.add(milestone.amount);
        milestone.status = MilestoneStatus.Released;

        // Transfer payments
        require(
            paymentToken.transfer(serviceContract.contractor, contractorAmount),
            "Contractor payment failed"
        );
        require(
            paymentToken.transfer(owner(), platformFee),
            "Platform fee transfer failed"
        );

        // Check if contract is complete
        if (serviceContract.releasedAmount >= serviceContract.totalAmount) {
            serviceContract.status = ContractStatus.Completed;
            serviceContract.completedAt = block.timestamp;
        }

        emit PaymentReleased(milestone.contractId, milestoneId, milestone.amount, serviceContract.contractor);
    }

    /**
     * @dev Enable Symbiotic security for a contract
     * @param contractId The contract ID
     * @param stakeAmount Amount to stake for security
     */
    function _enableSymbioticSecurity(uint256 contractId, uint256 stakeAmount) internal {
        if (symbioticAdapter != address(0)) {
            // Call Symbiotic adapter to stake funds for security
            // This would interact with the actual Symbiotic protocol
            contracts[contractId].symbioticStakeId = stakeAmount; // Simplified for mock
            contracts[contractId].status = ContractStatus.Created;
            
            emit SymbioticSecurityEnabled(contractId, stakeAmount);
        }
    }

    /**
     * @dev Get contract milestones
     * @param contractId The contract ID
     * @return Array of milestone IDs
     */
    function getContractMilestones(uint256 contractId) external view returns (uint256[] memory) {
        return contractMilestones[contractId];
    }

    /**
     * @dev Get user contracts
     * @param user The user address
     * @return Array of contract IDs
     */
    function getUserContracts(address user) external view returns (uint256[] memory) {
        return userContracts[user];
    }

    /**
     * @dev Set platform fee percentage
     * @param newFeePercent New fee percentage in basis points
     */
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = newFeePercent;
    }

    /**
     * @dev Set Symbiotic adapter address
     * @param newAdapter New adapter address
     */
    function setSymbioticAdapter(address newAdapter) external onlyOwner {
        symbioticAdapter = newAdapter;
    }

    /**
     * @dev Emergency withdraw function
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= paymentToken.balanceOf(address(this)), "Insufficient balance");
        require(paymentToken.transfer(owner(), amount), "Transfer failed");
    }
}
