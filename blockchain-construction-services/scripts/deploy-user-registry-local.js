const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying UserRegistry for local development...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy UserRegistry contract
  const UserRegistry = await ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();

  console.log("UserRegistry deployed to:", userRegistryAddress);

  // Update the environment file
  const fs = require('fs');
  const envContent = `NEXT_PUBLIC_USER_REGISTRY_ADDRESS=${userRegistryAddress}\n`;
  
  try {
    // Create or update .env.local file
    fs.writeFileSync('.env.local', envContent);
    console.log("Updated .env.local with contract address");
  } catch (error) {
    console.log("Could not update .env.local:", error.message);
  }

  console.log("\n🎉 Deployment Complete!");
  console.log("Contract address:", userRegistryAddress);
  console.log("You can now use the UserRegistrationManager component!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
