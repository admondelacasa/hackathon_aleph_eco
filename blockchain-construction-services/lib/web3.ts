import { ethers } from 'ethers'

// Configuración de redes
export const NETWORKS = {
  ethereum: {
    chainId: '0x1', // 1 en hexadecimal
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://etherscan.io/'],
  },
  sepolia: {
    chainId: '0xaa36a7', // 11155111 en hexadecimal
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
}

// Direcciones de contratos deployados (actualizar después del deployment)
export const CONTRACT_ADDRESSES = {
  ethereum: {
    CONSTRUCTION_ESCROW: '0x...', // Dirección después del deployment
    SERVICE_FEEDBACK: '0x...', // Dirección después del deployment
    STAKING_REWARDS: '0x...', // Dirección después del deployment
  },
  sepolia: {
    CONSTRUCTION_ESCROW: '0x...', // Dirección después del deployment en testnet
    SERVICE_FEEDBACK: '0x...', // Dirección después del deployment en testnet
    STAKING_REWARDS: '0x...', // Dirección después del deployment en testnet
  },
}

// Función para obtener el provider de Web3
export const getWeb3Provider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  throw new Error('Web3 provider not found. Please install MetaMask.')
}

// Función para obtener el signer (usuario conectado)
export const getSigner = async () => {
  const provider = getWeb3Provider()
  return await provider.getSigner()
}

// Función para conectar wallet
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado')
    }

    // Solicitar acceso a las cuentas
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    // Obtener información de la red actual
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    })

    return {
      account: accounts[0],
      chainId,
    }
  } catch (error) {
    console.error('Error conectando wallet:', error)
    throw error
  }
}

// Función para cambiar de red
export const switchNetwork = async (networkKey: keyof typeof NETWORKS) => {
  try {
    const network = NETWORKS[networkKey]
    
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    })
  } catch (error: any) {
    // Si la red no está agregada, la agregamos
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORKS[networkKey]],
        })
      } catch (addError) {
        throw addError
      }
    } else {
      throw error
    }
  }
}

// Función para obtener balance de ETH
export const getBalance = async (address: string) => {
  const provider = getWeb3Provider()
  const balance = await provider.getBalance(address)
  return ethers.formatEther(balance)
}

// Función para enviar transacción
export const sendTransaction = async (to: string, value: string, data?: string) => {
  const signer = await getSigner()
  
  const transaction = {
    to,
    value: ethers.parseEther(value),
    data: data || '0x',
  }

  const tx = await signer.sendTransaction(transaction)
  return await tx.wait()
}

// Tipos para TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}

export type NetworkKey = keyof typeof NETWORKS
export type ContractAddresses = typeof CONTRACT_ADDRESSES[NetworkKey]
