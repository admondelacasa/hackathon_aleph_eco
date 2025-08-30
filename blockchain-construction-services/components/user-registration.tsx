"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, CreditCard, Save } from "lucide-react"

interface UserRegistrationProps {
  walletAddress: string
  onSubmit: (userData: UserProfile) => void
  existingProfile?: UserProfile | null
  onCancel?: () => void
}

export interface UserProfile {
  walletAddress: string
  username: string
  phoneNumber: string
  documentNumber: string
  isRegistered: boolean
}

export function UserRegistration({ walletAddress, onSubmit, existingProfile, onCancel }: UserRegistrationProps) {
  const isEditMode = !!existingProfile
  
  const [formData, setFormData] = useState({
    username: existingProfile?.username || "",
    phoneNumber: existingProfile?.phoneNumber || "",
    documentNumber: existingProfile?.documentNumber || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido"
    } else if (formData.username.length < 3) {
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "El número de teléfono es requerido"
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Formato de teléfono inválido"
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = "El número de documento es requerido"
    } else if (formData.documentNumber.length < 6) {
      newErrors.documentNumber = "El número de documento debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      const userProfile: UserProfile = {
        walletAddress,
        username: formData.username.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        documentNumber: formData.documentNumber.trim(),
        isRegistered: true,
      }
      
      onSubmit(userProfile)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isEditMode ? "Editar Perfil" : "Completar Perfil"}
          </CardTitle>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {isEditMode 
              ? "Actualiza la información de tu perfil" 
              : "Para usar BuildTrust, necesitas completar tu perfil"
            }
          </p>
          <div className="text-center">
            <p className="text-xs text-gray-500 break-all">
              Wallet: {walletAddress}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Nombre de Usuario *</span>
              </Label>
              <Input
                id="username"
                placeholder="Ej: juan_constructor"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Número de Teléfono *</span>
              </Label>
              <Input
                id="phone"
                placeholder="Ej: +54 11 1234-5678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Número de Documento *</span>
              </Label>
              <Input
                id="document"
                placeholder="DNI, Pasaporte, etc."
                value={formData.documentNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                className={errors.documentNumber ? "border-red-500" : ""}
              />
              {errors.documentNumber && (
                <p className="text-sm text-red-600">{errors.documentNumber}</p>
              )}
            </div>

            <div className="pt-4">
              {isEditMode && onCancel ? (
                <div className="flex space-x-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Completar Registro
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-gray-500 mt-4">
              * Campos obligatorios. Esta información es necesaria para verificar tu identidad.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
