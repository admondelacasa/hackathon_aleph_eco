"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, MapPin, Calendar, DollarSign, User, CheckCircle, AlertCircle, Loader2, Navigation } from "lucide-react"

interface ServiceCreationFormProps {
  onSubmit: (serviceData: any) => void
  onCancel?: () => void
  userRole?: 'client' | 'contractor'
}

export function ServiceCreationForm({ onSubmit, onCancel, userRole = 'client' }: ServiceCreationFormProps) {
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
    currentLocation: "",
    countryPopoverOpen: false,
    provincePopoverOpen: false,
    cityPopoverOpen: false
  })

  // Location data - Expanded with more Latin American countries
  const countries = {
    "Argentina": {
      "Buenos Aires": ["Buenos Aires", "La Plata", "Mar del Plata", "Tandil", "Bahía Blanca", "Quilmes", "Lanús"],
      "Córdoba": ["Córdoba", "Villa Carlos Paz", "Río Cuarto", "Villa María", "San Francisco"],
      "Santa Fe": ["Santa Fe", "Rosario", "Rafaela", "Venado Tuerto", "Reconquista"],
      "Mendoza": ["Mendoza", "San Rafael", "Godoy Cruz", "Maipú", "Luján de Cuyo"],
      "Tucumán": ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo", "Banda del Río Salí"],
      "Entre Ríos": ["Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay"]
    },
    "Brasil": {
      "São Paulo": ["São Paulo", "Campinas", "Santos", "São José dos Campos", "Ribeirão Preto", "Sorocaba"],
      "Rio de Janeiro": ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu", "Belford Roxo"],
      "Minas Gerais": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"],
      "Bahia": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Jequié"],
      "Rio Grande do Sul": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"]
    },
    "México": {
      "Ciudad de México": ["Ciudad de México", "Iztapalapa", "Ecatepec", "Guadalajara", "Puebla"],
      "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta"],
      "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás", "Apodaca", "Santa Catarina"],
      "Veracruz": ["Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba", "Orizaba"],
      "Yucatán": ["Mérida", "Kanasín", "Umán", "Progreso", "Tizimín"]
    },
    "Colombia": {
      "Bogotá": ["Bogotá", "Soacha", "Chía", "Zipaquirá", "Facatativá"],
      "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó"],
      "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago"],
      "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanagrande", "Baranoa"],
      "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja"]
    },
    "Chile": {
      "Región Metropolitana": ["Santiago", "Puente Alto", "Maipú", "Las Condes", "La Florida"],
      "Valparaíso": ["Valparaíso", "Viña del Mar", "Villa Alemana", "Quilpué", "San Antonio"],
      "Biobío": ["Concepción", "Talcahuano", "Chillán", "Los Ángeles", "Coronel"],
      "Araucanía": ["Temuco", "Villarrica", "Pucón", "Padre Las Casas", "Angol"]
    },
    "Perú": {
      "Lima": ["Lima", "Callao", "San Juan de Lurigancho", "Ate", "Comas"],
      "La Libertad": ["Trujillo", "Chepén", "Pacasmayo", "Casa Grande", "Laredo"],
      "Arequipa": ["Arequipa", "Cayma", "Cerro Colorado", "Yanahuara", "Miraflores"],
      "Cusco": ["Cusco", "Wanchaq", "Santiago", "San Sebastián", "San Jerónimo"]
    },
    "Ecuador": {
      "Pichincha": ["Quito", "Cayambe", "Mejía", "Pedro Moncayo", "Rumiñahui"],
      "Guayas": ["Guayaquil", "Durán", "Samborondón", "Daule", "Playas"],
      "Azuay": ["Cuenca", "Gualaceo", "Paute", "Santa Isabel", "Chordeleg"],
      "Manabí": ["Portoviejo", "Manta", "Chone", "Montecristi", "Jipijapa"]
    },
    "Uruguay": {
      "Montevideo": ["Montevideo", "Ciudad de la Costa", "Las Piedras", "Pando", "Barros Blancos"],
      "Canelones": ["Canelones", "Santa Lucía", "Pando", "La Paz", "Progreso"],
      "Maldonado": ["Maldonado", "Punta del Este", "San Carlos", "Piriápolis", "Pan de Azúcar"]
    },
    "Paraguay": {
      "Central": ["Asunción", "Lambaré", "San Lorenzo", "Luque", "Capiatá"],
      "Alto Paraná": ["Ciudad del Este", "Hernandarias", "Minga Guazú", "Presidente Franco"],
      "Itapúa": ["Encarnación", "Bella Vista", "Fram", "Jesús", "Trinidad"]
    },
    "Bolivia": {
      "La Paz": ["La Paz", "El Alto", "Viacha", "Tiwanaku", "Achocalla"],
      "Santa Cruz": ["Santa Cruz de la Sierra", "Montero", "Warnes", "La Guardia", "Cotoca"],
      "Cochabamba": ["Cochabamba", "Quillacollo", "Sacaba", "Colcapirhua", "Tiquipaya"]
    },
    "Venezuela": {
      "Distrito Capital": ["Caracas", "Chacao", "Baruta", "El Hatillo", "Sucre"],
      "Miranda": ["Los Teques", "Guarenas", "Guatire", "Charallave", "Cúa"],
      "Zulia": ["Maracaibo", "Ciudad Ojeda", "Cabimas", "Punto Fijo", "Los Puertos de Altagracia"]
    },
    "España": {
      "Madrid": ["Madrid", "Alcalá de Henares", "Móstoles", "Fuenlabrada", "Leganés"],
      "Barcelona": ["Barcelona", "Hospitalet", "Terrassa", "Sabadell", "Badalona"],
      "Valencia": ["Valencia", "Alicante", "Elche", "Castellón", "Torrent"],
      "Sevilla": ["Sevilla", "Jerez de la Frontera", "Dos Hermanas", "Alcalá de Guadaíra", "Utrera"]
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

      // Simulate reverse geocoding with realistic location data for Latin America
      // In a real app, you would use Google Maps Geocoding API or similar service
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      let mockLocation = "Ubicación no identificada"
      
      // Extended mock geocoding based on coordinates ranges for Latin America
      // Argentina
      if (lat >= -38.95 && lat <= -32.89 && lng >= -68.84 && lng <= -57.53) {
        mockLocation = "Buenos Aires, Argentina"
      } else if (lat >= -34.92 && lat <= -31.16 && lng >= -65.23 && lng <= -63.18) {
        mockLocation = "Córdoba, Argentina" 
      } else if (lat >= -31.89 && lat <= -28.17 && lng >= -62.08 && lng <= -59.97) {
        mockLocation = "Santa Fe, Argentina"
      } else if (lat >= -33.28 && lat <= -32.53 && lng >= -69.35 && lng <= -68.19) {
        mockLocation = "Mendoza, Argentina"
      }
      // Brasil
      else if (lat >= -23.73 && lat <= -23.45 && lng >= -46.83 && lng <= -46.36) {
        mockLocation = "São Paulo, Brasil"
      } else if (lat >= -22.97 && lat <= -22.79 && lng >= -43.79 && lng <= -43.09) {
        mockLocation = "Rio de Janeiro, Brasil"
      } else if (lat >= -19.99 && lat <= -19.81 && lng >= -44.06 && lng <= -43.85) {
        mockLocation = "Belo Horizonte, Brasil"
      }
      // México
      else if (lat >= 19.32 && lat <= 19.59 && lng >= -99.22 && lng <= -98.94) {
        mockLocation = "Ciudad de México, México"
      } else if (lat >= 20.61 && lat <= 20.75 && lng >= -103.41 && lng <= -103.25) {
        mockLocation = "Guadalajara, México"
      } else if (lat >= 25.61 && lat <= 25.76 && lng >= -100.37 && lng <= -100.25) {
        mockLocation = "Monterrey, México"
      }
      // Colombia
      else if (lat >= 4.53 && lat <= 4.81 && lng >= -74.22 && lng <= -73.99) {
        mockLocation = "Bogotá, Colombia"
      } else if (lat >= 6.20 && lat <= 6.33 && lng >= -75.62 && lng <= -75.47) {
        mockLocation = "Medellín, Colombia"
      } else if (lat >= 3.39 && lat <= 3.53 && lng >= -76.57 && lng <= -76.46) {
        mockLocation = "Cali, Colombia"
      }
      // Chile
      else if (lat >= -33.60 && lat <= -33.35 && lng >= -70.75 && lng <= -70.48) {
        mockLocation = "Santiago, Chile"
      } else if (lat >= -33.08 && lat <= -32.95 && lng >= -71.65 && lng <= -71.58) {
        mockLocation = "Valparaíso, Chile"
      }
      // Perú
      else if (lat >= -12.21 && lat <= -11.87 && lng >= -77.16 && lng <= -76.84) {
        mockLocation = "Lima, Perú"
      } else if (lat >= -16.43 && lat <= -16.34 && lng >= -71.58 && lng <= -71.49) {
        mockLocation = "Arequipa, Perú"
      }
      // Ecuador
      else if (lat >= -0.35 && lat <= 0.01 && lng >= -78.65 && lng <= -78.45) {
        mockLocation = "Quito, Ecuador"
      } else if (lat >= -2.30 && lat <= -2.10 && lng >= -79.96 && lng <= -79.84) {
        mockLocation = "Guayaquil, Ecuador"
      }
      // Uruguay
      else if (lat >= -34.92 && lat <= -34.85 && lng >= -56.22 && lng <= -56.12) {
        mockLocation = "Montevideo, Uruguay"
      }
      // Paraguay
      else if (lat >= -25.34 && lat <= -25.23 && lng >= -57.67 && lng <= -57.57) {
        mockLocation = "Asunción, Paraguay"
      }
      // Bolivia
      else if (lat >= -16.54 && lat <= -16.46 && lng >= -68.17 && lng <= -68.09) {
        mockLocation = "La Paz, Bolivia"
      } else if (lat >= -17.83 && lat <= -17.75 && lng >= -63.23 && lng <= -63.15) {
        mockLocation = "Santa Cruz, Bolivia"
      }
      // Venezuela
      else if (lat >= 10.44 && lat <= 10.54 && lng >= -67.02 && lng <= -66.81) {
        mockLocation = "Caracas, Venezuela"
      }
      // España
      else if (lat >= 40.31 && lat <= 40.56 && lng >= -3.84 && lng <= -3.57) {
        mockLocation = "Madrid, España"
      } else if (lat >= 41.32 && lat <= 41.47 && lng >= 2.08 && lng <= 2.23) {
        mockLocation = "Barcelona, España"
      } else {
        // Default to closest major city based on general geographic region
        if (lat >= -55 && lat <= -20 && lng >= -75 && lng <= -35) {
          mockLocation = "Buenos Aires, Argentina"
        } else if (lat >= -35 && lat <= 12 && lng >= -82 && lng <= -34) {
          mockLocation = "São Paulo, Brasil"  
        } else if (lat >= 14 && lat <= 32 && lng >= -118 && lng <= -86) {
          mockLocation = "Ciudad de México, México"
        } else if (lat >= 35 && lat <= 45 && lng >= -10 && lng <= 5) {
          mockLocation = "Madrid, España"
        }
      }
      
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
    
    // Solo verificar la confirmación del cliente ya que es quien crea el contrato
    if (confirmations.clientConfirmed) {
      onSubmit({
        ...formData,
        milestones: validMilestones,
        contractorWalletAddress: userValidation.userFound?.walletAddress,
        confirmations: {
          ...confirmations,
          contractorConfirmed: false // El contratista confirmará después
        },
      })
    } else {
      alert("Debes confirmar como cliente para crear el contrato")
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
                
                {/* Manual Selection Dropdown */}
                <Select
                  value={locationState.useManualLocation ? "manual" : ""}
                  onValueChange={(value) => {
                    if (value === "manual") {
                      setLocationState(prev => ({ 
                        ...prev, 
                        useManualLocation: true,
                        currentLocation: "",
                        country: "",
                        province: "",
                        city: ""
                      }))
                      setFormData(prev => ({ ...prev, location: "" }))
                    }
                  }}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Manual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Selección Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Manual location selects - shown when manual selection is active */}
              {locationState.useManualLocation && (
                <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Selección Manual de Ubicación</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Disponible en {Object.keys(countries).length} países de Latinoamérica y España
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Country select with search */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">País</Label>
                      <Popover 
                        open={locationState.countryPopoverOpen} 
                        onOpenChange={(open) => setLocationState(prev => ({ ...prev, countryPopoverOpen: open }))}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={locationState.countryPopoverOpen}
                            className="w-full justify-between bg-white dark:bg-gray-800"
                          >
                            {locationState.country || "Seleccionar país..."}
                            <Navigation className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar país..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No se encontraron países.</CommandEmpty>
                              <CommandGroup>
                                {Object.keys(countries).map((country) => (
                                  <CommandItem
                                    key={country}
                                    value={country}
                                    onSelect={() => {
                                      setLocationState(prev => ({ 
                                        ...prev, 
                                        country: country, 
                                        province: "", 
                                        city: "",
                                        countryPopoverOpen: false
                                      }))
                                    }}
                                  >
                                    {country}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Province select with search */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Provincia/Estado</Label>
                      <Popover 
                        open={locationState.provincePopoverOpen} 
                        onOpenChange={(open) => setLocationState(prev => ({ ...prev, provincePopoverOpen: open }))}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={locationState.provincePopoverOpen}
                            className="w-full justify-between bg-white dark:bg-gray-800"
                            disabled={!locationState.country}
                          >
                            {locationState.province || "Seleccionar provincia..."}
                            <Navigation className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar provincia..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No se encontraron provincias.</CommandEmpty>
                              <CommandGroup>
                                {locationState.country && 
                                  Object.keys(countries[locationState.country as keyof typeof countries] || {}).map((province) => (
                                    <CommandItem
                                      key={province}
                                      value={province}
                                      onSelect={() => {
                                        setLocationState(prev => ({ 
                                          ...prev, 
                                          province: province, 
                                          city: "",
                                          provincePopoverOpen: false
                                        }))
                                      }}
                                    >
                                      {province}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* City select with search */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ciudad</Label>
                      <Popover 
                        open={locationState.cityPopoverOpen} 
                        onOpenChange={(open) => setLocationState(prev => ({ ...prev, cityPopoverOpen: open }))}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={locationState.cityPopoverOpen}
                            className="w-full justify-between bg-white dark:bg-gray-800"
                            disabled={!locationState.province}
                          >
                            {locationState.city || "Seleccionar ciudad..."}
                            <Navigation className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar ciudad..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No se encontraron ciudades.</CommandEmpty>
                              <CommandGroup>
                                {locationState.country && locationState.province && 
                                  ((countries as any)[locationState.country]?.[locationState.province] || []).map((city: string) => (
                                    <CommandItem
                                      key={city}
                                      value={city}
                                      onSelect={() => {
                                        setLocationState(prev => ({ ...prev, city, cityPopoverOpen: false }))
                                        // Update form data when city is selected
                                        if (locationState.country && locationState.province && city) {
                                          const fullLocation = `${city}, ${locationState.province}, ${locationState.country}`
                                          setFormData(prev => ({ ...prev, location: fullLocation }))
                                        }
                                      }}
                                    >
                                      {city}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {/* Selected location display */}
                  {locationState.country && locationState.province && locationState.city && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Ubicación seleccionada:</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {locationState.city}, {locationState.province}, {locationState.country}
                      </p>
                    </div>
                  )}
                  
                  {/* Reset manual selection button */}
                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLocationState(prev => ({ 
                          ...prev, 
                          useManualLocation: false,
                          country: "",
                          province: "",
                          city: "",
                          countryPopoverOpen: false,
                          provincePopoverOpen: false,
                          cityPopoverOpen: false
                        }))
                        setFormData(prev => ({ ...prev, location: "" }))
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar selección manual
                    </Button>
                  </div>
                </div>
              )}

              {/* Display current location */}
              <Input
                id="location"
                placeholder="Tu ubicación aparecerá aquí"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="bg-gray-50"
                readOnly={!locationState.useManualLocation || (locationState.useManualLocation && locationState.city !== "")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Fecha estimada de finalización</span>
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
                  disabled={userRole !== 'client'}
                  onCheckedChange={(checked: boolean) => 
                    setConfirmations((prev) => ({ ...prev, clientConfirmed: checked }))
                  }
                />
                <Label htmlFor="clientConfirmed" className="text-sm">
                  Como cliente, doy mi consentimiento para crear este contrato
                </Label>
                {confirmations.clientConfirmed && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contractorConfirmed"
                  checked={confirmations.contractorConfirmed}
                  disabled={true}
                  onCheckedChange={(checked: boolean) => 
                    setConfirmations((prev) => ({ ...prev, contractorConfirmed: checked }))
                  }
                />
                <Label htmlFor="contractorConfirmed" className="text-sm">
                  Como prestador del servicio, acepto los términos del contrato
                </Label>
                {confirmations.contractorConfirmed && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              {/* Status Messages */}
              {userRole === 'client' && !confirmations.clientConfirmed && (
                <div className="flex items-center space-x-2 mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Como cliente, debes confirmar para crear el contrato
                  </span>
                </div>
              )}
              
              {confirmations.clientConfirmed && (
                <div className="flex items-center space-x-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    ¡Listo! El contrato se creará y el prestador podrá revisarlo y confirmarlo.
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
              disabled={!confirmations.clientConfirmed}
            >
              {confirmations.clientConfirmed 
                ? "Crear Contrato" 
                : "Confirmar como Cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
