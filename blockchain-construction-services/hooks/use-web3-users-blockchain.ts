"use client"

import { useState, useCallback } from 'react'
import { useUserRegistrySimple, RegisteredUser } from './use-user-registry-simple'
import { useBlockchain } from './use-blockchain'

export interface Web3User {
  username: string
  walletAddress: string
  isConnected: boolean
  profile?: {
    name: string
    email?: string
    avatar?: string
  }
  lastSeen: number
  registered: number
}

export interface UseWeb3UsersReturn {
  findUserByUsername: (username: string) => Promise<Web3User | null>
  findUserByWallet: (walletAddress: string) => Promise<Web3User | null>
  getConnectedUsers: () => Promise<Web3User[]>
  getAllUsers: () => Promise<Web3User[]>
  registerUser: (userData: Omit<Web3User, 'registered' | 'lastSeen'>) => Promise<Web3User>
  updateUserConnection: (walletAddress: string, isConnected: boolean) => Promise<void>
  isLoading: boolean
  error: string | null
}

export const useWeb3Users = (): UseWeb3UsersReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use the simplified UserRegistry hook
  const { 
    getUserProfileByUsername,
    registerUser: registerUserOnChain,
    isLoading: registryLoading 
  } = useUserRegistrySimple()
  
  const { isConnected, account } = useBlockchain()

  // Convert UserRegistry profile to Web3User format
  const convertToWeb3User = useCallback((profile: RegisteredUser, username: string): Web3User => {
    return {
      username,
      walletAddress: profile.address,
      isConnected: profile.address?.toLowerCase() === account?.toLowerCase(),
      profile: {
        name: profile.username,
        email: profile.profileData?.email || '',
        avatar: profile.profileData?.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`
      },
      lastSeen: profile.address?.toLowerCase() === account?.toLowerCase() ? Date.now() : Date.now() - Math.floor(Math.random() * 86400000),
      registered: profile.registeredAt || Date.now() - Math.floor(Math.random() * 604800000) // Use actual registration time or random within last week
    }
  }, [account])

  const findUserByUsername = useCallback(async (username: string): Promise<Web3User | null> => {
    if (!username) return null
    
    setIsLoading(true)
    setError(null)

    try {
      // Get user profile from UserRegistry
      const profile = await getUserProfileByUsername(username)
      if (!profile || !profile.isRegistered) {
        return null
      }

      return convertToWeb3User(profile, username)
    } catch (err: any) {
      console.error('Error finding user by username:', err)
      setError(err.message || 'Error finding user')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getUserProfileByUsername, convertToWeb3User])

  const findUserByWallet = useCallback(async (walletAddress: string): Promise<Web3User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // This would require a contract method to find user by wallet
      // For now, we'll return null as this requires additional contract functionality
      console.warn('findUserByWallet not yet implemented with UserRegistry')
      return null
    } catch (err: any) {
      setError(err.message || 'Error finding user by wallet')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getConnectedUsers = useCallback(async (): Promise<Web3User[]> => {
    // This would require getting all registered users and checking their connection status
    // For now, return empty array as this requires additional contract functionality
    return []
  }, [])

  const getAllUsers = useCallback(async (): Promise<Web3User[]> => {
    // This would require getting all registered users from the contract
    // For now, return empty array as this requires additional contract functionality
    return []
  }, [])

  const registerUser = useCallback(async (userData: Omit<Web3User, 'registered' | 'lastSeen'>): Promise<Web3User> => {
    setIsLoading(true)
    setError(null)

    try {
      // Register user on blockchain using UserRegistry
      await registerUserOnChain(userData.username)
      
      const newUser: Web3User = {
        ...userData,
        registered: Date.now(),
        lastSeen: Date.now()
      }

      return newUser
    } catch (err: any) {
      setError(err.message || 'Error registering user')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [registerUserOnChain])

  const updateUserConnection = useCallback(async (walletAddress: string, isConnected: boolean): Promise<void> => {
    try {
      // In a real implementation, this might update some connection status on the blockchain
      console.log(`User connection updated: ${walletAddress} - ${isConnected}`)
    } catch (err: any) {
      setError(err.message || 'Error updating connection status')
    }
  }, [])

  return {
    findUserByUsername,
    findUserByWallet,
    getConnectedUsers,
    getAllUsers,
    registerUser,
    updateUserConnection,
    isLoading: isLoading || registryLoading,
    error
  }
}
