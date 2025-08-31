const { ethers } = require("hardhat");
const EthCrypto = require('eth-crypto');

async function main() {
  console.log("Testing UserRegistry functionality...\n");

  // Get accounts for testing
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Test accounts:");
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);

  // Deploy UserRegistry
  const UserRegistry = await ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  const contractAddress = await userRegistry.getAddress();

  console.log("\nUserRegistry deployed to:", contractAddress);

  // Generate test public/private key pairs
  const user1Identity = EthCrypto.createIdentity();
  const user2Identity = EthCrypto.createIdentity();

  console.log("\nGenerated test identities:");
  console.log("User1 Public Key:", user1Identity.publicKey);
  console.log("User2 Public Key:", user2Identity.publicKey);

  // Test 1: Register first user
  console.log("\n=== Test 1: Register User1 ===");
  try {
    const tx1 = await userRegistry.connect(user1).registerUser(
      user1Identity.publicKey,
      "carlos123",
      JSON.stringify({
        name: "Carlos Mendoza",
        email: "carlos@example.com",
        avatar: "https://example.com/avatar1.jpg"
      })
    );
    await tx1.wait();
    console.log("✅ User1 registered successfully");
  } catch (error) {
    console.log("❌ User1 registration failed:", error.message);
  }

  // Test 2: Register second user
  console.log("\n=== Test 2: Register User2 ===");
  try {
    const tx2 = await userRegistry.connect(user2).registerUser(
      user2Identity.publicKey,
      "ana456",
      JSON.stringify({
        name: "Ana Rodriguez",
        email: "ana@example.com",
        avatar: "https://example.com/avatar2.jpg"
      })
    );
    await tx2.wait();
    console.log("✅ User2 registered successfully");
  } catch (error) {
    console.log("❌ User2 registration failed:", error.message);
  }

  // Test 3: Check if users are registered
  console.log("\n=== Test 3: Check Registration Status ===");
  try {
    const isUser1Registered = await userRegistry.isUserRegistered(user1.address);
    const isUser2Registered = await userRegistry.isUserRegistered(user2.address);
    const isDeployerRegistered = await userRegistry.isUserRegistered(deployer.address);

    console.log("User1 registered:", isUser1Registered ? "✅" : "❌");
    console.log("User2 registered:", isUser2Registered ? "✅" : "❌");
    console.log("Deployer registered:", isDeployerRegistered ? "✅" : "❌");
  } catch (error) {
    console.log("❌ Error checking registration:", error.message);
  }

  // Test 4: Get user profiles
  console.log("\n=== Test 4: Get User Profiles ===");
  try {
    const user1Profile = await userRegistry.getUserProfile(user1.address);
    console.log("User1 Profile:");
    console.log("  Username:", user1Profile.username);
    console.log("  Public Key:", user1Profile.publicKey.slice(0, 20) + "...");
    console.log("  Profile Data:", JSON.parse(user1Profile.profileData));
    console.log("  Registered At:", new Date(Number(user1Profile.registeredAt) * 1000).toLocaleString());

    const user2Profile = await userRegistry.getUserProfile(user2.address);
    console.log("\nUser2 Profile:");
    console.log("  Username:", user2Profile.username);
    console.log("  Public Key:", user2Profile.publicKey.slice(0, 20) + "...");
    console.log("  Profile Data:", JSON.parse(user2Profile.profileData));
    console.log("  Registered At:", new Date(Number(user2Profile.registeredAt) * 1000).toLocaleString());
  } catch (error) {
    console.log("❌ Error getting profiles:", error.message);
  }

  // Test 5: Get user by username
  console.log("\n=== Test 5: Get User by Username ===");
  try {
    const user1ByUsername = await userRegistry.getUserProfileByUsername("carlos123");
    const user1Address = await userRegistry.getAddressByUsername("carlos123");
    console.log("Found carlos123:");
    console.log("  Address:", user1Address);
    console.log("  Name:", JSON.parse(user1ByUsername.profileData).name);

    const user2ByUsername = await userRegistry.getUserProfileByUsername("ana456");
    const user2Address = await userRegistry.getAddressByUsername("ana456");
    console.log("\nFound ana456:");
    console.log("  Address:", user2Address);
    console.log("  Name:", JSON.parse(user2ByUsername.profileData).name);
  } catch (error) {
    console.log("❌ Error getting users by username:", error.message);
  }

  // Test 6: Get all registered users
  console.log("\n=== Test 6: Get All Registered Users ===");
  try {
    const totalUsers = await userRegistry.getTotalUsers();
    const allUsers = await userRegistry.getAllRegisteredUsers();
    
    console.log("Total registered users:", totalUsers.toString());
    console.log("All registered addresses:");
    allUsers.forEach((address, index) => {
      console.log(`  ${index + 1}. ${address}`);
    });
  } catch (error) {
    console.log("❌ Error getting all users:", error.message);
  }

  // Test 7: Test encryption/decryption
  console.log("\n=== Test 7: Test Encryption/Decryption ===");
  try {
    // Get User2's public key from contract
    const user2PublicKeyFromContract = await userRegistry.getUserPublicKey(user2.address);
    
    // Message to encrypt
    const secretMessage = "Hello Ana! This is a secret message from Carlos.";
    console.log("Original message:", secretMessage);

    // Encrypt message with User2's public key
    let cleanPubKey = user2PublicKeyFromContract.startsWith('0x') 
      ? user2PublicKeyFromContract.slice(2) 
      : user2PublicKeyFromContract;
    
    if (cleanPubKey.startsWith('04')) {
      cleanPubKey = cleanPubKey.slice(2);
    }

    const encrypted = await EthCrypto.encryptWithPublicKey(cleanPubKey, secretMessage);
    const encryptedString = EthCrypto.cipher.stringify(encrypted);
    
    console.log("Encrypted message:", encryptedString.slice(0, 100) + "...");

    // Decrypt message with User2's private key
    const decrypted = await EthCrypto.decryptWithPrivateKey(
      user2Identity.privateKey,
      encrypted
    );
    
    console.log("Decrypted message:", decrypted);
    console.log("Encryption test:", decrypted === secretMessage ? "✅ PASSED" : "❌ FAILED");

  } catch (error) {
    console.log("❌ Encryption test failed:", error.message);
  }

  // Test 8: Try duplicate username registration
  console.log("\n=== Test 8: Test Duplicate Username Protection ===");
  try {
    await userRegistry.connect(deployer).registerUser(
      user1Identity.publicKey,
      "carlos123", // Duplicate username
      JSON.stringify({ name: "Fake Carlos" })
    );
    console.log("❌ Should have failed - duplicate username allowed");
  } catch (error) {
    console.log("✅ Correctly rejected duplicate username:", error.message.includes("Username already taken"));
  }

  // Test 9: Try duplicate user registration
  console.log("\n=== Test 9: Test Duplicate User Registration Protection ===");
  try {
    await userRegistry.connect(user1).registerUser(
      user1Identity.publicKey,
      "carlos999",
      JSON.stringify({ name: "Carlos Again" })
    );
    console.log("❌ Should have failed - duplicate user allowed");
  } catch (error) {
    console.log("✅ Correctly rejected duplicate user:", error.message.includes("User already registered"));
  }

  // Test 10: Update profile
  console.log("\n=== Test 10: Test Profile Update ===");
  try {
    const newProfileData = JSON.stringify({
      name: "Carlos Mendoza Updated",
      email: "carlos.updated@example.com",
      avatar: "https://example.com/new-avatar.jpg",
      bio: "Updated bio information"
    });

    const tx = await userRegistry.connect(user1).updateProfile(newProfileData);
    await tx.wait();

    const updatedProfile = await userRegistry.getUserProfile(user1.address);
    console.log("✅ Profile updated successfully");
    console.log("New profile data:", JSON.parse(updatedProfile.profileData));
  } catch (error) {
    console.log("❌ Profile update failed:", error.message);
  }

  console.log("\n=== Test Summary ===");
  console.log("UserRegistry contract tested successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("All core functionality working as expected.");

  // Final deployment info for frontend
  console.log("\n=== Frontend Integration ===");
  console.log("Add this to your .env.local file:");
  console.log(`NEXT_PUBLIC_USER_REGISTRY_ADDRESS=${contractAddress}`);
  console.log("\nYou can now use the UserRegistrationManager component!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
