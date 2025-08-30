"use client"

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { connectWallet, getBalance, switchNetwork, NetworkKey } from '@/lib/web3'

interface Web3State {
  account: string | null
  chainId: string | null
  balance: string | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null
}

interface Web3ContextType extends Web3State {
  connect: () => Promise<void>
  disconnect: () => void
  switchToNetwork: (network: NetworkKey) => Promise<void>
  refreshBalance: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<Web3State>({
    account: null,
    chainId: null,
    balance: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  })

  // Función para conectar wallet
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const { account, chainId } = await connectWallet()
      const balance = await getBalance(account)

      setState(prev => ({
        ...prev,
        account,
        chainId,
        balance,
        isConnected: true,
        isConnecting: false,
      }))

      // Guardar en localStorage para persistencia
      if (typeof window !== 'undefined') {
        localStorage.setItem('web3_connected', 'true')
        localStorage.setItem('web3_account', account)
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isConnecting: false,
      }))
    }
  }, [])

  // Función para desconectar wallet
  const disconnect = useCallback(() => {
    setState({
      account: null,
      chainId: null,
      balance: null,
      isConnecting: false,
      isConnected: false,
      error: null,
    })

    if (typeof window !== 'undefined') {
      localStorage.removeItem('web3_connected')
      localStorage.removeItem('web3_account')
    }
  }, [])

  // Función para cambiar red
  const switchToNetwork = useCallback(async (network: NetworkKey) => {
    try {
      await switchNetwork(network)
      // Actualizar estado después del cambio de red
      if (state.account) {
        const balance = await getBalance(state.account)
        setState(prev => ({ ...prev, balance }))
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }))
    }
  }, [state.account])

  // Función para actualizar balance
  const refreshBalance = useCallback(async () => {
    if (state.account) {
      try {
        const balance = await getBalance(state.account)
        setState(prev => ({ ...prev, balance }))
      } catch (error: any) {
        setState(prev => ({ ...prev, error: error.message }))
      }
    }
  }, [state.account])

  // Escuchar cambios en la cuenta y red
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== state.account) {
          setState(prev => ({ ...prev, account: accounts[0] }))
          if (accounts[0]) {
            getBalance(accounts[0]).then(balance => {
              setState(prev => ({ ...prev, balance }))
            })
          }
        }
      }

      const handleChainChanged = (chainId: string) => {
        setState(prev => ({ ...prev, chainId }))
        if (state.account) {
          getBalance(state.account).then(balance => {
            setState(prev => ({ ...prev, balance }))
          })
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [state.account, disconnect])

  // Intentar reconectar automáticamente al cargar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wasConnected = localStorage.getItem('web3_connected')
      if (wasConnected === 'true' && window.ethereum) {
        connect()
      }
    }
  }, [connect])

  const contextValue: Web3ContextType = {
    ...state,
    connect,
    disconnect,
    switchToNetwork,
    refreshBalance,
  }

  return React.createElement(
    Web3Context.Provider,
    { value: contextValue },
    children
  )
}

// Hook adicional para interactuar con contratos
export const useContract = () => {
  const { account, chainId } = useWeb3()
  
  const getContractInstance = useCallback(async (contractAddress: string, abi: any[]) => {
    if (!account) throw new Error('Wallet no conectada')
    
    const { getSigner } = await import('@/lib/web3')
    const signer = await getSigner()
    const { Contract } = await import('ethers')
    
    return new Contract(contractAddress, abi, signer)
  }, [account])

  return { getContractInstance }
}
