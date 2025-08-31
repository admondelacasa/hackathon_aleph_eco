"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Wifi, WifiOff, User, Wallet, Clock, RefreshCw, Copy, Check, Shield } from "lucide-react"
import { useWeb3Users, Web3User } from "@/hooks/use-web3-users-blockchain"
import { useUserRegistry, type RegisteredUser } from "@/hooks/use-user-registry"
import { useToast } from "@/hooks/use-toast"

interface ConnectedUsersDisplayProps {
  onUserSelect?: (user: RegisteredUser) => void
  showSelectButton?: boolean
}

export function ConnectedUsersDisplay({ onUserSelect, showSelectButton = false }: ConnectedUsersDisplayProps) {
  const { 
    getAllUsers,
    getConnectedUsers,
    isLoading: usersLoading,
    error: usersError
  } = useWeb3Users()
  
  const { 
    getAllRegisteredUsers,
    isLoading: registryLoading,
    error: registryError 
  } = useUserRegistry()
  
  const { toast } = useToast()
  
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [connectedUsers, setConnectedUsers] = useState<Web3User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  // Load registered users from blockchain
  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const registeredUsers = await getAllRegisteredUsers()
      setUsers(registeredUsers)
      
      const connected = await getConnectedUsers()
      setConnectedUsers(connected)
    } catch (err: any) {
      const errorMessage = err.message || 'Error loading users'
      setError(errorMessage)
      console.error('Error loading users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(null), 2000)
      
      toast({
        title: "Address copied",
        description: "Wallet address has been copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error al copiar",
        description: "Could not copy address",
        variant: "destructive"
      })
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - (timestamp * 1000)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
    return 'Ahora'
  }

  const UserCard = ({ user }: { user: RegisteredUser }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`} />
            <AvatarFallback>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-sm truncate">{user.username}</p>
              <Badge variant={user.isRegistered ? "default" : "secondary"} className="text-xs">
                {user.isRegistered ? "Registrado" : "No registrado"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1 mt-1">
              <Wallet className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 font-mono">
                {user.address.slice(0, 8)}...{user.address.slice(-6)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-1"
                onClick={() => copyToClipboard(user.address)}
              >
                {copiedAddress === user.address ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                Registrado {formatTimeAgo(user.registeredAt)}
              </span>
            </div>
          </div>
          
          {showSelectButton && onUserSelect && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUserSelect(user)}
              className="shrink-0"
            >
              Seleccionar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (error || usersError || registryError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <WifiOff className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-500 mb-4">
              {error || usersError || registryError}
            </p>
            <Button onClick={loadUsers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <CardTitle>Registered Blockchain Users</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {users.length} users
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadUsers}
                disabled={isLoading || usersLoading || registryLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || usersLoading || registryLoading) ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(isLoading || usersLoading || registryLoading) ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-500 animate-pulse" />
              </div>
              <p className="text-gray-500">Loading users from blockchain...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registered users</h3>
              <p className="text-gray-500">
                Be the first to register on the blockchain
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <UserCard key={user.address} user={user} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {users.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-green-500" />
              <CardTitle>Connection Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600 flex items-center">
                  <Wifi className="h-4 w-4 mr-2" />
                  Conectados Ahora ({connectedUsers.length})
                </h4>
                {connectedUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No connected users</p>
                ) : (
                  <div className="space-y-1">
                    {connectedUsers.map((user) => (
                      <div key={user.walletAddress} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{user.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-600 flex items-center">
                  <WifiOff className="h-4 w-4 mr-2" />
                  Desconectados ({users.length - connectedUsers.length})
                </h4>
                {users.length - connectedUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">All users are connected</p>
                ) : (
                  <div className="space-y-1">
                    {users.filter(user => !connectedUsers.some(cu => cu.walletAddress.toLowerCase() === user.address.toLowerCase())).map((user) => (
                      <div key={user.address} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>{user.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
