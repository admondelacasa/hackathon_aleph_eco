// Contract addresses and ABIs for blockchain integration
export const CONTRACT_ADDRESSES = {
  CONSTRUCTION_ESCROW: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890",
  STAKING_REWARDS: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || "0x2345678901234567890123456789012345678901",
  SERVICE_FEEDBACK: process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS || "0x3456789012345678901234567890123456789012",
  USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS || "0x4456789012345678901234567890123456789013", // Testnet USDT address
}

// Simplified ABIs for the contracts
export const CONSTRUCTION_ESCROW_ABI = [
  "function createService(address _contractor, uint256 _milestones, string memory _description, uint256 _deadline, uint8 _serviceType, string[] memory _milestoneDescriptions, uint256 _amount) external",
  "function completeMilestone(uint256 serviceId, uint256 milestoneIndex) external",
  "function approveMilestone(uint256 serviceId, uint256 milestoneIndex) external",
  "function getService(uint256 serviceId) external view returns (tuple(uint256 id, address client, address contractor, uint256 totalAmount, uint256 releasedAmount, uint256 milestones, uint256 completedMilestones, uint8 status, string description, uint256 createdAt, uint256 deadline))",
  "function getServiceMilestones(uint256 serviceId) external view returns (tuple(uint256 serviceId, uint256 milestoneIndex, string description, uint256 amount, bool completed, bool approved, uint256 completedAt)[])",
  "function getClientServices(address client) external view returns (uint256[])",
  "function getContractorServices(address contractor) external view returns (uint256[])",
  "function raiseDispute(uint256 serviceId) external",
  "event ServiceCreated(uint256 indexed serviceId, address indexed client, address indexed contractor, uint256 amount)",
  "event MilestoneCompleted(uint256 indexed serviceId, uint256 milestoneIndex, uint256 amount)",
  "event PaymentReleased(uint256 indexed serviceId, uint256 amount, address to)",
]

export const STAKING_REWARDS_ABI = [
  "function stake() external payable",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function stakes(address user) external view returns (uint256 amount, uint256 timestamp, uint256 rewardDebt)",
  "function totalStaked() external view returns (uint256)",
]

export const SERVICE_FEEDBACK_ABI = [
  "function registerContractor(string memory _name, string memory _description, string[] memory _skills) external",
  "function submitReview(uint256 serviceId, address reviewee, uint8 rating, string memory comment, bool isClient) external",
  "function getContractorRating(address contractor) external view returns (uint256)",
  "function getServiceReviews(uint256 serviceId) external view returns (tuple(uint256 serviceId, address reviewer, address reviewee, uint8 rating, string comment, uint256 timestamp, bool isClient)[])",
  "function getContractorProfile(address contractor) external view returns (tuple(address contractorAddress, string name, string description, string[] skills, uint256 totalJobs, uint256 completedJobs, uint256 totalRating, uint256 reviewCount, bool isVerified))",
  "event ReviewSubmitted(uint256 indexed serviceId, address indexed reviewer, address indexed reviewee, uint8 rating)",
  "event ContractorRegistered(address indexed contractor, string name)",
]

export const SERVICE_TYPES = {
  GARDENING: 0,
  PLUMBING: 1,
  ELECTRICAL: 2,
  CONSTRUCTION: 3,
  PAINTING: 4,
  CARPENTRY: 5,
  ROOFING: 6,
  CLEANING: 7,
  HVAC: 8,
  LOCKSMITH: 9,
  MASONRY: 10,
  FLOORING: 11,
  APPLIANCE_REPAIR: 12,
  PEST_CONTROL: 13,
  WELDING: 14,
  GLASS_REPAIR: 15,
} as const

export const SERVICE_STATUS = {
  CREATED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  DISPUTED: 3,
  CANCELLED: 4,
} as const
