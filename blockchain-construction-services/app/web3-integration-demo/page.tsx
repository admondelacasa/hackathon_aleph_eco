"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Wifi, 
  WifiOff, 
  Wallet, 
  User,
  RefreshCw,
  ExternalLink
} from "lucide-react"
import { useWeb3Users, Web3User } from "@/hooks/use-web3-users"
import { ConnectedUsersDisplay } from "@/components/connected-users-display"
import { ServiceCreationForm } from "@/components/service-creation-form"

export default function Web3IntegrationDemo() {
  const { 
    findUserByUsername, 
    getConnectedUsers,
    getAllUsers,
    isLoading,
    error
  } = useWeb3Users()

  const [searchUsername, setSearchUsername] = useState("")
  const [searchResult, setSearchResult] = useState<Web3User | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [connectedUsersCount, setConnectedUsersCount] = useState(0)
  const [totalUsersCount, setTotalUsersCount] = useState(0)
  const [showServiceForm, setShowServiceForm] = useState(false)

  useEffect(() => {
    loadUserStats()
  }, [])

  const loadUserStats = async () => {
    try {
      const [connected, all] = await Promise.all([
        getConnectedUsers(),
        getAllUsers()
      ])
      setConnectedUsersCount(connected.length)
      setTotalUsersCount(all.length)
    } catch (err) {
      console.error('Error loading user stats:', err)
    }
  }

  const handleSearch = async () => {
    if (!searchUsername.trim()) return
    
    setSearchLoading(true)
    setSearchResult(null)
    
    try {
      const user = await findUserByUsername(searchUsername)
      setSearchResult(user)
    } catch (err) {
      console.error('Error searching user:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleServiceSubmit = (serviceData: any) => {
    console.log('Nuevo servicio creado:', serviceData)
    alert(`¡Servicio creado exitosamente!\n\nPrestador: ${serviceData.contractorUsername}\nWallet: ${serviceData.contractorWallet || 'No verificada'}\nTítulo: ${serviceData.title}`)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          🚀 Demo Web3 Integration - BuildTrust
        </h1>
        <p className="text-gray-600 text-lg">
          Sistema completo de validación de usuarios Web3 con wallets de MetaMask
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{connectedUsersCount}</p>
                <p className="text-sm text-gray-600">Usuarios Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalUsersCount}</p>
                <p className="text-sm text-gray-600">Total Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">Web3</p>
                <p className="text-sm text-gray-600">Sistema Activo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Search Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Búsqueda de Usuario Web3</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Escribe un nombre de usuario (ej: CarlosMendoza)"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>🎯 Usuarios de prueba disponibles:</p>
              <div className="flex flex-wrap gap-1">
                {["CarlosMendoza", "AnaRodriguez", "MiguelTorres", "LauraFernandez", "RobertoSilva", "SofiaReyes", "ValentinaLopez"].map(name => (
                  <Button 
                    key={name} 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs px-2"
                    onClick={() => setSearchUsername(name)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            {searchResult && (
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-green-800">
                        {searchResult.profile?.name || searchResult.username}
                      </h3>
                      <Badge variant={searchResult.isConnected ? "default" : "secondary"}>
                        {searchResult.isConnected ? (
                          <><Wifi className="h-3 w-3 mr-1" /> Online</>
                        ) : (
                          <><WifiOff className="h-3 w-3 mr-1" /> Offline</>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>👤 @{searchResult.username}</p>
                      <p>💼 {searchResult.walletAddress.slice(0, 8)}...{searchResult.walletAddress.slice(-6)}</p>
                      <p>⏰ Visto hace {Math.round((Date.now() - searchResult.lastSeen) / 60000)} min</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {searchUsername && !searchResult && !searchLoading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Usuario "{searchUsername}" no encontrado en el sistema Web3
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 border-t">
              <ConnectedUsersDisplay />
            </div>
          </CardContent>
        </Card>

        {/* Features Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Características Web3</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Validación de Wallets</p>
                  <p className="text-sm text-gray-600">Verifica direcciones MetaMask en tiempo real</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Wifi className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Estado de Conexión</p>
                  <p className="text-sm text-gray-600">Monitorea usuarios online/offline</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Base de Datos Web3</p>
                  <p className="text-sm text-gray-600">Sistema de usuarios descentralizado</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Actualización Automática</p>
                  <p className="text-sm text-gray-600">Estados sincronizados automáticamente</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold">🧪 Prueba el Sistema:</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  onClick={loadUserStats}
                  className="justify-start"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar Estadísticas
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowServiceForm(true)}
                  className="justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Crear Contrato (Demo completo)
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error Web3: {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Creation Form Demo */}
      {showServiceForm && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🔧 Demo: Crear Contrato con Validación Web3</span>
                <Button variant="outline" onClick={() => setShowServiceForm(false)}>
                  Cerrar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Prueba el sistema completo:</strong> Escribe un nombre de usuario (ej: CarlosMendoza, RobertoSilva) 
                  y observa cómo el sistema valida si existe en Web3 y muestra su estado de conexión y wallet.
                </AlertDescription>
              </Alert>
              
              <ServiceCreationForm
                onSubmit={handleServiceSubmit}
                onCancel={() => setShowServiceForm(false)}
                userRole="client"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
