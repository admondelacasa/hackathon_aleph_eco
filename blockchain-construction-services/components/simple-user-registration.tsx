"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2,
  UserPlus
} from 'lucide-react'
import { useUserRegistrySimple } from '@/hooks/use-user-registry-simple'
import { useBlockchain } from '@/hooks/use-blockchain'

export default function SimpleUserRegistration() {
  // Blockchain connection
  const { account, isLoading: walletLoading, connectWallet } = useBlockchain()
  
  // User registry
  const { 
    isLoading, 
    error, 
    registerUser, 
    getUserProfile,
    isCurrentUserRegistered,
    registeredUsers
  } = useUserRegistrySimple()

  const [registrationForm, setRegistrationForm] = useState({
    username: '',
    publicKey: '',
    profileData: ''
  })
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Check if user is already registered when account changes
  useEffect(() => {
    if (account) {
      checkUserRegistration()
    }
  }, [account])

  const checkUserRegistration = async () => {
    if (!account) return
    try {
      const registered = await isCurrentUserRegistered()
      if (registered) {
        const profile = await getUserProfile(account)
        console.log('User is already registered:', profile)
      }
    } catch (error) {
      console.error('Error checking registration:', error)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account) return

    setIsRegistering(true)
    setRegistrationSuccess(false)

    try {
      const profileData = {
        username: registrationForm.username,
        registeredAt: new Date().toISOString(),
        ...(registrationForm.profileData ? JSON.parse(registrationForm.profileData) : {})
      }

      const success = await registerUser(registrationForm.username, profileData)
      if (success) {
        setRegistrationSuccess(true)
        setRegistrationForm({ username: '', publicKey: '', profileData: '' })
      }
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Shield className="h-6 w-6" />
            Sistema de Registro Web3 Simplificado
          </CardTitle>
          <p className="text-muted-foreground">
            Conecta tu wallet y regístrate en la blockchain
          </p>
        </CardHeader>
      </Card>

      {/* Wallet Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Estado de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!account ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Conecta tu wallet para comenzar
              </p>
              <Button onClick={connectWallet} disabled={walletLoading || isLoading}>
                {walletLoading || isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Conectar MetaMask
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Wallet conectada:</span>
                <Badge variant="outline" className="font-mono">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Form */}
      {account && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Registro de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registrationSuccess && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ¡Usuario registrado exitosamente en la blockchain!
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu nombre de usuario"
                  value={registrationForm.username}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="publicKey">Clave Pública (Opcional)</Label>
                <Input
                  id="publicKey"
                  type="text"
                  placeholder="Se generará automáticamente si se deja vacío"
                  value={registrationForm.publicKey}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, publicKey: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="profileData">Datos de Perfil (JSON, Opcional)</Label>
                <Input
                  id="profileData"
                  type="text"
                  placeholder='{"nombre": "Tu Nombre", "email": "tu@email.com"}'
                  value={registrationForm.profileData}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, profileData: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isRegistering || !registrationForm.username.trim()}>
                {isRegistering ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando en Blockchain...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrar Usuario
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      {registeredUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Usuarios Registrados ({registeredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {registeredUsers.map((user: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{user.username}</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {user.address.slice(0, 10)}...{user.address.slice(-8)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  </div>
                  
                  {user.profileData && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(JSON.parse(user.profileData), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Error: {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
