"use client"

import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { useBlockchain } from "./use-blockchain"
import { SERVICE_TYPES } from "@/lib/contracts"

export interface Service {
  id: number
  client: string
  contractor: string
  totalAmount: string
  releasedAmount: string
  milestones: number
  completedMilestones: number
  status: number
  description: string
  serviceType: number
  createdAt: number
  deadline: number
}

export interface Milestone {
  serviceId: number
  milestoneIndex: number
  description: string
  amount: string
  completed: boolean
  approved: boolean
  completedAt: number
}

export function useConstructionServices() {
  const { getEscrowContract, account, isConnected } = useBlockchain()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createService = useCallback(
    async (
      contractor: string,
      description: string,
      deadline: number,
      serviceType: keyof typeof SERVICE_TYPES,
      milestoneDescriptions: string[],
      value: string,
    ) => {
      if (!isConnected) throw new Error("Wallet not connected")

      setIsLoading(true)
      setError(null)

      try {
        const contract = getEscrowContract()
        const valueInWei = ethers.parseEther(value)

        const tx = await contract.createService(
          contractor,
          milestoneDescriptions.length,
          description,
          deadline,
          SERVICE_TYPES[serviceType],
          milestoneDescriptions,
          { value: valueInWei },
        )

        const receipt = await tx.wait()

        // Extract service ID from event logs
        const serviceCreatedEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log)
            return parsed?.name === "ServiceCreated"
          } catch {
            return false
          }
        })

        let serviceId = null
        if (serviceCreatedEvent) {
          const parsed = contract.interface.parseLog(serviceCreatedEvent)
          serviceId = parsed?.args[0]
        }

        return { tx, receipt, serviceId }
      } catch (error: any) {
        setError(error.message || "Error creating service")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [getEscrowContract, isConnected],
  )

  const getService = useCallback(
    async (serviceId: number): Promise<Service> => {
      if (!isConnected) throw new Error("Wallet not connected")

      try {
        const contract = getEscrowContract()
        const service = await contract.getService(serviceId)

        return {
          id: Number(service.id),
          client: service.client,
          contractor: service.contractor,
          totalAmount: ethers.formatEther(service.totalAmount),
          releasedAmount: ethers.formatEther(service.releasedAmount),
          milestones: Number(service.milestones),
          completedMilestones: Number(service.completedMilestones),
          status: Number(service.status),
          description: service.description,
          serviceType: Number(service.serviceType),
          createdAt: Number(service.createdAt),
          deadline: Number(service.deadline),
        }
      } catch (error: any) {
        setError(error.message || "Error fetching service")
        throw error
      }
    },
    [getEscrowContract, isConnected],
  )

  const getServiceMilestones = useCallback(
    async (serviceId: number): Promise<Milestone[]> => {
      if (!isConnected) throw new Error("Wallet not connected")

      try {
        const contract = getEscrowContract()
        const milestones = await contract.getServiceMilestones(serviceId)

        return milestones.map((milestone: any) => ({
          serviceId: Number(milestone.serviceId),
          milestoneIndex: Number(milestone.milestoneIndex),
          description: milestone.description,
          amount: ethers.formatEther(milestone.amount),
          completed: milestone.completed,
          approved: milestone.approved,
          completedAt: Number(milestone.completedAt),
        }))
      } catch (error: any) {
        setError(error.message || "Error fetching milestones")
        throw error
      }
    },
    [getEscrowContract, isConnected],
  )

  const completeMilestone = useCallback(
    async (serviceId: number, milestoneIndex: number) => {
      if (!isConnected) throw new Error("Wallet not connected")

      setIsLoading(true)
      setError(null)

      try {
        const contract = getEscrowContract()
        const tx = await contract.completeMilestone(serviceId, milestoneIndex)
        const receipt = await tx.wait()

        return { tx, receipt }
      } catch (error: any) {
        setError(error.message || "Error completing milestone")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [getEscrowContract, isConnected],
  )

  const approveMilestone = useCallback(
    async (serviceId: number, milestoneIndex: number) => {
      if (!isConnected) throw new Error("Wallet not connected")

      setIsLoading(true)
      setError(null)

      try {
        const contract = getEscrowContract()
        const tx = await contract.approveMilestone(serviceId, milestoneIndex)
        const receipt = await tx.wait()

        return { tx, receipt }
      } catch (error: any) {
        setError(error.message || "Error approving milestone")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [getEscrowContract, isConnected],
  )

  const getUserServices = useCallback(
    async (userAddress?: string) => {
      if (!isConnected) throw new Error("Wallet not connected")

      const address = userAddress || account
      if (!address) throw new Error("No address provided")

      try {
        const contract = getEscrowContract()

        const [clientServiceIds, contractorServiceIds] = await Promise.all([
          contract.getClientServices(address),
          contract.getContractorServices(address),
        ])

        // Fetch full service details
        const clientServices = await Promise.all(clientServiceIds.map((id: bigint) => getService(Number(id))))

        const contractorServices = await Promise.all(contractorServiceIds.map((id: bigint) => getService(Number(id))))

        return {
          asClient: clientServices,
          asContractor: contractorServices,
        }
      } catch (error: any) {
        setError(error.message || "Error fetching user services")
        throw error
      }
    },
    [getEscrowContract, isConnected, account, getService],
  )

  const raiseDispute = useCallback(
    async (serviceId: number) => {
      if (!isConnected) throw new Error("Wallet not connected")

      setIsLoading(true)
      setError(null)

      try {
        const contract = getEscrowContract()
        const tx = await contract.raiseDispute(serviceId)
        const receipt = await tx.wait()

        return { tx, receipt }
      } catch (error: any) {
        setError(error.message || "Error raising dispute")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [getEscrowContract, isConnected],
  )

  return {
    createService,
    getService,
    getServiceMilestones,
    completeMilestone,
    approveMilestone,
    getUserServices,
    raiseDispute,
    isLoading,
    error,
  }
}
