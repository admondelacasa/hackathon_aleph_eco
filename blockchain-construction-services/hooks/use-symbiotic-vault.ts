"use client"

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

export interface SymbioticVaultData {
  totalValueLocked: string
  totalStakers: number
  activeTrancheCount: number
  totalRewardsDistributed: string
  averageAPY: number
}

export interface TrancheInfo {
  id: number
  name: string
  riskLevel: number
  expectedYield: number
  totalStaked: string
  maxCapacity: string
  minStake: string
  utilizationRate: number
  isActive: boolean
}

export interface StakerPosition {
  totalStaked: string
  activeTrancheId: number
  stakingTimestamp: number
  pendingWithdrawal: string
  earnedRewards: string
  isSlashed: boolean
  currentAPY: number
  timeUntilWithdrawal: number
}

export interface SecurityRequest {
  id: number
  network: string
  securityAmount: string
  duration: number
  premiumRate: number
  collateralRatio: number
  isActive: boolean
  isFulfilled: boolean
  estimatedRewards: string
}

export interface UseSymbioticVaultReturn {
  // Vault Data
  vaultData: SymbioticVaultData | null
  tranches: TrancheInfo[]
  stakerPosition: StakerPosition | null
  securityRequests: SecurityRequest[]
  
  // Actions
  stakeInTranche: (trancheId: number, amount: string) => Promise<boolean>
  requestWithdrawal: (amount: string) => Promise<boolean>
  completeWithdrawal: () => Promise<boolean>
  claimRewards: () => Promise<boolean>
  
  // Security Provision
  provideSecurityToNetwork: (
    network: string, 
    securityAmount: string, 
    duration: number, 
    premiumRate: number
  ) => Promise<number | null>
  
  // State
  isLoading: boolean
  error: string | null
  isConnected: boolean
  
  // Utils
  refreshData: () => Promise<void>
  estimateGasForStaking: (trancheId: number, amount: string) => Promise<string>
  calculateExpectedRewards: (trancheId: number, amount: string, duration: number) => string
}

const SYMBIOTIC_VAULT_ABI = [
  // View functions
  "function getTotalValueLocked() view returns (uint256)",
  "function getTrancheInfo(uint256) view returns (tuple(string name, uint256 riskLevel, uint256 expectedYield, uint256 totalStaked, uint256 maxCapacity, uint256 minStake, bool isActive))",
  "function getStakerInfo(address) view returns (uint256 totalStaked, uint256 activeTrancheId, uint256 pendingWithdrawal, uint256 earnedRewards, bool isSlashed)",
  "function getTrancheUtilization(uint256) view returns (uint256)",
  "function calculateRewards(address) view returns (uint256)",
  "function nextTrancheId() view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function totalRewards() view returns (uint256)",
  
  // Write functions
  "function stakeInTranche(uint256 trancheId, uint256 amount)",
  "function requestWithdrawal(uint256 amount)",
  "function withdraw()",
  "function claimRewards()",
  "function provideSecurityToNetwork(address network, uint256 securityAmount, uint256 duration, uint256 premiumRate) returns (uint256)",
  
  // Events
  "event Staked(address indexed staker, uint256 trancheId, uint256 amount)",
  "event WithdrawalRequested(address indexed staker, uint256 amount)",
  "event Withdrawn(address indexed staker, uint256 amount)",
  "event RewardsClaimed(address indexed staker, uint256 amount)",
  "event SecurityProvided(address indexed network, uint256 amount, uint256 premium)"
]

// Mock Symbiotic Vault contract address (replace with actual deployment)
const SYMBIOTIC_VAULT_ADDRESS = "0x1234567890123456789012345678901234567890"

export const useSymbioticVault = (userAddress?: string): UseSymbioticVaultReturn => {
  const [vaultData, setVaultData] = useState<SymbioticVaultData | null>(null)
  const [tranches, setTranches] = useState<TrancheInfo[]>([])
  const [stakerPosition, setStakerPosition] = useState<StakerPosition | null>(null)
  const [securityRequests, setSecurityRequests] = useState<SecurityRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Mock data for development
  const mockVaultData: SymbioticVaultData = {
    totalValueLocked: "12,500,000",
    totalStakers: 1284,
    activeTrancheCount: 3,
    totalRewardsDistributed: "2,100,000",
    averageAPY: 12.5
  }

  const mockTranches: TrancheInfo[] = [
    {
      id: 0,
      name: "Conservative",
      riskLevel: 2,
      expectedYield: 800, // 8%
      totalStaked: "6,500,000",
      maxCapacity: "10,000,000",
      minStake: "10",
      utilizationRate: 65,
      isActive: true
    },
    {
      id: 1,
      name: "Balanced",
      riskLevel: 5,
      expectedYield: 1200, // 12%
      totalStaked: "4,200,000",
      maxCapacity: "5,000,000",
      minStake: "50",
      utilizationRate: 84,
      isActive: true
    },
    {
      id: 2,
      name: "Aggressive",
      riskLevel: 8,
      expectedYield: 2000, // 20%
      totalStaked: "1,800,000",
      maxCapacity: "2,000,000",
      minStake: "100",
      utilizationRate: 90,
      isActive: true
    }
  ]

  const mockStakerPosition: StakerPosition = {
    totalStaked: "50,000",
    activeTrancheId: 1,
    stakingTimestamp: Date.now() - 86400000 * 30, // 30 days ago
    pendingWithdrawal: "0",
    earnedRewards: "1,250.50",
    isSlashed: false,
    currentAPY: 12.0,
    timeUntilWithdrawal: 0
  }

  const mockSecurityRequests: SecurityRequest[] = [
    {
      id: 1,
      network: "Arbitrum Bridge",
      securityAmount: "5,000,000",
      duration: 30,
      premiumRate: 250, // 2.5%
      collateralRatio: 150,
      isActive: true,
      isFulfilled: true,
      estimatedRewards: "10,416.67"
    },
    {
      id: 2,
      network: "Polygon zkEVM",
      securityAmount: "3,000,000",
      duration: 90,
      premiumRate: 300, // 3%
      collateralRatio: 150,
      isActive: true,
      isFulfilled: false,
      estimatedRewards: "22,191.78"
    }
  ]

  useEffect(() => {
    if (userAddress) {
      setIsConnected(true)
      loadMockData()
    } else {
      setIsConnected(false)
      setStakerPosition(null)
    }
  }, [userAddress])

  const loadMockData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setVaultData(mockVaultData)
      setTranches(mockTranches)
      setStakerPosition(mockStakerPosition)
      setSecurityRequests(mockSecurityRequests)
    } catch (err: any) {
      setError(err.message || 'Error loading vault data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    await loadMockData()
  }, [loadMockData])

  const stakeInTranche = useCallback(async (trancheId: number, amount: string): Promise<boolean> => {
    if (!isConnected) {
      setError('Wallet not connected')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update mock data
      const tranche = tranches.find(t => t.id === trancheId)
      if (tranche) {
        const newStaked = parseFloat(tranche.totalStaked.replace(/,/g, '')) + parseFloat(amount)
        tranche.totalStaked = newStaked.toLocaleString()
        tranche.utilizationRate = Math.round((newStaked / parseFloat(tranche.maxCapacity.replace(/,/g, ''))) * 100)
      }

      if (stakerPosition) {
        const newTotal = parseFloat(stakerPosition.totalStaked.replace(/,/g, '')) + parseFloat(amount)
        setStakerPosition({
          ...stakerPosition,
          totalStaked: newTotal.toLocaleString(),
          activeTrancheId: trancheId,
          stakingTimestamp: Date.now()
        })
      }

      return true
    } catch (err: any) {
      setError(err.message || 'Error staking tokens')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, tranches, stakerPosition])

  const requestWithdrawal = useCallback(async (amount: string): Promise<boolean> => {
    if (!isConnected || !stakerPosition) {
      setError('Wallet not connected or no position')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setStakerPosition({
        ...stakerPosition,
        pendingWithdrawal: amount,
        timeUntilWithdrawal: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
      })

      return true
    } catch (err: any) {
      setError(err.message || 'Error requesting withdrawal')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, stakerPosition])

  const completeWithdrawal = useCallback(async (): Promise<boolean> => {
    if (!isConnected || !stakerPosition) {
      setError('Wallet not connected or no position')
      return false
    }

    if (stakerPosition.timeUntilWithdrawal > Date.now()) {
      setError('Withdrawal delay period not yet complete')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const withdrawalAmount = parseFloat(stakerPosition.pendingWithdrawal.replace(/,/g, ''))
      const newTotal = parseFloat(stakerPosition.totalStaked.replace(/,/g, '')) - withdrawalAmount

      setStakerPosition({
        ...stakerPosition,
        totalStaked: newTotal.toLocaleString(),
        pendingWithdrawal: "0",
        timeUntilWithdrawal: 0
      })

      return true
    } catch (err: any) {
      setError(err.message || 'Error completing withdrawal')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, stakerPosition])

  const claimRewards = useCallback(async (): Promise<boolean> => {
    if (!isConnected || !stakerPosition) {
      setError('Wallet not connected or no position')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setStakerPosition({
        ...stakerPosition,
        earnedRewards: "0"
      })

      return true
    } catch (err: any) {
      setError(err.message || 'Error claiming rewards')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, stakerPosition])

  const provideSecurityToNetwork = useCallback(async (
    network: string,
    securityAmount: string,
    duration: number,
    premiumRate: number
  ): Promise<number | null> => {
    if (!isConnected) {
      setError('Wallet not connected')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newRequest: SecurityRequest = {
        id: securityRequests.length + 1,
        network,
        securityAmount,
        duration,
        premiumRate,
        collateralRatio: 150,
        isActive: true,
        isFulfilled: false,
        estimatedRewards: calculateExpectedRewards(1, securityAmount, duration)
      }

      setSecurityRequests([...securityRequests, newRequest])
      return newRequest.id
    } catch (err: any) {
      setError(err.message || 'Error providing security')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, securityRequests])

  const estimateGasForStaking = useCallback(async (trancheId: number, amount: string): Promise<string> => {
    // Mock gas estimation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const baseGas = 150000
    const amountMultiplier = parseFloat(amount) > 1000 ? 1.2 : 1.0
    const estimatedGas = Math.round(baseGas * amountMultiplier)
    
    return estimatedGas.toString()
  }, [])

  const calculateExpectedRewards = useCallback((trancheId: number, amount: string, duration: number): string => {
    const tranche = tranches.find(t => t.id === trancheId)
    if (!tranche) return "0"

    const principal = parseFloat(amount.replace(/,/g, ''))
    const yearlyRate = tranche.expectedYield / 10000 // Convert basis points to decimal
    const durationInYears = duration / 365
    
    const expectedRewards = principal * yearlyRate * durationInYears
    return expectedRewards.toFixed(2)
  }, [tranches])

  return {
    vaultData,
    tranches,
    stakerPosition,
    securityRequests,
    stakeInTranche,
    requestWithdrawal,
    completeWithdrawal,
    claimRewards,
    provideSecurityToNetwork,
    isLoading,
    error,
    isConnected,
    refreshData,
    estimateGasForStaking,
    calculateExpectedRewards
  }
}
