"use client"

import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { useBlockchain } from "./use-blockchain"

export interface StakeInfo {
  amount: string
  timestamp: number
  rewardDebt: string
}

export function useStaking() {
  const { getStakingContract, account, isConnected } = useBlockchain()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stake = useCallback(
    async (amount: string) => {
      if (!isConnected) throw new Error("Wallet not connected")

      setIsLoading(true)
      setError(null)

      try {
        const contract = getStakingContract()
        const valueInWei = ethers.parseEther(amount)

        const tx = await contract.stake({ value: valueInWei })
        const receipt = await tx.wait()

        return { tx, receipt }
      } catch (error: any) {
        setError(error.message || "Error staking")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [getStakingContract, isConnected],
  )

  const unstake = useCallback(
    async (amount: string) => {
      if (!isConnected) throw new Error("Wallet not connected")

      setIsLoading(true)
      setError(null)

      try {
        const contract = getStakingContract()
        const valueInWei = ethers.parseEther(amount)

        const tx = await contract.unstake(valueInWei)
        const receipt = await tx.wait()

        return { tx, receipt }
      } catch (error: any) {
        setError(error.message || "Error unstaking")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [getStakingContract, isConnected],
  )

  const claimRewards = useCallback(async () => {
    if (!isConnected) throw new Error("Wallet not connected")

    setIsLoading(true)
    setError(null)

    try {
      const contract = getStakingContract()
      const tx = await contract.claimRewards()
      const receipt = await tx.wait()

      return { tx, receipt }
    } catch (error: any) {
      setError(error.message || "Error claiming rewards")
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [getStakingContract, isConnected])

  const getPendingRewards = useCallback(
    async (userAddress?: string): Promise<string> => {
      if (!isConnected) throw new Error("Wallet not connected")

      const address = userAddress || account
      if (!address) throw new Error("No address provided")

      try {
        const contract = getStakingContract()
        const rewards = await contract.getPendingRewards(address)
        return ethers.formatEther(rewards)
      } catch (error: any) {
        setError(error.message || "Error fetching pending rewards")
        throw error
      }
    },
    [getStakingContract, isConnected, account],
  )

  const getStakeInfo = useCallback(
    async (userAddress?: string): Promise<StakeInfo> => {
      if (!isConnected) throw new Error("Wallet not connected")

      const address = userAddress || account
      if (!address) throw new Error("No address provided")

      try {
        const contract = getStakingContract()
        const stakeInfo = await contract.stakes(address)

        return {
          amount: ethers.formatEther(stakeInfo.amount),
          timestamp: Number(stakeInfo.timestamp),
          rewardDebt: ethers.formatEther(stakeInfo.rewardDebt),
        }
      } catch (error: any) {
        setError(error.message || "Error fetching stake info")
        throw error
      }
    },
    [getStakingContract, isConnected, account],
  )

  const getTotalStaked = useCallback(async (): Promise<string> => {
    if (!isConnected) throw new Error("Wallet not connected")

    try {
      const contract = getStakingContract()
      const totalStaked = await contract.totalStaked()
      return ethers.formatEther(totalStaked)
    } catch (error: any) {
      setError(error.message || "Error fetching total staked")
      throw error
    }
  }, [getStakingContract, isConnected])

  return {
    stake,
    unstake,
    claimRewards,
    getPendingRewards,
    getStakeInfo,
    getTotalStaked,
    isLoading,
    error,
  }
}
