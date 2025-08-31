"use client"

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useBlockchain } from '@/hooks/use-blockchain'

export interface RegisteredUser {
  address: string
  publicKey: string
  username: string
  profileData: any
  registeredAt: number
  isRegistered: boolean
}

// UserRegistry contract ABI (simplified)
const USER_REGISTRY_ABI = [
  "function registerUser(string memory _publicKey, string memory _username, string memory _profileData) external",
  "function updateProfile(string memory _profileData) external", 
  "function updatePublicKey(string memory _publicKey) external",
  "function isUserRegistered(address _userAddress) external view returns (bool)",
  "function getUserProfile(address _userAddress) external view returns (tuple(string publicKey, string username, string profileData, uint256 registeredAt, bool isRegistered))",
  "function getUserProfileByUsername(string memory _username) external view returns (tuple(string publicKey, string username, string profileData, uint256 registeredAt, bool isRegistered))",
  "function getUserPublicKey(address _userAddress) external view returns (string memory)",
  "function getUserPublicKeyByUsername(string memory _username) external view returns (string memory)",
  "function getAddressByUsername(string memory _username) external view returns (address)",
  "function getTotalUsers() external view returns (uint256)",
  "function getAllRegisteredUsers() external view returns (address[] memory)",
  "event UserRegistered(address indexed userAddress, string indexed username, string publicKey, uint256 timestamp)",
  "event UserUpdated(address indexed userAddress, string indexed username, string publicKey, uint256 timestamp)"
]

// Replace with your deployed contract address
const USER_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"

export function useUserRegistrySimple() {
  const { account, provider, signer } = useBlockchain()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])

  // Get contract instance
  const getContract = useCallback(() => {
    if (!provider) return null
    return new ethers.Contract(USER_REGISTRY_ADDRESS, USER_REGISTRY_ABI, signer || provider)
  }, [provider, signer])

  /**
   * Extract public key from MetaMask wallet (simplified version)
   */
  const getPublicKeyFromWallet = useCallback(async (): Promise<string> => {
    try {
      if (!account || !provider) {
        throw new Error('Wallet not connected')
      }

      // For demo purposes, we'll create a deterministic public key from the address
      // In a real implementation, you'd extract the actual public key from MetaMask
      const deterministicKey = ethers.keccak256(ethers.toUtf8Bytes(account + "public_key_seed"))
      return deterministicKey

    } catch (error: any) {
      console.error('Error extracting public key:', error)
      throw new Error(`Failed to get public key: ${error.message}`)
    }
  }, [account, provider])

  /**
   * Register user with simplified public key
   */
  const registerUser = useCallback(async (username: string, profileData: any = {}): Promise<boolean> => {
    if (!account || !signer) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get simplified public key
      const publicKey = await getPublicKeyFromWallet()

      // Get contract instance
      const contract = getContract()
      if (!contract) {
        throw new Error('Contract not available')
      }

      // Register user on blockchain
      const tx = await contract.registerUser(
        publicKey,
        username,
        JSON.stringify(profileData)
      )
      
      await tx.wait()
      console.log('User registered successfully:', tx.hash)

      // Refresh user list
      await getAllRegisteredUsers()
      
      return true
    } catch (error: any) {
      console.error('Error registering user:', error)
      setError(error.message || 'Error registering user')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [account, signer, getContract, getPublicKeyFromWallet])

  /**
   * Check if current user is registered
   */
  const isCurrentUserRegistered = useCallback(async (): Promise<boolean> => {
    if (!account || !provider) return false

    try {
      const contract = getContract()
      if (!contract) return false

      return await contract.isUserRegistered(account)
    } catch (error) {
      console.error('Error checking registration:', error)
      return false
    }
  }, [account, provider, getContract])

  /**
   * Check if username is already registered
   */
  const isUsernameRegistered = useCallback(async (username: string): Promise<boolean> => {
    try {
      const contract = getContract()
      if (!contract) return false

      const profile = await contract.getUserProfileByUsername(username)
      return profile.isRegistered
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    }
  }, [getContract])

  /**
   * Get user profile by username
   */
  const getUserProfileByUsername = useCallback(async (username: string): Promise<RegisteredUser | null> => {
    try {
      const contract = getContract()
      if (!contract) return null

      const profile = await contract.getUserProfileByUsername(username)
      const address = await contract.getAddressByUsername(username)
      
      return {
        address,
        publicKey: profile.publicKey,
        username: profile.username,
        profileData: JSON.parse(profile.profileData || '{}'),
        registeredAt: Number(profile.registeredAt),
        isRegistered: profile.isRegistered
      }
    } catch (error) {
      console.error('Error getting user profile by username:', error)
      return null
    }
  }, [getContract])

  /**
   * Get user profile by address
   */
  const getUserProfile = useCallback(async (address: string): Promise<RegisteredUser | null> => {
    try {
      const contract = getContract()
      if (!contract) return null

      const profile = await contract.getUserProfile(address)
      
      return {
        address,
        publicKey: profile.publicKey,
        username: profile.username,
        profileData: JSON.parse(profile.profileData || '{}'),
        registeredAt: Number(profile.registeredAt),
        isRegistered: profile.isRegistered
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }, [getContract])

  /**
   * Get all registered users
   */
  const getAllRegisteredUsers = useCallback(async (): Promise<RegisteredUser[]> => {
    try {
      const contract = getContract()
      if (!contract) return []

      const addresses = await contract.getAllRegisteredUsers()
      const users: RegisteredUser[] = []

      for (const address of addresses) {
        const profile = await getUserProfile(address)
        if (profile) {
          users.push(profile)
        }
      }

      setRegisteredUsers(users)
      return users
    } catch (error) {
      console.error('Error getting all users:', error)
      return []
    }
  }, [getContract, getUserProfile])

  return {
    // State
    isLoading,
    error,
    registeredUsers,
    
    // Registration functions
    registerUser,
    isCurrentUserRegistered,
    isUsernameRegistered,
    
    // Profile functions
    getUserProfile,
    getUserProfileByUsername,
    getAllRegisteredUsers,
    
    // Utility functions
    getPublicKeyFromWallet
  }
}
