#!/usr/bin/env node

/**
 * Script para deployar los contratos inteligentes de BuildTrust
 * 
 * Uso:
 * 1. Instalar dependencias: npm install hardhat @nomiclabs/hardhat-ethers ethers
 * 2. Configurar hardhat.config.js con tu private key e infura key
 * 3. Ejecutar: node deploy-contracts.js --network sepolia (para testnet)
 *             node deploy-contracts.js --network mainnet (para mainnet)
 */

const { ethers } = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  console.log('🚀 Iniciando deployment de contratos BuildTrust...\n')

  const [deployer] = await ethers.getSigners()
  
  console.log('👤 Deployando con la cuenta:', deployer.address)
  console.log('💰 Balance de la cuenta:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH\n')

  // Deploy ConstructionEscrow
  console.log('📝 Deployando ConstructionEscrow...')
  const ConstructionEscrow = await ethers.getContractFactory('ConstructionEscrow')
  const constructionEscrow = await ConstructionEscrow.deploy()
  await constructionEscrow.waitForDeployment()
  
  const escrowAddress = await constructionEscrow.getAddress()
  console.log('✅ ConstructionEscrow deployado en:', escrowAddress)

  // Deploy ServiceFeedback
  console.log('\n📝 Deployando ServiceFeedback...')
  const ServiceFeedback = await ethers.getContractFactory('ServiceFeedback')
  const serviceFeedback = await ServiceFeedback.deploy()
  await serviceFeedback.waitForDeployment()
  
  const feedbackAddress = await serviceFeedback.getAddress()
  console.log('✅ ServiceFeedback deployado en:', feedbackAddress)

  // Deploy StakingRewards (requiere un token ERC20, por ahora usamos ETH)
  console.log('\n📝 Deployando StakingRewards...')
  const StakingRewards = await ethers.getContractFactory('StakingRewards')
  const stakingRewards = await StakingRewards.deploy()
  await stakingRewards.waitForDeployment()
  
  const stakingAddress = await stakingRewards.getAddress()
  console.log('✅ StakingRewards deployado en:', stakingAddress)

  // Preparar información para actualizar el archivo web3.ts
  const network = await deployer.provider.getNetwork()
  const networkName = network.chainId === 1n ? 'ethereum' : 'sepolia'
  
  const deploymentInfo = {
    network: networkName,
    chainId: network.chainId.toString(),
    contracts: {
      CONSTRUCTION_ESCROW: escrowAddress,
      SERVICE_FEEDBACK: feedbackAddress,
      STAKING_REWARDS: stakingAddress
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    gasUsed: {
      // Estos valores se calcularían con las transacciones reales
      constructionEscrow: 'Pending',
      serviceFeedback: 'Pending', 
      stakingRewards: 'Pending'
    }
  }

  // Guardar información de deployment
  const deploymentPath = path.join(__dirname, '..', 'deployment-info.json')
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2))

  console.log('\n📋 Resumen del Deployment:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🌐 Red: ${networkName} (Chain ID: ${network.chainId})`)
  console.log(`👤 Deployer: ${deployer.address}`)
  console.log(`📝 ConstructionEscrow: ${escrowAddress}`)
  console.log(`⭐ ServiceFeedback: ${feedbackAddress}`)
  console.log(`💎 StakingRewards: ${stakingAddress}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('📄 Información guardada en deployment-info.json')
  
  console.log('\n🔧 PRÓXIMOS PASOS:')
  console.log('1. Actualizar lib/web3.ts con las nuevas direcciones de contratos')
  console.log('2. Verificar contratos en Etherscan (opcional)')
  console.log('3. Probar la integración en la interfaz web')

  // Generar código para actualizar web3.ts
  console.log('\n📋 Código para actualizar lib/web3.ts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`export const CONTRACT_ADDRESSES = {
  ethereum: {
    CONSTRUCTION_ESCROW: '${networkName === 'ethereum' ? escrowAddress : '0x...'}',
    SERVICE_FEEDBACK: '${networkName === 'ethereum' ? feedbackAddress : '0x...'}',
    STAKING_REWARDS: '${networkName === 'ethereum' ? stakingAddress : '0x...'}',
  },
  sepolia: {
    CONSTRUCTION_ESCROW: '${networkName === 'sepolia' ? escrowAddress : '0x...'}',
    SERVICE_FEEDBACK: '${networkName === 'sepolia' ? feedbackAddress : '0x...'}',
    STAKING_REWARDS: '${networkName === 'sepolia' ? stakingAddress : '0x...'}',
  },
}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  console.log('\n✨ ¡Deployment completado exitosamente!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error durante el deployment:', error)
    process.exit(1)
  })
