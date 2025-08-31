const hre = require("hardhat");

async function main() {
  console.log("🔨 Compiling contracts...");
  
  try {
    // Compile all contracts
    await hre.run("compile");
    console.log("✅ All contracts compiled successfully!");
    
    // Check specific contracts exist
    const contracts = [
      "MockERC20",
      "MockSymbioticVault", 
      "SymbioticAdapter",
      "EscrowVault"
    ];
    
    console.log("\n📋 Verifying contract factories...");
    for (const contractName of contracts) {
      try {
        await hre.ethers.getContractFactory(contractName);
        console.log(`✅ ${contractName} - Factory available`);
      } catch (error) {
        console.log(`❌ ${contractName} - Error: ${error.message}`);
      }
    }
    
    console.log("\n🎉 Contract verification completed!");
    
  } catch (error) {
    console.error("❌ Compilation failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
