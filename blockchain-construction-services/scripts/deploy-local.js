const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting local deployment of Symbiotic Network contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Mock ERC20 Token for testing
  console.log("\n📄 Deploying Mock USDT...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockUSDT = await MockERC20.deploy(
    "Mock USDT",
    "USDT",
    18,
    hre.ethers.utils.parseEther("1000000") // 1M initial supply
  );
  await mockUSDT.deployed();
  console.log("✅ Mock USDT deployed to:", mockUSDT.address);

  // Deploy MockSymbioticVault
  console.log("\n🏦 Deploying MockSymbioticVault...");
  const MockSymbioticVault = await hre.ethers.getContractFactory("MockSymbioticVault");
  const symbioticVault = await MockSymbioticVault.deploy(mockUSDT.address);
  await symbioticVault.deployed();
  console.log("✅ MockSymbioticVault deployed to:", symbioticVault.address);

  // Deploy SymbioticAdapter
  console.log("\n🔗 Deploying SymbioticAdapter...");
  const SymbioticAdapter = await hre.ethers.getContractFactory("SymbioticAdapter");
  const symbioticAdapter = await SymbioticAdapter.deploy(
    symbioticVault.address,
    mockUSDT.address
  );
  await symbioticAdapter.deployed();
  console.log("✅ SymbioticAdapter deployed to:", symbioticAdapter.address);

  // Deploy EscrowVault (with symbioticAdapter)
  console.log("\n� Deploying EscrowVault...");
  const EscrowVault = await hre.ethers.getContractFactory("EscrowVault");
  const escrowVault = await EscrowVault.deploy(
    mockUSDT.address,
    symbioticAdapter.address
  );
  await escrowVault.deployed();
  console.log("✅ EscrowVault deployed to:", escrowVault.address);

  // Deploy LayerZero DVN (original contract)
  console.log("\n⚡ Deploying LayerZeroDVN...");
  const LayerZeroDVN = await hre.ethers.getContractFactory("LayerZeroDVN");
  const layerZeroDVN = await LayerZeroDVN.deploy(symbioticVault.address);
  await layerZeroDVN.deployed();
  console.log("✅ LayerZeroDVN deployed to:", layerZeroDVN.address);

  // Initial setup and funding
  console.log("\n💰 Setting up initial funding...");
  
  // Transfer some tokens to deployer for testing
  const transferAmount = hre.ethers.utils.parseEther("10000"); // 10K tokens
  await mockUSDT.transfer(deployer.address, transferAmount);
  console.log("✅ Transferred", hre.ethers.utils.formatEther(transferAmount), "tokens to deployer");

  // Approve SymbioticVault to spend tokens
  await mockUSDT.approve(symbioticVault.address, hre.ethers.utils.parseEther("5000"));
  console.log("✅ Approved SymbioticVault to spend tokens");

  // Approve EscrowVault to spend tokens
  await mockUSDT.approve(escrowVault.address, hre.ethers.utils.parseEther("5000"));
  console.log("✅ Approved EscrowVault to spend tokens");

  // Test deposit to Symbiotic vault
  console.log("\n📈 Testing vault deposit...");
  const depositAmount = hre.ethers.utils.parseEther("1000"); // 1K tokens
  const shares = await symbioticVault.deposit(mockUSDT.address, depositAmount);
  console.log("✅ Deposited", hre.ethers.utils.formatEther(depositAmount), "tokens, received shares:", shares.toString());

  // Get vault stats
  const totalAssets = await symbioticVault.totalAssets(mockUSDT.address);
  const totalShares = await symbioticVault.totalShares();
  console.log("\n📊 Vault Statistics:");
  console.log("Total Assets:", hre.ethers.utils.formatEther(totalAssets), "USDT");
  console.log("Total Shares:", totalShares.toString());

  // Create a test escrow contract
  console.log("\n📋 Creating test escrow contract...");
  const testContractAmount = hre.ethers.utils.parseEther("500"); // 500 USDT
  const tx = await escrowVault.createContract(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Second account as contractor
    testContractAmount,
    "Test construction service",
    false // Disable Symbiotic security for now (simplified)
  );
  const receipt = await tx.wait();
  console.log("✅ Test escrow contract created, tx:", receipt.transactionHash);

  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("==================");
  console.log("Mock USDT:", mockUSDT.address);
  console.log("MockSymbioticVault:", symbioticVault.address);
  console.log("EscrowVault:", escrowVault.address);
  console.log("SymbioticAdapter:", symbioticAdapter.address);
  console.log("LayerZeroDVN:", layerZeroDVN.address);
  console.log("==================");

  // Save addresses to file for frontend
  const fs = require('fs');
  const addresses = {
    mockUSDT: mockUSDT.address,
    symbioticVault: symbioticVault.address,
    escrowVault: escrowVault.address,
    symbioticAdapter: symbioticAdapter.address,
    layerZeroDVN: layerZeroDVN.address,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    './deployed-addresses.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log("✅ Addresses saved to deployed-addresses.json");

  console.log("\n🚀 Local deployment completed successfully!");
  console.log("You can now test the contracts using the frontend or scripts.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
