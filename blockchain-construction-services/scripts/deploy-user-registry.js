const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying UserRegistry contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy UserRegistry contract
  const UserRegistry = await ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();

  console.log("UserRegistry deployed to:", userRegistryAddress);

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    userRegistry: {
      address: userRegistryAddress,
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
    }
  };

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", network.name);
  console.log("UserRegistry Address:", userRegistryAddress);
  console.log("Deployer:", deployer.address);
  console.log("Gas Used: Estimating...");

  // Estimate gas for basic operations
  try {
    const gasEstimates = {
      registerUser: await userRegistry.registerUser.estimateGas(
        "0x04abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
        "testuser",
        JSON.stringify({ name: "Test User", email: "test@example.com" })
      ),
      getUserProfile: await userRegistry.getUserProfile.estimateGas(deployer.address)
    };
    
    console.log("\n=== Gas Estimates ===");
    console.log("Register User:", gasEstimates.registerUser.toString());
    console.log("Get User Profile:", gasEstimates.getUserProfile.toString());
  } catch (error) {
    console.log("Could not estimate gas (contract not yet ready)");
  }

  // Create environment variables content
  const envContent = `# UserRegistry Contract Deployment
NEXT_PUBLIC_USER_REGISTRY_ADDRESS=${userRegistryAddress}
NEXT_PUBLIC_NETWORK_NAME=${network.name}
`;

  console.log("\n=== Environment Variables ===");
  console.log("Add these to your .env.local file:");
  console.log(envContent);

  // Verify contract source code (if not local network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nVerifying contract...");
    try {
      await run("verify:verify", {
        address: userRegistryAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
      console.log("You can verify manually later using:");
      console.log(`npx hardhat verify --network ${network.name} ${userRegistryAddress}`);
    }
  }

  return deploymentInfo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
