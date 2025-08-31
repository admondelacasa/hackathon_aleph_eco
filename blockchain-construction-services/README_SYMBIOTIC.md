# 🔗 Symbiotic Network Integration - BuildTrust Platform

## 🌟 Overview

This documentation covers the complete integration of **Symbiotic Network** into the BuildTrust platform, providing shared security services for construction escrow contracts. The implementation includes mock contracts for local development, production-ready escrow systems, and comprehensive testing tools.

## 🏗️ Architecture Components

### Smart Contracts Structure

```
contracts/
├── mocks/
│   └── MockSymbioticVault.sol     # Local testing vault
├── escrow/
│   ├── EscrowVault.sol            # Enhanced escrow system
│   └── SymbioticAdapter.sol       # Symbiotic integration layer
├── SymbioticVault.sol             # Production vault (from previous implementation)
└── LayerZeroDVN.sol               # Cross-chain verifier network
```

### Scripts & Deployment

```
scripts/
├── deploy-local.js                # Local development deployment
└── fund-escrow.js                 # Test data creation script
```

## 🔐 Contract Details

### 1. MockSymbioticVault.sol

**Purpose**: Local development and testing version of Symbiotic vault

**Key Features**:
- **3 Risk Tranches**: 
  - Conservative (8% APY, Risk Level 3)
  - Balanced (12% APY, Risk Level 6) 
  - Aggressive (20% APY, Risk Level 9)
- **Staking Management**: Deposit, withdraw, rewards calculation
- **Security Provision**: Stake-backed security for protocols
- **Slashing System**: Penalty mechanism for security violations

**Core Functions**:
```solidity
// Staking Operations
function stakeFunds(uint256 tranche, uint256 amount) external
function withdrawFunds(uint256 amount) external
function claimRewards() external

// Security Services
function provideSecurityFor(address protocol, uint256 amount, string description) external
function slashStaker(address staker, uint256 amount, string reason) external

// View Functions
function calculateRewards(address staker) external view returns (uint256)
function getTranche(uint256 trancheId) external view returns (Tranche memory)
function getVaultStats() external view returns (uint256, uint256, uint256)
```

### 2. EscrowVault.sol

**Purpose**: Enhanced escrow contract for construction services with Symbiotic integration

**Key Features**:
- **Milestone-Based Payments**: Progressive payment release
- **Symbiotic Security**: Optional security provision through adapter
- **Dispute Resolution**: Built-in arbitration system  
- **Multi-Party Contracts**: Client-contractor-platform model

**Contract Lifecycle**:
1. **Created**: Client creates contract with total amount
2. **Milestones Added**: Client defines payment milestones
3. **Activated**: Contract becomes active for work
4. **In Progress**: Contractor completes milestones
5. **Completed**: All milestones approved and paid

**Core Functions**:
```solidity
// Contract Management
function createContract(address contractor, uint256 totalAmount, string serviceDescription, bool enableSymbiotic) external
function addMilestone(uint256 contractId, string description, uint256 amount, uint256 dueDate) external
function activateContract(uint256 contractId) external

// Milestone Operations
function completeMilestone(uint256 milestoneId) external
function approveMilestone(uint256 milestoneId) external

// Dispute System
function raiseDispute(uint256 contractId, string reason) external
function resolveDispute(uint256 disputeId, bool clientFavored) external
```

### 3. SymbioticAdapter.sol

**Purpose**: Integration layer between BuildTrust escrow and Symbiotic Network

**Key Features**:
- **Security Provision Management**: Creates and manages security stakes
- **Automated Slashing**: Executes penalties for contract violations
- **Reward Distribution**: Distributes Symbiotic rewards to participants
- **Multi-Tranche Support**: Allows security provision across different risk levels

**Integration Flow**:
1. **Provision Creation**: Escrow creates security provision request
2. **Stake Activation**: User stakes in chosen Symbiotic tranche
3. **Security Period**: Stake provides security during contract execution
4. **Completion**: Rewards distributed and stake returned

**Core Functions**:
```solidity
// Security Provision
function createSecurityProvision(address escrowContract, uint256 contractId, uint256 contractAmount, uint256 duration) external
function activateSecurityProvision(uint256 provisionId, uint256 trancheId) external
function completeSecurityProvision(uint256 provisionId) external

// Risk Management
function executeSlashing(uint256 provisionId, uint256 slashAmount, string reason) external
function calculateRequiredStake(uint256 contractAmount) external view returns (uint256)
```

## 🚀 Deployment Guide

### Local Development Setup

1. **Install Dependencies**:
```bash
npm install
npm install @openzeppelin/contracts @nomiclabs/hardhat-ethers ethers hardhat
```

2. **Deploy Contracts**:
```bash
# Deploy all contracts locally
npx hardhat run scripts/deploy-local.js --network localhost

# Fund contracts with test data
npx hardhat run scripts/fund-escrow.js --network localhost
```

3. **Start Local Node** (in separate terminal):
```bash
npx hardhat node
```

### Contract Deployment Output

The deployment script will create:
- **Mock USDT Token**: For testing payments
- **MockSymbioticVault**: Local vault with initial stakes
- **EscrowVault**: Escrow system with Symbiotic integration
- **SymbioticAdapter**: Integration layer
- **LayerZeroDVN**: Cross-chain verifier network

**Generated Files**:
- `deployed-addresses.json`: Contract addresses for frontend
- `testing-data.json`: Test scenarios and account info

## 🧪 Testing Scenarios

The `fund-escrow.js` script creates comprehensive test scenarios:

### Test Contracts Created

1. **Small Project** ($100 USDT):
   - Basic plumbing repair
   - No Symbiotic security
   - Simple payment structure

2. **Medium Project** ($500 USDT):
   - Kitchen renovation
   - Symbiotic security enabled
   - 2 milestones with progressive payments
   - Simulated milestone completion

3. **Large Project** ($2000 USDT):
   - Full electrical rewiring
   - Symbiotic security enabled
   - 3 milestones with detailed workflow
   - Active contract ready for testing

### Test Accounts

- **Deployer**: Contract owner and administrator
- **Client**: Creates contracts and approves milestones  
- **Contractor**: Completes work and claims payments

## 📊 Integration with Frontend

### Contract Address Configuration

Update your environment variables:
```env
NEXT_PUBLIC_MOCK_USDT_ADDRESS=<from deployed-addresses.json>
NEXT_PUBLIC_SYMBIOTIC_VAULT_ADDRESS=<from deployed-addresses.json>
NEXT_PUBLIC_ESCROW_VAULT_ADDRESS=<from deployed-addresses.json>
NEXT_PUBLIC_SYMBIOTIC_ADAPTER_ADDRESS=<from deployed-addresses.json>
NEXT_PUBLIC_LAYERZERO_DVN_ADDRESS=<from deployed-addresses.json>
```

### React Hooks Integration

The existing hooks (`useSymbioticVault`, `useLayerZeroDVN`) can be configured to use the deployed mock contracts for local testing:

```typescript
// In development mode, use mock addresses
const VAULT_ADDRESS = process.env.NODE_ENV === 'development' 
  ? process.env.NEXT_PUBLIC_SYMBIOTIC_VAULT_ADDRESS
  : PRODUCTION_SYMBIOTIC_VAULT_ADDRESS;
```

## 🔧 Configuration Options

### Platform Settings

**EscrowVault Configuration**:
```solidity
uint256 public platformFeePercent = 250; // 2.5%
uint256 public constant DISPUTE_TIMEOUT = 7 days;
uint256 public constant COMPLETION_TIMEOUT = 30 days;
```

**SymbioticAdapter Configuration**:
```solidity
uint256 public minimumStakeAmount = 1000 * 10**18; // 1000 tokens
uint256 public securityRatio = 1000; // 10% of contract value
uint256 public constant DEFAULT_SECURITY_DURATION = 90 days;
```

### Tranche Parameters

| Tranche | Risk Level | APY | Max Capacity | Target Users |
|---------|------------|-----|--------------|--------------|
| Conservative | 3 | 8% | 5M tokens | Risk-averse |
| Balanced | 6 | 12% | 3M tokens | Moderate risk |
| Aggressive | 9 | 20% | 1M tokens | High-risk/reward |

## 🛡️ Security Features

### Escrow Security

1. **Multi-Signature Requirements**: Critical operations require multiple confirmations
2. **Time-Locked Withdrawals**: Cooling period for withdrawals
3. **Dispute Resolution**: Built-in arbitration with timeout mechanisms
4. **Platform Fee Protection**: Automatic fee calculation and distribution

### Symbiotic Integration Security

1. **Stake-Backed Security**: All security provisions backed by real stake
2. **Slashing Protection**: Multi-party approval for slashing events
3. **Reward Verification**: Cryptographic proof for reward distribution
4. **Emergency Controls**: Owner-only emergency functions

## 📈 Monitoring & Analytics

### Key Metrics Tracked

**Escrow Metrics**:
- Total contracts created
- Average contract value
- Milestone completion rate
- Dispute frequency and resolution time

**Symbiotic Metrics**:
- Total value locked per tranche
- Staker distribution and behavior
- Security provision utilization
- Slashing events and recovery

### Event Monitoring

Critical events to monitor in production:

```solidity
// Escrow Events
event ContractCreated(uint256 indexed contractId, address indexed client, address indexed contractor, uint256 totalAmount)
event MilestoneCompleted(uint256 indexed milestoneId, uint256 indexed contractId, address completedBy)
event DisputeRaised(uint256 indexed contractId, uint256 indexed disputeId, address indexed initiator)

// Symbiotic Events
event SecurityProvisionCreated(uint256 indexed provisionId, address indexed escrowContract, uint256 indexed contractId, uint256 stakeAmount)
event SlashingExecuted(uint256 indexed provisionId, uint256 amount, string reason)
event RewardsDistributed(uint256 indexed provisionId, address indexed recipient, uint256 amount)
```

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Failures**:
   - Check Hardhat network configuration
   - Verify account has sufficient balance
   - Ensure all dependencies are installed

2. **Transaction Reverts**:
   - Check token approvals before staking/escrow creation
   - Verify contract addresses in frontend configuration
   - Confirm account roles and permissions

3. **Frontend Integration**:
   - Update contract ABIs after redeployment
   - Check environment variable configuration
   - Verify wallet connection and network

### Debug Commands

```bash
# Check contract deployment
npx hardhat verify --network localhost <CONTRACT_ADDRESS>

# Check account balances
npx hardhat console --network localhost
> const balance = await ethers.provider.getBalance("ADDRESS")
> console.log(ethers.utils.formatEther(balance))

# Interact with contracts
npx hardhat run scripts/interact.js --network localhost
```

## 🔄 Upgrade Path to Production

### Migration Strategy

1. **Replace Mock Contracts**: Integrate with actual Symbiotic Network contracts
2. **Mainnet Deployment**: Deploy to Ethereum mainnet or L2 solutions
3. **Security Audits**: Complete security audit of all custom contracts
4. **Gradual Rollout**: Start with limited beta testing

### Production Considerations

- **Gas Optimization**: Optimize contract functions for lower gas costs
- **Oracle Integration**: Add price oracles for USD-stable pricing
- **Multi-Token Support**: Support multiple ERC20 tokens
- **Cross-Chain Expansion**: Extend to multiple blockchain networks

---

## 🎯 Quick Start Commands

```bash
# 1. Setup and deployment
npm install
npx hardhat node                 # Terminal 1
npx hardhat run scripts/deploy-local.js --network localhost  # Terminal 2
npx hardhat run scripts/fund-escrow.js --network localhost

# 2. Start frontend
npm run dev                      # Access: http://localhost:3000/symbiotic

# 3. Test scenarios
# - Browse contracts in dashboard
# - Complete milestones as contractor
# - Test dispute resolution
# - Check Symbiotic vault rewards
```

**🎉 You now have a complete Symbiotic Network integration running locally!**

---

*For questions or support, refer to the main BuildTrust documentation or contact the development team.*
