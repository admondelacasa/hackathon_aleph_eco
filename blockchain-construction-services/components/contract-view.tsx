"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckCircle, Calendar, DollarSign, MapPin, User, AlertTriangle } from "lucide-react"

interface ContractViewProps {
  contractData: {
    id: string
    title: string
    description: string
    serviceType: string
    budget: string
    location: string
    deadline: string
    milestones: string[]
    clientUsername: string
    contractorUsername: string
    confirmations: {
      clientConfirmed: boolean
      contractorConfirmed: boolean
    }
  }
  userRole: 'client' | 'contractor'
  onContractorConfirm?: () => void
  onBack?: () => void
}

export function ContractView({ contractData, userRole, onContractorConfirm, onBack }: ContractViewProps) {
  const [contractorConfirmed, setContractorConfirmed] = useState(contractData.confirmations.contractorConfirmed)

  const serviceTypes = [
    { value: "0", label: "Jardinería", icon: "🌱" },
    { value: "1", label: "Plomería", icon: "🔧" },
    { value: "2", label: "Electricidad", icon: "⚡" },
    { value: "3", label: "Construcción", icon: "🏗️" },
    { value: "4", label: "Pintura", icon: "🎨" },
    { value: "5", label: "Carpintería", icon: "🪚" },
    { value: "6", label: "Techos", icon: "🏠" },
    { value: "7", label: "Limpieza", icon: "🧽" },
    { value: "8", label: "Climatización", icon: "❄️" },
    { value: "9", label: "Cerrajería", icon: "🔐" },
    { value: "10", label: "Albañilería", icon: "🧱" },
    { value: "11", label: "Suelos", icon: "⬜" },
    { value: "12", label: "Reparación electrodomésticos", icon: "🔧" },
    { value: "13", label: "Control de plagas", icon: "🐛" },
    { value: "14", label: "Soldadura", icon: "⚡" },
    { value: "15", label: "Cristalería", icon: "🪟" },
  ]

  const getServiceTypeLabel = (typeValue: string) => {
    const serviceType = serviceTypes.find(type => type.value === typeValue)
    return serviceType ? `${serviceType.icon} ${serviceType.label}` : "Tipo desconocido"
  }

  const handleContractorConfirmation = () => {
    if (userRole === 'contractor') {
      setContractorConfirmed(!contractorConfirmed)
      onContractorConfirm?.()
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {userRole === 'contractor' ? 'Contrato Pendiente' : 'Detalles del Contrato'}
            </CardTitle>
            <p className="text-gray-600 mt-1">
              {userRole === 'contractor' 
                ? 'Revisa los términos y confirma tu aceptación del contrato'
                : 'Información detallada del contrato'
              }
            </p>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            ID: {contractData.id}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Contract Information - READ ONLY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Título del Proyecto</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <p className="text-sm">{contractData.title}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Tipo de Servicio</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <p className="text-sm">{getServiceTypeLabel(contractData.serviceType)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Descripción Detallada</Label>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <p className="text-sm whitespace-pre-wrap">{contractData.description}</p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-orange-600" />
              <Label className="text-lg font-semibold">Información de Usuarios</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Cliente</Label>
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border">
                  <p className="text-sm font-medium">{contractData.clientUsername}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Contratista</Label>
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border">
                  <p className="text-sm font-medium">{contractData.contractorUsername}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Presupuesto</span>
              </Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <p className="text-sm font-medium">{contractData.budget} ETH</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Ubicación</span>
              </Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <p className="text-sm">{contractData.location}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Fecha estimada de finalización</span>
              </Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <p className="text-sm">{contractData.deadline}</p>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Hitos del Proyecto</Label>
            <div className="space-y-3">
              {contractData.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm flex-1">{milestone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Status */}
          <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              <Label className="text-lg font-semibold">Estado de Confirmación</Label>
            </div>
            
            <div className="space-y-3">
              {/* Client Confirmation - Always Read Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clientConfirmed"
                  checked={contractData.confirmations.clientConfirmed}
                  disabled={true}
                />
                <Label htmlFor="clientConfirmed" className="text-sm">
                  Como cliente, doy mi consentimiento para crear este contrato
                </Label>
                {contractData.confirmations.clientConfirmed && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              {/* Contractor Confirmation - Interactive only for contractors */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contractorConfirmed"
                  checked={contractorConfirmed}
                  disabled={userRole !== 'contractor'}
                  onCheckedChange={handleContractorConfirmation}
                />
                <Label htmlFor="contractorConfirmed" className="text-sm">
                  Como prestador del servicio, acepto los términos del contrato
                </Label>
                {contractorConfirmed && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              {/* Status Messages */}
              {userRole === 'contractor' && !contractorConfirmed && (
                <div className="flex items-center space-x-2 mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Debes confirmar tu aceptación para activar este contrato
                  </span>
                </div>
              )}
              
              {contractData.confirmations.clientConfirmed && contractorConfirmed && (
                <div className="flex items-center space-x-2 mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    ¡Ambas partes han confirmado! El contrato está activado.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6 border-t">
            {onBack && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack} 
                className="flex-1 bg-transparent"
              >
                Volver
              </Button>
            )}
            
            {userRole === 'contractor' && !contractorConfirmed && (
              <Button 
                onClick={handleContractorConfirmation}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                Confirmar Aceptación del Contrato
              </Button>
            )}
            
            {userRole === 'contractor' && contractorConfirmed && (
              <Button 
                disabled
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                ✓ Contrato Confirmado
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
