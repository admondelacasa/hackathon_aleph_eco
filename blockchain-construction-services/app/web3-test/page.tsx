"use client"

import { WalletConnector } from '@/components/wallet-connector'
import { useWeb3 } from '@/hooks/use-web3'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Wallet, Globe, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Web3TestPage() {
  const { isConnected, account } = useWeb3()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Integración Web3 - BuildTrust
          </h1>
          <p className="text-xl text-gray-600">
            Conecta tu billetera de Ethereum para acceder a funciones blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connector */}
          <div>
            <WalletConnector />
          </div>

          {/* Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Características Web3
                </CardTitle>
                <CardDescription>
                  Lo que puedes hacer con tu billetera conectada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <h4 className="font-medium">Crear Contratos Inteligentes</h4>
                    <p className="text-sm text-muted-foreground">
                      Crear acuerdos de construcción seguros con liberación escalonada de fondos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <h4 className="font-medium">Pagos Seguros</h4>
                    <p className="text-sm text-muted-foreground">
                      Realizar y recibir pagos en ETH con garantía de escrow
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div>
                    <h4 className="font-medium">Reputación On-Chain</h4>
                    <p className="text-sm text-muted-foreground">
                      Calificaciones y reseñas almacenadas permanentemente en blockchain
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  <div>
                    <h4 className="font-medium">Staking de Tokens</h4>
                    <p className="text-sm text-muted-foreground">
                      Gana recompensas por participar activamente en la plataforma
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-500" />
                    Estado de Conexión
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Billetera:</span>
                      <Badge variant="default">Conectada</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cuenta:</span>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Estado:</span>
                      <Badge variant="outline" className="text-green-600">
                        Lista para usar
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <Link href="/">
                      <Button className="w-full">
                        <Wallet className="h-4 w-4 mr-2" />
                        Ir a la Plataforma
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Contratos Inteligentes</CardTitle>
                <CardDescription>
                  Direcciones de los contratos deployados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <strong>Nota:</strong> Los contratos aún no están deployados. 
                    Después del deployment, las direcciones aparecerán aquí.
                  </p>
                  <div className="bg-muted p-3 rounded">
                    <p><strong>ConstructionEscrow:</strong> Pendiente de deployment</p>
                    <p><strong>ServiceFeedback:</strong> Pendiente de deployment</p>
                    <p><strong>StakingRewards:</strong> Pendiente de deployment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
