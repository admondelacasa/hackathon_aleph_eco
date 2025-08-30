"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Wifi, WifiOff, User, Wallet, Clock, RefreshCw, Copy, Check } from "lucide-react"
import { useWeb3Users, Web3User } from "@/hooks/use-web3-users"
import { useToast } from "@/hooks/use-toast"

interface ConnectedUsersDisplayProps {
  onUserSelect?: (user: Web3User) => void
  showSelectButton?: boolean
}

export function ConnectedUsersDisplay({ onUserSelect, showSelectButton = false }: ConnectedUsersDisplayProps) {
  const { getConnectedUsers, getAllUsers, isLoading, error } = useWeb3Users()
  const { toast } = useToast()
  
  const [connectedUsers, setConnectedUsers] = useState<Web3User[]>([])
  const [allUsers, setAllUsers] = useState<Web3User[]>([])
  const [showOfflineUsers, setShowOfflineUsers] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const [connected, all] = await Promise.all([
        getConnectedUsers(),
        getAllUsers()
      ])
      setConnectedUsers(connected)
      setAllUsers(all)
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(null), 2000)
      
      toast({
        title: "Dirección copiada",
        description: "La dirección de wallet ha sido copiada al portapapeles",
      })
    } catch (err) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar la dirección",
        variant: "destructive"
      })
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'ahora'
    if (minutes < 60) return `hace ${minutes}m`
    if (hours < 24) return `hace ${hours}h`
    return `hace ${days}d`
  }

  const UserCard = ({ user, isConnected }: { user: Web3User; isConnected: boolean }) => (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      isConnected 
        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
    }`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profile?.avatar} alt={user.profile?.name} />
          <AvatarFallback>
            {user.profile?.name?.charAt(0) || user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.profile?.name || user.username}
              </h4>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isConnected ? "default" : "secondary"}
                className={isConnected 
                  ? "bg-green-100 text-green-700 border-green-300" 
                  : "bg-gray-100 text-gray-600"
                }
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Wallet className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600 font-mono">
                {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => copyToClipboard(user.walletAddress)}
              >
                {copiedAddress === user.walletAddress ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-400" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {isConnected ? `Activo ${formatTimeAgo(user.lastSeen)}` : `Visto ${formatTimeAgo(user.lastSeen)}`}
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
              Seleccionar Usuario
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
            <p>Error cargando usuarios: {error}</p>
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
          <span>Ver Usuarios Web3</span>
          {connectedUsers.length > 0 && (
            <Badge variant="default" className="ml-2">
              {connectedUsers.length} online
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Usuarios Web3 Registrados</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando usuarios...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected Users */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-600 flex items-center space-x-2">
                    <Wifi className="h-5 w-5" />
                    <span>Usuarios Conectados ({connectedUsers.length})</span>
                  </h3>
                  <Button variant="ghost" size="sm" onClick={loadUsers}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                {connectedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {connectedUsers.map((user) => (
                      <UserCard key={user.username} user={user} isConnected={true} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <WifiOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No hay usuarios conectados actualmente</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Offline Users Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-600 flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Usuarios Registrados</span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOfflineUsers(!showOfflineUsers)}
                >
                  {showOfflineUsers ? 'Ocultar' : 'Mostrar'} usuarios offline
                </Button>
              </div>

              {showOfflineUsers && (
                <div className="space-y-3">
                  {allUsers.filter(user => !user.isConnected).map((user) => (
                    <UserCard key={user.username} user={user} isConnected={false} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
