"use client"

import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { useBlockchain } from "./use-blockchain"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"
import { useToast } from "./use-toast"

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
]

export function useUSDT() {
  const { signer, account } = useBlockchain()
  const { toast } = useToast()
  const [isApproving, setIsApproving] = useState(false)

  const getUSDTContract = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected")
    return new ethers.Contract(CONTRACT_ADDRESSES.USDT, USDT_ABI, signer)
  }, [signer])

  const checkAllowance = useCallback(async (spender: string) => {
    if (!account) throw new Error("Wallet not connected")
    try {
      const contract = getUSDTContract()
      const allowance = await contract.allowance(account, spender)
      const decimals = await contract.decimals()
      return ethers.formatUnits(allowance, decimals)
    } catch (error: any) {
      console.error("Error checking allowance:", error)
      throw new Error("Error al verificar la aprobación de USDT")
    }
  }, [account, getUSDTContract])

  const checkBalance = useCallback(async () => {
    if (!account) throw new Error("Wallet not connected")
    try {
      const contract = getUSDTContract()
      const balance = await contract.balanceOf(account)
      const decimals = await contract.decimals()
      return ethers.formatUnits(balance, decimals)
    } catch (error: any) {
      console.error("Error checking balance:", error)
      throw new Error("Error al verificar el balance de USDT")
    }
  }, [account, getUSDTContract])

  const approveUSDT = useCallback(async (spender: string, amount: string) => {
    try {
      setIsApproving(true)
      const contract = getUSDTContract()
      const decimals = await contract.decimals()
      const parsedAmount = ethers.parseUnits(amount, decimals)
      
      toast({
        title: "Aprobando USDT",
        description: "Por favor, confirma la transacción en tu wallet",
      })

      const tx = await contract.approve(spender, parsedAmount)
      
      toast({
        title: "Esperando confirmación",
        description: "La transacción está siendo procesada",
      })

      await tx.wait()
      
        toast({
        title: "¡Aprobación exitosa!",
        description: "Ya puedes proceder con la creación del contrato",
        variant: "default",
      });
      
      return true
    } catch (error: any) {
      console.error("Error approving USDT:", error)
      toast({
        title: "Error en la aprobación",
        description: error.message || "Error al aprobar USDT",
        variant: "destructive",
      })
      throw new Error(error.message || "Error al aprobar USDT")
    } finally {
      setIsApproving(false)
    }
  }, [getUSDTContract, toast])

  return {
    getUSDTContract,
    checkAllowance,
    checkBalance,
    approveUSDT,
    isApproving,
  }
}
