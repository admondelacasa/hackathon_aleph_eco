"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, MapPin, Calendar, DollarSign, User, CheckCircle, AlertCircle, Loader2, Navigation } from "lucide-react"

interface ServiceCreationFormProps {
  onSubmit: (serviceData: any) => void
  onCancel?: () => void
}

export function ServiceCreationForm({ onSubmit, onCancel }: ServiceCreationFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceType: "",
    contractorUsername: "",
    walletVerified: false,
    budget: "",
    location: "",
    deadline: "",
    milestones: [""],
  })

  const [confirmations, setConfirmations] = useState({
    clientConfirmed: false,
    contractorConfirmed: false,
  })

  const [userValidation, setUserValidation] = useState({
    isValidating: false,
    isValid: false,
    userFound: null as { username: string; walletAddress: string } | null,
    message: ""
  })

  const [locationState, setLocationState] = useState({
    isGettingLocation: false,
    useManualLocation: false,
    country: "",
    province: "",
    city: "",
    currentLocation: ""
  })

  // Location data
  const countries = {
    "Argentina": {
      "Buenos Aires": ["Buenos Aires", "La Plata", "Mar del Plata", "Tandil", "Bahía Blanca"],
      "Córdoba": ["Córdoba", "Villa Carlos Paz", "Río Cuarto", "Villa María"],
      "Santa Fe": ["Santa Fe", "Rosario", "Rafaela", "Venado Tuerto"],
      "Mendoza": ["Mendoza", "San Rafael", "Godoy Cruz", "Maipú"]
    },
    "España": {
      "Madrid": ["Madrid", "Alcalá de Henares", "Móstoles", "Fuenlabrada"],
      "Barcelona": ["Barcelona", "Hospitalet", "Terrassa", "Sabadell"],
      "Valencia": ["Valencia", "Alicante", "Elche", "Castellón"],
      "Sevilla": ["Sevilla", "Jerez de la Frontera", "Dos Hermanas", "Alcalá de Guadaíra"]
    },
    "México": {
      "Ciudad de México": ["Ciudad de México", "Ecatepec", "Guadalajara", "Puebla"],
      "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá"],
      "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás", "Apodaca"]
    }
  }

  // Geolocation functions
  const getCurrentLocation = async () => {
    setLocationState(prev => ({ ...prev, isGettingLocation: true }))
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocalización no soportada por este navegador")
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      // Simulate reverse geocoding (in real app, use a service like Google Maps API)
      const mockLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
      
      setLocationState(prev => ({ 
        ...prev, 
        isGettingLocation: false, 
        currentLocation: mockLocation,
        useManualLocation: false 
      }))
      
      setFormData(prev => ({ ...prev, location: mockLocation }))
      
    } catch (error) {
      console.error("Error getting location:", error)
      setLocationState(prev => ({ 
        ...prev, 
        isGettingLocation: false,
        useManualLocation: true 
      }))
    }
  }

  const handleManualLocationChange = () => {
    const { country, province, city } = locationState
    if (country && province && city) {
      const fullLocation = `${city}, ${province}, ${country}`
      setFormData(prev => ({ ...prev, location: fullLocation }))
    }
  }

  useEffect(() => {
    handleManualLocationChange()
  }, [locationState.country, locationState.province, locationState.city])

  // Simulated user database (in real app, this would be an API call)
  const mockUsers = [
    { username: "CarlosMendoza", walletAddress: "0x742d35Cc6635Bb327234567890123456789ab987" },
    { username: "AnaRodriguez", walletAddress: "0x856f123456789012345678901234567890abcdef" },
    { username: "MiguelTorres", walletAddress: "0x123abc456def789012345678901234567890cdef" },
    { username: "LauraFernandez", walletAddress: "0xabcdef123456789012345678901234567890abcd" },
    { username: "RobertoSilva", walletAddress: "0x567890123456789012345678901234567890bcde" },
    { username: "ManuelHerrera", walletAddress: "0x678901234567890123456789012345678901cdef" }
  ]

  // Function to validate user
  const validateUser = async (username: string) => {
    if (!username.trim()) {
      setUserValidation({
        isValidating: false,
        isValid: false,
        userFound: null,
        message: ""
      })
      return
    }

    setUserValidation(prev => ({ ...prev, isValidating: true }))

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const foundUser = mockUsers.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    )

    if (foundUser) {
      setUserValidation({
        isValidating: false,
        isValid: true,
        userFound: foundUser,
        message: "Usuario válido encontrado"
      })
    } else {
      setUserValidation({
        isValidating: false,
        isValid: false,
        userFound: null,
        message: "Usuario no encontrado"
      })
    }
  }

  // Effect to validate user when username changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateUser(formData.contractorUsername)
    }, 800) // Debounce for 800ms

    return () => clearTimeout(timeoutId)
  }, [formData.contractorUsername])

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

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, ""],
    }))
  }

  const removeMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }))
  }

  const updateMilestone = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => (i === index ? value : milestone)),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validMilestones = formData.milestones.filter((m) => m.trim() !== "")
    
    if (!userValidation.isValid) {
      alert("Debes ingresar un usuario válido para el contratista")
      return
    }
    
    if (confirmations.clientConfirmed && confirmations.contractorConfirmed) {
      onSubmit({
        ...formData,
        milestones: validMilestones,
        contractorWalletAddress: userValidation.userFound?.walletAddress,
        confirmations,
      })
    } else {
      alert("Ambas partes deben confirmar antes de crear el contrato")
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Crear Nuevo Contrato</CardTitle>
        <p className="text-gray-600">Define los términos del contrato con el contratista seleccionado</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Proyecto</Label>
              <Input
                id="title"
                placeholder="Ej: Instalación de sistema eléctrico completo"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Tipo de Servicio</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center space-x-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Detallada</Label>
            <Textarea
              id="description"
              placeholder="Describe detalladamente el trabajo que necesitas, materiales, especificaciones técnicas, etc."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          {/* Contractor Section */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-orange-600" />
              <Label className="text-lg font-semibold">Usuario Contratista</Label>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractorUsername">Nombre de Usuario</Label>
                <Input
                  id="contractorUsername"
                  placeholder="Ingresa el nombre de usuario del contratista"
                  value={formData.contractorUsername}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contractorUsername: e.target.value }))}
                  required
                />
              </div>
              
              {/* User Validation Display */}
              {formData.contractorUsername && (
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border">
                  {userValidation.isValidating && (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-500">Verificando usuario...</span>
                    </div>
                  )}
                  
                  {!userValidation.isValidating && userValidation.isValid && userValidation.userFound && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-green-600">{userValidation.message}</p>
                        <p className="text-xs text-gray-500">
                          Wallet: {userValidation.userFound.walletAddress.slice(0, 6)}...{userValidation.userFound.walletAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {!userValidation.isValidating && !userValidation.isValid && userValidation.message && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-600">{userValidation.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Budget and Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Presupuesto (ETH)</span>
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="0.0"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Ubicación</span>
              </Label>
              
              {/* Location buttons */}
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={locationState.isGettingLocation}
                  className="flex items-center space-x-2"
                >
                  {locationState.isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  <span>
                    {locationState.isGettingLocation ? "Localizando..." : "Mi ubicación"}
                  </span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLocationState(prev => ({ ...prev, useManualLocation: !prev.useManualLocation }))}
                >
                  {locationState.useManualLocation ? "Ocultar" : "Manual"}
                </Button>
              </div>

              {/* Manual location selects */}
              {locationState.useManualLocation && (
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Country select */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">País</Label>
                      <Select 
                        value={locationState.country} 
                        onValueChange={(value) => setLocationState(prev => ({ 
                          ...prev, 
                          country: value, 
                          province: "", 
                          city: "" 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(countries).map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Province select */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Provincia</Label>
                      <Select 
                        value={locationState.province} 
                        onValueChange={(value) => setLocationState(prev => ({ 
                          ...prev, 
                          province: value, 
                          city: "" 
                        }))}
                        disabled={!locationState.country}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar provincia" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationState.country && 
                            Object.keys(countries[locationState.country as keyof typeof countries] || {}).map((province) => (
                              <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City select */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Ciudad</Label>
                      <Select 
                        value={locationState.city} 
                        onValueChange={(value) => setLocationState(prev => ({ ...prev, city: value }))}
                        disabled={!locationState.province}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ciudad" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationState.country && locationState.province && 
                            ((countries as any)[locationState.country]?.[locationState.province] || []).map((city: string) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Display current location */}
              <Input
                id="location"
                placeholder="Ciudad, País"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="bg-gray-50"
                readOnly={!locationState.useManualLocation && !!locationState.currentLocation}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Fecha Límite</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Hitos del Proyecto</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar Hito
              </Button>
            </div>

            <div className="space-y-3">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
                    {index + 1}
                  </div>
                  <Input
                    placeholder={`Descripción del hito ${index + 1}`}
                    value={milestone}
                    onChange={(e) => updateMilestone(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.milestones.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              <Label className="text-lg font-semibold">Confirmación del Contrato</Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clientConfirmed"
                  checked={confirmations.clientConfirmed}
                  onCheckedChange={(checked) => 
                    setConfirmations((prev) => ({ ...prev, clientConfirmed: checked as boolean }))
                  }
                />
                <Label htmlFor="clientConfirmed" className="text-sm">
                  Como cliente, doy mi consentimiento para crear este contrato
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contractorConfirmed"
                  checked={confirmations.contractorConfirmed}
                  onCheckedChange={(checked) => 
                    setConfirmations((prev) => ({ ...prev, contractorConfirmed: checked as boolean }))
                  }
                />
                <Label htmlFor="contractorConfirmed" className="text-sm">
                  Como prestador del servicio, acepto los términos del contrato
                </Label>
              </div>
              
              {confirmations.clientConfirmed && confirmations.contractorConfirmed && (
                <div className="flex items-center space-x-2 mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    ¡Ambas partes han confirmado! El contrato está listo para crearse.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              disabled={!confirmations.clientConfirmed || !confirmations.contractorConfirmed}
            >
              {confirmations.clientConfirmed && confirmations.contractorConfirmed 
                ? "Crear Contrato" 
                : "Confirmar Ambas Partes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
