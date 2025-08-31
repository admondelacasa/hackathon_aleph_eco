const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying UserRegistry contract...");

  // Deploy UserRegistry
  const UserRegistry = await ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();
  
  console.log("UserRegistry deployed to:", userRegistryAddress);

  // Create .env.local file with contract address
  const envContent = `NEXT_PUBLIC_USER_REGISTRY_ADDRESS=${userRegistryAddress}
`;
  
  const envPath = path.join(__dirname, '../.env.local');
  fs.writeFileSync(envPath, envContent);
  
  console.log("Environment file created at:", envPath);
  console.log("Contract address saved to .env.local");

  // Test the contract
  console.log("\nTesting contract functionality...");
  
  // Get signers
  const [owner, user1] = await ethers.getSigners();
  
  // Test user registration
  const testUsername = "TestUser";
  const testPublicKey = "0x04abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab";
  const testProfileData = JSON.stringify({ name: "Test User", email: "test@example.com" });
  
  console.log("Registering test user...");
  const tx = await userRegistry.connect(user1).registerUser(testPublicKey, testUsername, testProfileData);
  await tx.wait();
  
  console.log("✅ User registered successfully");
  
  // Test user retrieval
  const isRegistered = await userRegistry.isUserRegistered(user1.address);
  console.log("Is user registered:", isRegistered);
  
  const profile = await userRegistry.getUserProfileByUsername(testUsername);
  console.log("User profile:", {
    publicKey: profile.publicKey,
    username: profile.username,
    profileData: profile.profileData,
    registeredAt: Number(profile.registeredAt),
    isRegistered: profile.isRegistered
  });
  
  console.log("\n✅ Deployment and testing completed successfully!");
  console.log("You can now use the Web3 user system in the frontend.");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
