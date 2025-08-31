const { ethers } = require('ethers');

async function testConnection() {
  console.log('🔍 Diagnostic script - Testing blockchain connection...\n');
  
  try {
    // Connect to local hardhat network
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    console.log('✅ Connected to provider');
    
    // Get network info
    const network = await provider.getNetwork();
    console.log('📡 Network:', {
      name: network.name,
      chainId: network.chainId.toString()
    });
    
    // Get accounts
    const accounts = await provider.listAccounts();
    console.log('👥 Available accounts:', accounts.length);
    
    // Check contract address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contractCode = await provider.getCode(contractAddress);
    console.log('📋 Contract deployed:', contractCode !== '0x' ? '✅ Yes' : '❌ No');
    
    if (contractCode !== '0x') {
      console.log('📄 Contract code length:', contractCode.length);
    }
    
    // Test with user's address
    const userAddress = "0xea80b4641e8171313f3a8CF78003BA6B2a2448d0";
    try {
      const balance = await provider.getBalance(userAddress);
      console.log('💰 User balance:', ethers.formatEther(balance), 'ETH');
    } catch (error) {
      console.log('❌ Error getting user balance:', error.message);
    }
    
    // Test contract call
    const abi = [
      "function getTotalUsers() external view returns (uint256)"
    ];
    
    try {
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const totalUsers = await contract.getTotalUsers();
      console.log('👤 Total registered users:', totalUsers.toString());
    } catch (error) {
      console.log('❌ Error calling contract:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Make sure MetaMask is connected to "Localhost 8545"');
  console.log('2. Chain ID should be: 31337');
  console.log('3. RPC URL should be: http://127.0.0.1:8545');
  console.log('4. Use one of the development accounts with 10000 ETH');
}

testConnection();
