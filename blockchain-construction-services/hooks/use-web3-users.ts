"use client"

import { useState, useCallback, useEffect } from 'react'
import { useUserRegistrySimple as useUserRegistry } from './use-user-registry-simple'
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

// Simulate a database of registered Web3 users
const mockWeb3Users: Web3User[] = [
  {
    username: "CarlosMendoza",
    walletAddress: "0x742d35Cc6635Bb327234567890123456789ab987",
    isConnected: false,
    profile: {
      name: "Carlos Mendoza",
      email: "carlos@email.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 3600000, // 1 hour ago
    registered: Date.now() - 86400000 // 1 day ago
  },
  {
    username: "AnaRodriguez", 
    walletAddress: "0x856f123456789012345678901234567890abcdef",
    isConnected: false,
    profile: {
      name: "Ana Rodriguez",
      email: "ana@email.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c898b586?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 7200000, // 2 hours ago
    registered: Date.now() - 172800000 // 2 days ago
  },
  {
    username: "MiguelTorres",
    walletAddress: "0x123abc456def789012345678901234567890cdef", 
    isConnected: true, // Conectado actualmente
    profile: {
      name: "Miguel Torres",
      email: "miguel@email.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 300000, // 5 minutes ago
    registered: Date.now() - 259200000 // 3 days ago
  },
  {
    username: "LauraFernandez",
    walletAddress: "0xabcdef123456789012345678901234567890abcd",
    isConnected: false,
    profile: {
      name: "Laura Fernandez", 
      email: "laura@email.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 14400000, // 4 hours ago
    registered: Date.now() - 345600000 // 4 days ago
  },
  {
    username: "RobertoSilva",
    walletAddress: "0x567890123456789012345678901234567890bcde",
    isConnected: true, // Conectado actualmente
    profile: {
      name: "Roberto Silva",
      email: "roberto@email.com", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 180000, // 3 minutes ago
    registered: Date.now() - 432000000 // 5 days ago
  },
  {
    username: "ManuelHerrera",
    walletAddress: "0x678901234567890123456789012345678901cdef",
    isConnected: false,
    profile: {
      name: "Manuel Herrera",
      email: "manuel@email.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 21600000, // 6 hours ago
    registered: Date.now() - 518400000 // 6 days ago
  },
  // Nuevos usuarios de Latinoamérica
  {
    username: "SofiaReyes",
    walletAddress: "0x789012345678901234567890123456789012def0",
    isConnected: true,
    profile: {
      name: "Sofía Reyes",
      email: "sofia@email.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 120000, // 2 minutos atrás
    registered: Date.now() - 604800000 // 1 semana atrás
  },
  {
    username: "DiegoMorales",
    walletAddress: "0x890123456789012345678901234567890123def1",
    isConnected: false,
    profile: {
      name: "Diego Morales",
      email: "diego@email.com",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 3600000, // 1 hora atrás
    registered: Date.now() - 691200000 // 8 días atrás
  },
  {
    username: "ValentinaLopez",
    walletAddress: "0x901234567890123456789012345678901234def2", 
    isConnected: true,
    profile: {
      name: "Valentina López",
      email: "valentina@email.com",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 60000, // 1 minuto atrás
    registered: Date.now() - 777600000 // 9 días atrás
  },
  {
    username: "FelipeVargas",
    walletAddress: "0x012345678901234567890123456789012345def3",
    isConnected: false,
    profile: {
      name: "Felipe Vargas",
      email: "felipe@email.com", 
      avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face"
    },
    lastSeen: Date.now() - 7200000, // 2 horas atrás
    registered: Date.now() - 864000000 // 10 días atrás
  }
]

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
  const [users, setUsers] = useState<Web3User[]>(mockWeb3Users)

  // Simular actualización de estados de conexión
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prevUsers => 
        prevUsers.map(user => ({
          ...user,
          // Simular cambios de conexión aleatorios
          isConnected: Math.random() > 0.7 ? !user.isConnected : user.isConnected,
          lastSeen: user.isConnected ? Date.now() : user.lastSeen
        }))
      )
    }, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  const findUserByUsername = useCallback(async (username: string): Promise<Web3User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))

      const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase()
      )

      return user || null
    } catch (err: any) {
      setError(err.message || 'Error buscando usuario')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [users])

  const findUserByWallet = useCallback(async (walletAddress: string): Promise<Web3User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))

      const user = users.find(u => 
        u.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      )

      return user || null
    } catch (err: any) {
      setError(err.message || 'Error buscando usuario por wallet')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [users])

  const getConnectedUsers = useCallback(async (): Promise<Web3User[]> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 400))

      return users.filter(user => user.isConnected)
    } catch (err: any) {
      setError(err.message || 'Error obteniendo usuarios conectados')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [users])

  const getAllUsers = useCallback(async (): Promise<Web3User[]> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 200))

      return [...users].sort((a, b) => {
        // Priorizar usuarios conectados
        if (a.isConnected && !b.isConnected) return -1
        if (!a.isConnected && b.isConnected) return 1
        // Luego por última actividad
        return b.lastSeen - a.lastSeen
      })
    } catch (err: any) {
      setError(err.message || 'Error obteniendo todos los usuarios')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [users])

  const registerUser = useCallback(async (userData: Omit<Web3User, 'registered' | 'lastSeen'>): Promise<Web3User> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))

      const newUser: Web3User = {
        ...userData,
        registered: Date.now(),
        lastSeen: Date.now()
      }

      setUsers(prevUsers => [...prevUsers, newUser])
      return newUser
    } catch (err: any) {
      setError(err.message || 'Error registrando usuario')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUserConnection = useCallback(async (walletAddress: string, isConnected: boolean): Promise<void> => {
    try {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
            ? { 
                ...user, 
                isConnected,
                lastSeen: isConnected ? Date.now() : user.lastSeen
              }
            : user
        )
      )
    } catch (err: any) {
      setError(err.message || 'Error actualizando estado de conexión')
    }
  }, [])

  return {
    findUserByUsername,
    findUserByWallet,
    getConnectedUsers,
    getAllUsers,
    registerUser,
    updateUserConnection,
    isLoading,
    error
  }
}
