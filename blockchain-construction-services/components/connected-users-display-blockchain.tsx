"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Wifi, WifiOff, User, Wallet, Clock, RefreshCw, Copy, Check, Shield, Key } from "lucide-react"
import { useWeb3Users, Web3User } from "@/hooks/use-web3-users-blockchain"
import { useUserRegistrySimple, type RegisteredUser } from "@/hooks/use-user-registry-simple"
import { useToast } from "@/hooks/use-toast"

interface ConnectedUsersDisplayProps {
  onUserSelect?: (user: RegisteredUser) => void
  showSelectButton?: boolean
}

export function ConnectedUsersDisplay({ onUserSelect, showSelectButton = false }: ConnectedUsersDisplayProps) {
  const { 
    getAllRegisteredUsers, 
    isLoading, 
    error,
    registeredUsers 
  } = useUserRegistrySimple()
  const { toast } = useToast()
  
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const allUsers = await getAllRegisteredUsers()
      setUsers(allUsers)
    } catch (err) {
      console.error('Error loading users:', err)
      toast({
        title: "Error loading users",
        description: "Could not load registered users",
        variant: "destructive"
      })
    }
  }

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

    if (minutes < 1) return 'ahora'
    if (minutes < 60) return `hace ${minutes}m`
    if (hours < 24) return `hace ${hours}h`
    return `hace ${days}d`
  }

  const UserCard = ({ user }: { user: RegisteredUser }) => (
    <div className="p-4 rounded-lg border transition-all duration-200 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profileData.avatar} alt={user.profileData.name} />
          <AvatarFallback>
            {user.profileData.name?.charAt(0) || user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.profileData.name || user.username}
              </h4>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <Shield className="h-3 w-3 mr-1" />
                Registrado
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Wallet className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600 font-mono">
                {user.address.slice(0, 8)}...{user.address.slice(-6)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => copyToClipboard(user.address)}
              >
                {copiedAddress === user.address ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-400" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                Registrado {formatTimeAgo(user.registeredAt)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Key className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                Registered public key
              </span>
            </div>
          </div>

          {showSelectButton && onUserSelect && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => onUserSelect(user)}
            >
              Select User
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading users: {error}</p>
            <Button variant="outline" onClick={loadUsers} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>View Registered Web3 Users</span>
          {users.length > 0 && (
            <Badge variant="default" className="ml-2">
              {users.length} registrados
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Web3 Users Registered on Blockchain</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading users from blockchain...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Registered Users */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-600 flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Registered Users ({users.length})</span>
                  </h3>
                  <Button variant="ghost" size="sm" onClick={loadUsers}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                {users.length > 0 ? (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <UserCard key={user.address} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No users registered on the blockchain yet</p>
                    <p className="text-xs mt-2">Users need to register with MetaMask</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Info section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  What is Web3 registration?
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Registered users have stored their public key on the blockchain, 
                  which enables end-to-end encrypted communication and identity verification.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
