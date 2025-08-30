"use client"

import { useCallback } from 'react'
import { useWeb3, useContract } from './use-web3'
import { CONTRACT_ADDRESSES } from '@/lib/web3'

// ABI simplificado para ConstructionEscrow
const CONSTRUCTION_ESCROW_ABI = [
  "function createContract(address _contractor, string memory _description) external payable returns (uint256)",
  "function depositFunds(uint256 _contractId) external payable",
  "function releaseFunds(uint256 _contractId) external",
  "function requestRefund(uint256 _contractId) external",
  "function getContract(uint256 _contractId) external view returns (address, address, uint256, uint256, uint8, string memory)",
  "function getContractsByClient(address _client) external view returns (uint256[] memory)",
  "function getContractsByContractor(address _contractor) external view returns (uint256[] memory)",
  "event ContractCreated(uint256 indexed contractId, address indexed client, address indexed contractor, uint256 amount)"
]

// ABI simplificado para ServiceFeedback
const SERVICE_FEEDBACK_ABI = [
  "function submitReview(uint256 _contractId, uint8 _rating, string memory _comment) external",
  "function getReviews(address _contractor) external view returns (tuple(uint256,address,uint8,string,uint256)[] memory)",
  "function getContractorRating(address _contractor) external view returns (uint256, uint256)",
  "event ReviewSubmitted(uint256 indexed contractId, address indexed reviewer, address indexed contractor, uint8 rating)"
]

// ABI simplificado para StakingRewards
const STAKING_REWARDS_ABI = [
  "function stake(uint256 _amount) external",
  "function unstake(uint256 _amount) external",
  "function claimRewards() external",
  "function getStakeBalance(address _user) external view returns (uint256)",
  "function getPendingRewards(address _user) external view returns (uint256)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)"
]

export interface ContractData {
  id: number
  client: string
  contractor: string
  amount: string
  status: number
  description: string
}

export interface ReviewData {
  contractId: number
  reviewer: string
  rating: number
  comment: string
  timestamp: number
}

export const useConstructionContracts = () => {
  const { account, chainId } = useWeb3()
  const { getContractInstance } = useContract()

  const getContractAddress = useCallback(() => {
    if (!chainId) return null
    
    const networkKey = chainId === '0x1' ? 'ethereum' : 'sepolia'
    return CONTRACT_ADDRESSES[networkKey].CONSTRUCTION_ESCROW
  }, [chainId])

  const createContract = useCallback(async (
    contractorAddress: string,
    description: string,
    amount: string
  ) => {
    const contractAddress = getContractAddress()
    if (!contractAddress || !account) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, CONSTRUCTION_ESCROW_ABI)
    const { parseEther } = await import('ethers')
    
    const tx = await contract.createContract(
      contractorAddress,
      description,
      { value: parseEther(amount) }
    )
    
    return await tx.wait()
  }, [account, getContractAddress, getContractInstance])

  const depositFunds = useCallback(async (contractId: number, amount: string) => {
    const contractAddress = getContractAddress()
    if (!contractAddress || !account) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, CONSTRUCTION_ESCROW_ABI)
    const { parseEther } = await import('ethers')
    
    const tx = await contract.depositFunds(contractId, { value: parseEther(amount) })
    return await tx.wait()
  }, [account, getContractAddress, getContractInstance])

  const releaseFunds = useCallback(async (contractId: number) => {
    const contractAddress = getContractAddress()
    if (!contractAddress || !account) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, CONSTRUCTION_ESCROW_ABI)
    
    const tx = await contract.releaseFunds(contractId)
    return await tx.wait()
  }, [account, getContractAddress, getContractInstance])

  const getContractData = useCallback(async (contractId: number): Promise<ContractData> => {
    const contractAddress = getContractAddress()
    if (!contractAddress) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, CONSTRUCTION_ESCROW_ABI)
    
    const result = await contract.getContract(contractId)
    const { formatEther } = await import('ethers')
    
    return {
      id: contractId,
      client: result[0],
      contractor: result[1],
      amount: formatEther(result[2]),
      status: result[4],
      description: result[5]
    }
  }, [getContractAddress, getContractInstance])

  const getClientContracts = useCallback(async (clientAddress?: string): Promise<number[]> => {
    const contractAddress = getContractAddress()
    if (!contractAddress) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, CONSTRUCTION_ESCROW_ABI)
    
    const address = clientAddress || account
    if (!address) throw new Error('No address provided')
    
    return await contract.getContractsByClient(address)
  }, [account, getContractAddress, getContractInstance])

  const getContractorContracts = useCallback(async (contractorAddress?: string): Promise<number[]> => {
    const contractAddress = getContractAddress()
    if (!contractAddress) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, CONSTRUCTION_ESCROW_ABI)
    
    const address = contractorAddress || account
    if (!address) throw new Error('No address provided')
    
    return await contract.getContractsByContractor(address)
  }, [account, getContractAddress, getContractInstance])

  return {
    createContract,
    depositFunds,
    releaseFunds,
    getContractData,
    getClientContracts,
    getContractorContracts,
    contractAddress: getContractAddress()
  }
}

export const useServiceReviews = () => {
  const { account, chainId } = useWeb3()
  const { getContractInstance } = useContract()

  const getContractAddress = useCallback(() => {
    if (!chainId) return null
    
    const networkKey = chainId === '0x1' ? 'ethereum' : 'sepolia'
    return CONTRACT_ADDRESSES[networkKey].SERVICE_FEEDBACK
  }, [chainId])

  const submitReview = useCallback(async (
    contractId: number,
    rating: number,
    comment: string
  ) => {
    const contractAddress = getContractAddress()
    if (!contractAddress || !account) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, SERVICE_FEEDBACK_ABI)
    
    const tx = await contract.submitReview(contractId, rating, comment)
    return await tx.wait()
  }, [account, getContractAddress, getContractInstance])

  const getContractorReviews = useCallback(async (contractorAddress: string): Promise<ReviewData[]> => {
    const contractAddress = getContractAddress()
    if (!contractAddress) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, SERVICE_FEEDBACK_ABI)
    
    const reviews = await contract.getReviews(contractorAddress)
    
    return reviews.map((review: any) => ({
      contractId: review[0],
      reviewer: review[1],
      rating: review[2],
      comment: review[3],
      timestamp: review[4]
    }))
  }, [getContractAddress, getContractInstance])

  const getContractorRating = useCallback(async (contractorAddress: string): Promise<{ totalRating: number; reviewCount: number }> => {
    const contractAddress = getContractAddress()
    if (!contractAddress) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, SERVICE_FEEDBACK_ABI)
    
    const result = await contract.getContractorRating(contractorAddress)
    
    return {
      totalRating: result[0],
      reviewCount: result[1]
    }
  }, [getContractAddress, getContractInstance])

  return {
    submitReview,
    getContractorReviews,
    getContractorRating,
    contractAddress: getContractAddress()
  }
}

export const useStakingSystem = () => {
  const { account, chainId } = useWeb3()
  const { getContractInstance } = useContract()

  const getContractAddress = useCallback(() => {
    if (!chainId) return null
    
    const networkKey = chainId === '0x1' ? 'ethereum' : 'sepolia'
    return CONTRACT_ADDRESSES[networkKey].STAKING_REWARDS
  }, [chainId])

  const stake = useCallback(async (amount: string) => {
    const contractAddress = getContractAddress()
    if (!contractAddress || !account) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, STAKING_REWARDS_ABI)
    const { parseEther } = await import('ethers')
    
    const tx = await contract.stake(parseEther(amount))
    return await tx.wait()
  }, [account, getContractAddress, getContractInstance])

  const unstake = useCallback(async (amount: string) => {
    const contractAddress = getContractAddress()
    if (!contractAddress || !account) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, STAKING_REWARDS_ABI)
    const { parseEther } = await import('ethers')
    
    const tx = await contract.unstake(parseEther(amount))
    return await tx.wait()
  }, [account, getContractAddress, getContractInstance])

  const claimRewards = useCallback(async () => {
    const contractAddress = getContractAddress()
    if (!contractAddress || !account) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, STAKING_REWARDS_ABI)
    
    const tx = await contract.claimRewards()
    return await tx.wait()
  }, [account, getContractAddress, getContractInstance])

  const getStakeBalance = useCallback(async (userAddress?: string): Promise<string> => {
    const contractAddress = getContractAddress()
    if (!contractAddress) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, STAKING_REWARDS_ABI)
    
    const address = userAddress || account
    if (!address) throw new Error('No address provided')
    
    const balance = await contract.getStakeBalance(address)
    const { formatEther } = await import('ethers')
    
    return formatEther(balance)
  }, [account, getContractAddress, getContractInstance])

  const getPendingRewards = useCallback(async (userAddress?: string): Promise<string> => {
    const contractAddress = getContractAddress()
    if (!contractAddress) throw new Error('Contract not available')

    const contract = await getContractInstance(contractAddress, STAKING_REWARDS_ABI)
    
    const address = userAddress || account
    if (!address) throw new Error('No address provided')
    
    const rewards = await contract.getPendingRewards(address)
    const { formatEther } = await import('ethers')
    
    return formatEther(rewards)
  }, [account, getContractAddress, getContractInstance])

  return {
    stake,
    unstake,
    claimRewards,
    getStakeBalance,
    getPendingRewards,
    contractAddress: getContractAddress()
  }
}
