"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { useWeb3 } from '@/hooks/use-web3'
import { NETWORKS, NetworkKey } from '@/lib/web3'

export function WalletConnector() {
  const { 
    account, 
    chainId, 
    balance, 
    isConnecting, 
    isConnected, 
    error, 
    connect, 
    disconnect, 
    switchToNetwork 
  } = useWeb3()

  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getCurrentNetwork = () => {
    if (!chainId) return null
    
    // Convertir chainId a nombre de red
    switch (chainId) {
      case '0x1':
        return { name: 'Ethereum Mainnet', key: 'ethereum' as NetworkKey }
      case '0xaa36a7':
        return { name: 'Sepolia Testnet', key: 'sepolia' as NetworkKey }
      default:
        return { name: `Red desconocida (${chainId})`, key: null }
    }
  }

  const currentNetwork = getCurrentNetwork()

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6" />
            Conectar Billetera
          </CardTitle>
          <CardDescription>
            Conecta tu billetera de Ethereum para usar BuildTrust
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={connect} 
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Conectando...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Conectar MetaMask
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            <p>¿No tienes MetaMask?</p>
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-1"
            >
              Descargar MetaMask
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Billetera Conectada
          </span>
          <Button variant="outline" size="sm" onClick={disconnect}>
            Desconectar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cuenta</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
              {formatAddress(account!)}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(account!)}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Balance de ETH */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Balance</label>
          <div className="px-3 py-2 bg-muted rounded">
            <span className="font-mono">
              {balance ? `${parseFloat(balance).toFixed(6)} ETH` : '0.000000 ETH'}
            </span>
          </div>
        </div>

        {/* Red actual */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Red</label>
          <div className="flex items-center gap-2">
            <Badge variant={currentNetwork?.key === 'ethereum' ? 'default' : 'secondary'}>
              {currentNetwork?.name || 'Red desconocida'}
            </Badge>
            
            {currentNetwork?.key !== 'ethereum' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => switchToNetwork('ethereum')}
              >
                Cambiar a Ethereum
              </Button>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Chain ID:</span>
              <br />
              <span className="font-mono">{chainId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <br />
              <Badge variant="outline" className="text-green-600">
                Conectado
              </Badge>
            </div>
          </div>
        </div>

        {/* Botones de red */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cambiar Red</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={currentNetwork?.key === 'ethereum' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchToNetwork('ethereum')}
              disabled={currentNetwork?.key === 'ethereum'}
            >
              Ethereum
            </Button>
            <Button
              variant={currentNetwork?.key === 'sepolia' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchToNetwork('sepolia')}
              disabled={currentNetwork?.key === 'sepolia'}
            >
              Sepolia
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
