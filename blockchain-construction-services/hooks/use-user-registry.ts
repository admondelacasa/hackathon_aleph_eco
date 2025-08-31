"use client"

import { useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import EthCrypto from 'eth-crypto'
import { useBlockchain } from '@/hooks/use-blockchain'

export interface RegisteredUser {
  address: string
  publicKey: string
  username: string
  profileData: any
  registeredAt: number
  isRegistered: boolean
}

export interface EncryptionResult {
  encrypted: any
  encryptedString: string
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
const USER_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000"

export function useUserRegistry() {
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
   * Extract public key from MetaMask wallet
   */
  const getPublicKeyFromWallet = useCallback(async (): Promise<string> => {
    try {
      if (!account || !provider) {
        throw new Error('Wallet not connected')
      }

      // Request account access and get public key via personal_sign
      const message = `Get public key for address: ${account}`
      const signature = await provider.send('personal_sign', [
        ethers.hexlify(ethers.toUtf8Bytes(message)),
        account.toLowerCase()
      ])

      // Recover the public key from signature
      const messageHash = ethers.hashMessage(message)
      const publicKey = ethers.SigningKey.recoverPublicKey(messageHash, signature)

      return publicKey

    } catch (error: any) {
      console.error('Error extracting public key:', error)
      throw new Error(`Failed to get public key: ${error.message}`)
    }
  }, [account, provider])

  /**
   * Register user with MetaMask public key
   */
  const registerUser = useCallback(async (username: string, profileData: any = {}): Promise<boolean> => {
    if (!account || !signer) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get public key from wallet
      const publicKey = await getPublicKeyFromWallet()

      // Get contract instance
      const contract = getContract()
      if (!contract) {
        throw new Error('Contract not available')
      }

      // Check if user is already registered
      const isRegistered = await contract.isUserRegistered(account)
      if (isRegistered) {
        throw new Error('User already registered')
      }

      // Prepare profile data
      const profileDataString = JSON.stringify({
        name: profileData.name || username,
        email: profileData.email || '',
        avatar: profileData.avatar || '',
        ...profileData
      })

      // Register user on blockchain
      const tx = await contract.registerUser(publicKey, username, profileDataString)
      await tx.wait()

      console.log('User registered successfully:', {
        address: account,
        username,
        publicKey: publicKey.slice(0, 20) + '...',
        txHash: tx.hash
      })

      return true

    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Registration failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [account, signer, getContract, getPublicKeyFromWallet])

  /**
   * Check if current user is registered
   */
  const isCurrentUserRegistered = useCallback(async (): Promise<boolean> => {
    if (!account) return false

    try {
      const contract = getContract()
      if (!contract) return false

      return await contract.isUserRegistered(account)
    } catch (error) {
      console.error('Error checking registration:', error)
      return false
    }
  }, [account, getContract])

  /**
   * Check if a specific address is registered
   */
  const isAddressRegistered = useCallback(async (address: string): Promise<boolean> => {
    try {
      const contract = getContract()
      if (!contract) return false

      return await contract.isUserRegistered(address)
    } catch (error) {
      console.error('Error checking address registration:', error)
      return false
    }
  }, [getContract])

  /**
   * Check if username is registered
   */
  const isUsernameRegistered = useCallback(async (username: string): Promise<boolean> => {
    try {
      const contract = getContract()
      if (!contract) return false

      const address = await contract.getAddressByUsername(username)
      return address !== ethers.ZeroAddress
    } catch (error) {
      // Username not found
      return false
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

  /**
   * Encrypt message with recipient's public key
   */
  const encryptMessage = useCallback(async (recipientAddress: string, message: string): Promise<EncryptionResult> => {
    try {
      const contract = getContract()
      if (!contract) {
        throw new Error('Contract not available')
      }

      // Get recipient's public key
      const publicKey = await contract.getUserPublicKey(recipientAddress)
      
      // Remove 0x prefix if present and ensure proper format
      let cleanPubKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey
      
      // eth-crypto expects uncompressed public key without 04 prefix
      if (cleanPubKey.startsWith('04')) {
        cleanPubKey = cleanPubKey.slice(2)
      }
      
      if (cleanPubKey.length !== 128) {
        throw new Error('Invalid public key format. Expected 128 hex characters (uncompressed, no prefix).')
      }
      
      // Encrypt the message
      const encrypted = await EthCrypto.encryptWithPublicKey(cleanPubKey, message)
      
      // Convert to string for easy transport
      const encryptedString = EthCrypto.cipher.stringify(encrypted)
      
      return {
        encrypted,
        encryptedString
      }

    } catch (error: any) {
      console.error('Encryption failed:', error)
      throw new Error(`Encryption failed: ${error.message}`)
    }
  }, [getContract])

  /**
   * Encrypt message with recipient's username
   */
  const encryptMessageByUsername = useCallback(async (username: string, message: string): Promise<EncryptionResult> => {
    try {
      const contract = getContract()
      if (!contract) {
        throw new Error('Contract not available')
      }

      // Get recipient's public key by username
      const publicKey = await contract.getUserPublicKeyByUsername(username)
      
      // Remove 0x prefix if present and ensure proper format
      let cleanPubKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey
      
      // eth-crypto expects uncompressed public key without 04 prefix
      if (cleanPubKey.startsWith('04')) {
        cleanPubKey = cleanPubKey.slice(2)
      }
      
      if (cleanPubKey.length !== 128) {
        throw new Error('Invalid public key format. Expected 128 hex characters (uncompressed, no prefix).')
      }
      
      // Encrypt the message
      const encrypted = await EthCrypto.encryptWithPublicKey(cleanPubKey, message)
      
      // Convert to string for easy transport
      const encryptedString = EthCrypto.cipher.stringify(encrypted)
      
      return {
        encrypted,
        encryptedString
      }

    } catch (error: any) {
      console.error('Encryption failed:', error)
      throw new Error(`Encryption failed: ${error.message}`)
    }
  }, [getContract])

  /**
   * Decrypt message with user's private key (requires MetaMask signature)
   */
  const decryptMessage = useCallback(async (encryptedString: string): Promise<string> => {
    try {
      if (!account || !signer) {
        throw new Error('Wallet not connected')
      }

      // Note: This is a simplified approach. In practice, you would need to
      // derive the private key or use a more secure method for decryption
      // For now, we'll show an error as private key access is restricted
      throw new Error('Direct private key access not available. Decryption requires additional setup.')

    } catch (error: any) {
      console.error('Decryption failed:', error)
      throw new Error(`Decryption failed: ${error.message}`)
    }
  }, [account, signer])

  /**
   * Update current user's profile
   */
  const updateProfile = useCallback(async (profileData: any): Promise<boolean> => {
    if (!account || !signer) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      const contract = getContract()
      if (!contract) {
        throw new Error('Contract not available')
      }

      const profileDataString = JSON.stringify(profileData)
      const tx = await contract.updateProfile(profileDataString)
      await tx.wait()

      return true
    } catch (error: any) {
      console.error('Profile update error:', error)
      setError(error.message || 'Profile update failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [account, signer, getContract])

  // Auto-load registered users when hook is used
  useEffect(() => {
    if (provider) {
      getAllRegisteredUsers()
    }
  }, [provider, getAllRegisteredUsers])

  return {
    // State
    isLoading,
    error,
    registeredUsers,
    
    // Registration functions
    registerUser,
    isCurrentUserRegistered,
    isAddressRegistered,
    isUsernameRegistered,
    
    // Profile functions
    getUserProfile,
    getUserProfileByUsername,
    getAllRegisteredUsers,
    updateProfile,
    
    // Encryption functions
    encryptMessage,
    encryptMessageByUsername,
    decryptMessage,
    
    // Utility functions
    getPublicKeyFromWallet
  }
}
