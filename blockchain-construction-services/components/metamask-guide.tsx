"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Shield, AlertTriangle, CheckCircle } from "lucide-react"

export function MetaMaskGuide() {
  const [isOpen, setIsOpen] = useState(false)

  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum?.isMetaMask

  const steps = [
    {
      title: "Instalar MetaMask",
      description: "Descarga e instala la extensión de MetaMask en tu navegador",
      action: "Ir a metamask.io",
      link: "https://metamask.io/download/",
      completed: isMetaMaskInstalled,
    },
    {
      title: "Crear o Importar Wallet",
      description: "Configura tu wallet creando una nueva o importando una existente",
      action: "Abrir MetaMask",
      completed: isMetaMaskInstalled,
    },
    {
      title: "Conectar a la Red",
      description: "Asegúrate de estar conectado a la red correcta (Ethereum Mainnet o Testnet)",
      completed: isMetaMaskInstalled,
    },
    {
      title: "Conectar a BuildTrust",
      description: "Haz clic en 'Conectar Wallet' para autorizar la conexión",
      completed: false,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          ¿Cómo conectar MetaMask?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <img src="/metamask-logo.png" alt="MetaMask" className="h-6 w-6" />
            <span>Guía de Conexión MetaMask</span>
          </DialogTitle>
          <DialogDescription>Sigue estos pasos para conectar tu wallet MetaMask a BuildTrust</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isMetaMaskInstalled && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">MetaMask no detectado</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">Necesitas instalar MetaMask para usar BuildTrust</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {steps.map((step, index) => (
              <Card key={index} className={step.completed ? "border-green-200 bg-green-50" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                    {step.action && step.link && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(step.link, "_blank")}
                        className="flex-shrink-0"
                      >
                        {step.action}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 text-blue-800 mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Seguridad</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Nunca compartas tu frase de recuperación (seed phrase)</li>
                <li>• Verifica siempre la URL antes de conectar tu wallet</li>
                <li>• BuildTrust nunca te pedirá tu clave privada</li>
                <li>• Revisa las transacciones antes de confirmarlas</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Badge variant={isMetaMaskInstalled ? "default" : "secondary"}>
                {isMetaMaskInstalled ? "MetaMask Detectado" : "MetaMask No Detectado"}
              </Badge>
            </div>
            <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
