"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  UserPlus, 
  Users, 
  Shield, 
  Key, 
  CheckCircle, 
  XCircle, 
  Search,
  Loader2,
  Lock,
  Wallet
} from "lucide-react"
import { useBlockchain } from '@/hooks/use-blockchain'
import { useUserRegistrySimple, RegisteredUser } from '@/hooks/use-user-registry-simple'
import UserRegistrationManager from '@/components/user-registration-manager'
import { ConnectedUsersDisplay } from '@/components/connected-users-display-blockchain'
import { useToast } from "@/hooks/use-toast"

interface Web3UserValidatorProps {
  onUserValidated?: (user: RegisteredUser) => void
  showEncryption?: boolean
}

export function Web3UserValidator({ onUserValidated, showEncryption = false }: Web3UserValidatorProps) {
  const { account, isConnected, connectWallet } = useBlockchain()
  const { 
    isCurrentUserRegistered,
    getUserProfileByUsername,
    isLoading
  } = useUserRegistrySimple()
  
  const { toast } = useToast()
  
  const [isCurrentUserReg, setIsCurrentUserReg] = useState(false)
  const [searchUsername, setSearchUsername] = useState('')
  const [validationResult, setValidationResult] = useState<{
    user: RegisteredUser | null
    isValid: boolean
    message: string
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [encryptedMessage, setEncryptedMessage] = useState('')
  const [isEncrypting, setIsEncrypting] = useState(false)

  // Check current user registration status
  useEffect(() => {
    const checkCurrentUser = async () => {
      if (isConnected && account) {
        try {
          const registered = await isCurrentUserRegistered()
          setIsCurrentUserReg(registered)
        } catch (error) {
          console.error('Error checking current user registration:', error)
        }
      }
    }
    
    checkCurrentUser()
  }, [isConnected, account, isCurrentUserRegistered])

  // Validate user by username
  const validateUser = async () => {
    if (!searchUsername.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre de usuario para validar",
        variant: "destructive"
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)
    
    try {
      // Check if username exists and get user profile
      const user = await getUserProfileByUsername(searchUsername)
      
      if (user) {
        setValidationResult({
          user,
          isValid: true,
          message: `Usuario "${searchUsername}" está registrado y verificado en la blockchain`
        })
        
        if (onUserValidated) {
          onUserValidated(user)
        }
        
        toast({
          title: "Usuario válido",
          description: `${user.profileData.name || user.username} está registrado`,
        })
      } else {
        setValidationResult({
          user: null,
          isValid: false,
          message: `Usuario "${searchUsername}" no está registrado en la blockchain`
        })
        
        toast({
          title: "Usuario no encontrado",
          description: `El usuario "${searchUsername}" no está registrado`,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      setValidationResult({
        user: null,
        isValid: false,
        message: `Error al validar usuario: ${error.message}`
      })
      
      toast({
        title: "Error de validación",
        description: "No se pudo validar el usuario",
        variant: "destructive"
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Encrypt test message
  const encryptTestMessage = async () => {
    if (!testMessage.trim() || !validationResult?.user) return

    setIsEncrypting(true)
    try {
      const result = await encryptMessageByUsername(validationResult.user.username, testMessage)
      setEncryptedMessage(result.encryptedString)
      
      toast({
        title: "Mensaje encriptado",
        description: "El mensaje ha sido encriptado exitosamente",
      })
    } catch (error: any) {
      toast({
        title: "Error de encriptación", 
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsEncrypting(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <CardTitle>Conecta tu Wallet</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Conecta MetaMask para validar usuarios registrados en la blockchain.
          </p>
          <Button onClick={connectWallet} className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Conectar MetaMask
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Current User Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Tu Estado Web3</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Wallet: {account?.slice(0, 10)}...{account?.slice(-8)}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                {isCurrentUserReg ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 text-sm">Registrado en blockchain</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 text-sm">No registrado</span>
                  </>
                )}
              </div>
            </div>
            
            <Badge variant={isCurrentUserReg ? "default" : "destructive"}>
              {isCurrentUserReg ? "Registrado" : "No registrado"}
            </Badge>
          </div>

          {!isCurrentUserReg && (
            <Alert className="mt-4">
              <UserPlus className="h-4 w-4" />
              <AlertDescription>
                Necesitas registrarte para validar otros usuarios y usar encriptación. 
                <a href="/user-registry" target="_blank" className="text-blue-600 hover:underline ml-1">
                  Ir al registro
                </a>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* User Validation */}
      {isCurrentUserReg && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Validar Usuario Web3</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Nombre de usuario a validar (ej: carlos123)"
                onKeyDown={(e) => e.key === 'Enter' && validateUser()}
                disabled={isValidating}
              />
              <Button 
                onClick={validateUser}
                disabled={isValidating || !searchUsername.trim()}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {validationResult && (
              <Alert variant={validationResult.isValid ? "default" : "destructive"}>
                {validationResult.isValid ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {validationResult.message}
                </AlertDescription>
              </Alert>
            )}

            {validationResult?.user && (
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
                  Usuario Verificado ✅
                </h4>
                <div className="text-sm space-y-1 text-green-700 dark:text-green-300">
                  <p><strong>Nombre:</strong> {validationResult.user.profileData.name}</p>
                  <p><strong>Username:</strong> @{validationResult.user.username}</p>
                  <p><strong>Address:</strong> {validationResult.user.address}</p>
                  <p><strong>Registrado:</strong> {new Date(validationResult.user.registeredAt * 1000).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Encryption Test */}
      {showEncryption && isCurrentUserReg && validationResult?.user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Prueba de Encriptación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Envía un mensaje encriptado a {validationResult.user.username} usando su clave pública registrada.
              </AlertDescription>
            </Alert>

            <div>
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Mensaje para encriptar..."
                disabled={isEncrypting}
              />
            </div>

            <Button 
              onClick={encryptTestMessage}
              disabled={isEncrypting || !testMessage.trim()}
              className="w-full"
            >
              {isEncrypting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Encriptando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Encriptar para {validationResult.user.username}
                </>
              )}
            </Button>

            {encryptedMessage && (
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                  Mensaje Encriptado
                </h4>
                <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded font-mono text-xs break-all">
                  {encryptedMessage}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                  Solo {validationResult.user.username} puede desencriptar este mensaje.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="outline"
          onClick={() => window.open('/user-registry', '_blank')}
          className="flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Administrar Registro</span>
        </Button>
        
        <ConnectedUsersDisplay 
          onUserSelect={onUserValidated}
          showSelectButton={!!onUserValidated}
        />
      </div>
    </div>
  )
}
