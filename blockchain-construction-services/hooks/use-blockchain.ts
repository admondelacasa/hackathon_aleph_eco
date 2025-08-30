"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, CONSTRUCTION_ESCROW_ABI, STAKING_REWARDS_ABI, SERVICE_FEEDBACK_ABI } from "@/lib/contracts"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useBlockchain() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [account, setAccount] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState<string>("0")
  const [chainId, setChainId] = useState<number | null>(null)

  // Initialize provider and check connection
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)

        // Check if already connected
        try {
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            const signer = await provider.getSigner()
            setSigner(signer)
            setAccount(accounts[0].address)
            setIsConnected(true)

            // Get balance and chain ID
            const balance = await provider.getBalance(accounts[0].address)
            setBalance(ethers.formatEther(balance))

            const network = await provider.getNetwork()
            setChainId(Number(network.chainId))
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    initProvider()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount("")
          setIsConnected(false)
          setSigner(null)
          setBalance("0")
        } else {
          setAccount(accounts[0])
          // Reinitialize signer
          if (provider) {
            provider.getSigner().then(setSigner)
            provider.getBalance(accounts[0]).then((balance) => {
              setBalance(ethers.formatEther(balance))
            })
          }
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
        window.location.reload() // Reload to reset state
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [provider])

  const connectWallet = useCallback(async () => {
    console.log("[v0] Attempting to connect wallet...")

    if (!window.ethereum) {
      console.log("[v0] MetaMask not detected")
      throw new Error("MetaMask no está instalado. Por favor instala MetaMask desde metamask.io")
    }

    console.log("[v0] MetaMask detected, requesting accounts...")
    setIsLoading(true)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      console.log("[v0] Accounts received:", accounts)

      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()

        setProvider(provider)
        setSigner(signer)
        setAccount(accounts[0])
        setIsConnected(true)

        // Get balance and chain ID
        const balance = await provider.getBalance(accounts[0])
        setBalance(ethers.formatEther(balance))

        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))

        console.log("[v0] Wallet connected successfully:", accounts[0])
      }
    } catch (error: any) {
      console.error("[v0] Error connecting wallet:", error)
      if (error.code === 4001) {
        throw new Error("Conexión rechazada por el usuario")
      } else if (error.code === -32002) {
        throw new Error("Ya hay una solicitud de conexión pendiente. Revisa MetaMask.")
      } else {
        throw new Error(`Error al conectar: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setProvider(null)
    setSigner(null)
    setAccount("")
    setIsConnected(false)
    setBalance("0")
    setChainId(null)
  }, [])

  // Contract instances
  const getEscrowContract = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected")
    return new ethers.Contract(CONTRACT_ADDRESSES.CONSTRUCTION_ESCROW, CONSTRUCTION_ESCROW_ABI, signer)
  }, [signer])

  const getStakingContract = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected")
    return new ethers.Contract(CONTRACT_ADDRESSES.STAKING_REWARDS, STAKING_REWARDS_ABI, signer)
  }, [signer])

  const getFeedbackContract = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected")
    return new ethers.Contract(CONTRACT_ADDRESSES.SERVICE_FEEDBACK, SERVICE_FEEDBACK_ABI, signer)
  }, [signer])

  return {
    provider,
    signer,
    account,
    isConnected,
    isLoading,
    balance,
    chainId,
    connectWallet,
    disconnectWallet,
    getEscrowContract,
    getStakingContract,
    getFeedbackContract,
  }
}
