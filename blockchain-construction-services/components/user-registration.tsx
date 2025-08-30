"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, CreditCard, Save, Camera, X } from "lucide-react"

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
  avatar?: string
  isRegistered: boolean
}

export function UserRegistration({ walletAddress, onSubmit, existingProfile, onCancel }: UserRegistrationProps) {
  const isEditMode = !!existingProfile
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    username: existingProfile?.username || "",
    phoneNumber: existingProfile?.phoneNumber || "",
    documentNumber: existingProfile?.documentNumber || "",
    avatar: existingProfile?.avatar || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [avatarPreview, setAvatarPreview] = useState<string>(existingProfile?.avatar || "")

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, avatar: "La imagen debe ser menor a 5MB" }))
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: "Solo se permiten imágenes" }))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        setFormData(prev => ({ ...prev, avatar: result }))
        setErrors(prev => ({ ...prev, avatar: "" }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarPreview("")
    setFormData(prev => ({ ...prev, avatar: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

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
        avatar: formData.avatar || undefined,
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
            {/* Photo upload section */}
            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Foto de Perfil</span>
              </Label>
              <div className="flex flex-col items-center space-y-3">
                {/* Avatar preview */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                {/* Upload button */}
                <div className="flex flex-col items-center space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {avatarPreview ? "Cambiar" : "Subir foto"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Máximo 5MB. Formatos: JPG, PNG, GIF
                  </p>
                </div>
                {errors.avatar && (
                  <p className="text-sm text-red-600">{errors.avatar}</p>
                )}
              </div>
            </div>

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
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
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
