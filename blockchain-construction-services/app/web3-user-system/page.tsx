"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  Users, 
  Key, 
  Lock, 
  UserPlus,
  Wallet,
  CheckCircle
} from "lucide-react"
import UserRegistrationManager from '@/components/user-registration-manager'
// import { Web3UserValidator } from '@/components/web3-user-validator'
import { RegisteredUser } from '@/hooks/use-user-registry-simple'

export default function Web3UserSystemPage() {
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null)

  const handleUserSelected = (user: RegisteredUser) => {
    setSelectedUser(user)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sistema Web3 Completo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Registro en blockchain, validación de usuarios y encriptación de extremo a extremo
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Conecta MetaMask, registra tu clave pública y valida otros usuarios
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6 text-center">
              <UserPlus className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                1. Registro Web3
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                Conecta MetaMask y registra tu clave pública en la blockchain
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                2. Validación
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Valida que otros usuarios estén registrados en la blockchain
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="p-6 text-center">
              <Lock className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                3. Encriptación
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Encripta mensajes usando las claves públicas registradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="validator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="validator" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Validador de Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="registration" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Gestión de Registro</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validator" className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Validador de Usuarios:</strong> Busca y valida usuarios registrados en la blockchain. 
                Prueba la encriptación de mensajes con usuarios verificados.
              </AlertDescription>
            </Alert>

            {/* Web3UserValidator */}
            {/* <Web3UserValidator 
              onUserValidated={handleUserSelected}
              showEncryption={true}
            /> */}

            {selectedUser && (
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 dark:text-green-200">
                    Usuario Seleccionado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nombre:</strong> {selectedUser.profileData.name}</p>
                    <p><strong>Username:</strong> @{selectedUser.username}</p>
                    <p><strong>Address:</strong> {selectedUser.address}</p>
                    <p><strong>Estado:</strong> ✅ Verificado en blockchain</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="registration" className="space-y-6">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <strong>Gestión de Registro:</strong> Registra tu usuario o actualiza tu perfil. 
                Tu clave pública se almacena de forma segura en la blockchain.
              </AlertDescription>
            </Alert>

            <UserRegistrationManager />
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>¿Cómo funciona el sistema Web3?</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="font-medium mb-2">🔐 Registro Seguro</h4>
              <p>
                Tu clave pública se extrae de MetaMask y se almacena en un smart contract. 
                Esto permite que otros usuarios te envíen mensajes encriptados.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">✅ Validación Descentralizada</h4>
              <p>
                La validación de usuarios se realiza directamente en la blockchain, 
                sin depender de bases de datos centralizadas.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔒 Encriptación E2E</h4>
              <p>
                Los mensajes se encriptan con la clave pública del destinatario, 
                garantizando que solo él pueda leerlos.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🌐 Interoperabilidad</h4>
              <p>
                El sistema funciona con cualquier wallet compatible con Ethereum 
                y puede integrarse con otras dApps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
