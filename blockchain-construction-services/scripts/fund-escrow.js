const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("💰 Funding escrow contracts for testing...\n");

  // Load deployed addresses
  let addresses;
  try {
    addresses = JSON.parse(fs.readFileSync('./deployed-addresses.json', 'utf8'));
  } catch (error) {
    console.error("❌ Could not load deployed addresses. Run deploy-local.js first.");
    process.exit(1);
  }

  const [deployer, contractor, client] = await hre.ethers.getSigners();
  console.log("Using accounts:");
  console.log("Deployer:", deployer.address);
  console.log("Contractor:", contractor.address);
  console.log("Client:", client.address);

  // Get contract instances
  const mockUSDT = await hre.ethers.getContractAt("MockERC20", addresses.mockUSDT);
  const escrowVault = await hre.ethers.getContractAt("EscrowVault", addresses.escrowVault);
  const symbioticVault = await hre.ethers.getContractAt("MockSymbioticVault", addresses.symbioticVault);

  // Fund client account
  console.log("\n💸 Funding client account...");
  const fundAmount = hre.ethers.utils.parseEther("5000"); // 5K tokens
  await mockUSDT.transfer(client.address, fundAmount);
  console.log("✅ Transferred", hre.ethers.utils.formatEther(fundAmount), "USDT to client");

  // Fund contractor account
  console.log("\n💸 Funding contractor account...");
  await mockUSDT.transfer(contractor.address, fundAmount);
  console.log("✅ Transferred", hre.ethers.utils.formatEther(fundAmount), "USDT to contractor");

  // Create multiple test contracts with different scenarios
  console.log("\n📋 Creating test contracts...");

  // Contract 1: Small project without Symbiotic security
  const contract1Amount = hre.ethers.utils.parseEther("100");
  await mockUSDT.connect(client).approve(escrowVault.address, contract1Amount);
  const tx1 = await escrowVault.connect(client).createContract(
    contractor.address,
    contract1Amount,
    "Small plumbing repair - Bathroom faucet replacement",
    false // No Symbiotic security
  );
  await tx1.wait();
  console.log("✅ Created small contract (ID: 1) - $100 USDT");

  // Contract 2: Medium project with Symbiotic security
  const contract2Amount = hre.ethers.utils.parseEther("500");
  await mockUSDT.connect(client).approve(escrowVault.address, contract2Amount);
  const tx2 = await escrowVault.connect(client).createContract(
    contractor.address,
    contract2Amount,
    "Kitchen renovation - Cabinets and countertops",
    true // With Symbiotic security
  );
  await tx2.wait();
  console.log("✅ Created medium contract (ID: 2) - $500 USDT with Symbiotic");

  // Contract 3: Large project with Symbiotic security
  const contract3Amount = hre.ethers.utils.parseEther("2000");
  await mockUSDT.connect(client).approve(escrowVault.address, contract3Amount);
  const tx3 = await escrowVault.connect(client).createContract(
    contractor.address,
    contract3Amount,
    "Full house electrical rewiring and panel upgrade",
    true // With Symbiotic security
  );
  await tx3.wait();
  console.log("✅ Created large contract (ID: 3) - $2000 USDT with Symbiotic");

  // Add milestones to Contract 2
  console.log("\n🎯 Adding milestones to medium contract...");
  const milestone1Amount = hre.ethers.utils.parseEther("200");
  const milestone2Amount = hre.ethers.utils.parseEther("300");
  
  const dueDate1 = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
  const dueDate2 = Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60); // 14 days from now

  await escrowVault.connect(client).addMilestone(
    2, // Contract ID
    "Demo existing cabinets and prepare surfaces",
    milestone1Amount,
    dueDate1
  );
  console.log("✅ Added milestone 1 to contract 2");

  await escrowVault.connect(client).addMilestone(
    2, // Contract ID
    "Install new cabinets and countertops",
    milestone2Amount,
    dueDate2
  );
  console.log("✅ Added milestone 2 to contract 2");

  // Activate Contract 2
  await escrowVault.connect(client).activateContract(2);
  console.log("✅ Activated contract 2");

  // Add milestones to Contract 3
  console.log("\n🎯 Adding milestones to large contract...");
  const milestone3Amount = hre.ethers.utils.parseEther("500");
  const milestone4Amount = hre.ethers.utils.parseEther("800");
  const milestone5Amount = hre.ethers.utils.parseEther("700");
  
  const dueDate3 = Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60); // 10 days
  const dueDate4 = Math.floor(Date.now() / 1000) + (20 * 24 * 60 * 60); // 20 days
  const dueDate5 = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days

  await escrowVault.connect(client).addMilestone(
    3, // Contract ID
    "Install new electrical panel and main connections",
    milestone3Amount,
    dueDate3
  );

  await escrowVault.connect(client).addMilestone(
    3, // Contract ID
    "Rewire main areas - living room, kitchen, bedrooms",
    milestone4Amount,
    dueDate4
  );

  await escrowVault.connect(client).addMilestone(
    3, // Contract ID
    "Final inspection, testing, and cleanup",
    milestone5Amount,
    dueDate5
  );
  console.log("✅ Added 3 milestones to contract 3");

  // Activate Contract 3
  await escrowVault.connect(client).activateContract(3);
  console.log("✅ Activated contract 3");

  // Simulate milestone completion for Contract 2
  console.log("\n✅ Simulating milestone completion...");
  await escrowVault.connect(contractor).completeMilestone(1); // First milestone of contract 2
  console.log("✅ Contractor marked milestone 1 as completed");

  // Simulate client approval
  await escrowVault.connect(client).approveMilestone(1);
  console.log("✅ Client approved milestone 1 - payment released");

  // Stake additional funds in Symbiotic vault
  console.log("\n📈 Adding more stakes to Symbiotic vault...");
  const additionalStake = hre.ethers.utils.parseEther("1000");
  
  // Contractor stakes in aggressive tranche
  await mockUSDT.connect(contractor).approve(symbioticVault.address, additionalStake);
  await symbioticVault.connect(contractor).stakeFunds(3, additionalStake);
  console.log("✅ Contractor staked in aggressive tranche");

  // Get final vault statistics
  const [totalValueLocked, totalStakers, trancheCount] = await symbioticVault.getVaultStats();
  console.log("\n📊 Final Vault Statistics:");
  console.log("Total Value Locked:", hre.ethers.utils.formatEther(totalValueLocked), "USDT");
  console.log("Total Stakers:", totalStakers.toString());
  console.log("Active Tranches:", trancheCount.toString());

  // Get tranche details
  for (let i = 1; i <= 3; i++) {
    const tranche = await symbioticVault.getTranche(i);
    console.log(`Tranche ${i} (${tranche.name}): ${hre.ethers.utils.formatEther(tranche.totalStaked)} USDT staked`);
  }

  // Check escrow contracts
  console.log("\n📋 Escrow Contracts Summary:");
  for (let i = 1; i <= 3; i++) {
    const contract = await escrowVault.contracts(i);
    console.log(`Contract ${i}: ${hre.ethers.utils.formatEther(contract.totalAmount)} USDT, Status: ${contract.status}`);
  }

  // Create testing data file
  const testingData = {
    accounts: {
      deployer: deployer.address,
      contractor: contractor.address,
      client: client.address
    },
    contracts: {
      1: {
        amount: "100",
        description: "Small plumbing repair",
        symbioticSecured: false,
        milestones: 0
      },
      2: {
        amount: "500",
        description: "Kitchen renovation",
        symbioticSecured: true,
        milestones: 2,
        status: "Active with completed milestone"
      },
      3: {
        amount: "2000",
        description: "Full house electrical rewiring",
        symbioticSecured: true,
        milestones: 3,
        status: "Active"
      }
    },
    vaultStats: {
      totalValueLocked: hre.ethers.utils.formatEther(totalValueLocked),
      totalStakers: totalStakers.toString(),
      trancheCount: trancheCount.toString()
    },
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    './testing-data.json',
    JSON.stringify(testingData, null, 2)
  );
  console.log("✅ Testing data saved to testing-data.json");

  console.log("\n🎉 Escrow funding completed!");
  console.log("📱 You can now test the following scenarios:");
  console.log("1. Browse available contracts in the frontend");
  console.log("2. Complete remaining milestones as contractor");
  console.log("3. Test dispute resolution");
  console.log("4. Check Symbiotic vault rewards");
  console.log("5. Test LayerZero DVN functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Funding failed:", error);
    process.exit(1);
  });
