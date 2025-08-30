"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Hammer, 
  Wrench, 
  Zap, 
  TreePine, 
  Search,
  Filter,
  Star,
  MapPin,
  Paintbrush,
  Construction,
  Home,
  Brush,
  Wind,
  Key,
  Square,
  Settings,
  Bug,
  Glasses
} from "lucide-react"
import { useProfessionals, Professional } from "@/hooks/use-professionals"
import { ProfessionalCard } from "./professional-card"
import { ProfessionalDetail } from "./professional-detail"
import { toast } from "@/hooks/use-toast"

interface ServiceBrowserProps {
  onBack?: () => void
}

const serviceTypes = [
  "Jardinería", "Plomería", "Electricidad", "Construcción", 
  "Pintura", "Carpintería", "Techos", "Limpieza", 
  "Climatización", "Cerrajería", "Albañilería", "Suelos",
  "Reparación electrodomésticos", "Control de plagas", "Soldadura", "Cristalería"
]
const serviceIcons = [TreePine, Wrench, Zap, Hammer, Paintbrush, Construction, Home, Brush, Wind, Key, Construction, Square, Settings, Bug, Zap, Glasses]

export function ServiceBrowser({ onBack }: ServiceBrowserProps) {
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [filterLocation, setFilterLocation] = useState("all")

  const { getProfessionalsByService, getProfessionalById, getAllProfessionals, isLoading } = useProfessionals()

  // Cargar todos los profesionales al inicio
  useEffect(() => {
    loadAllProfessionals()
  }, [])

  const loadAllProfessionals = async () => {
    try {
      const allProfessionals = await getAllProfessionals()
      setProfessionals(allProfessionals)
    } catch (error) {
      console.error("Error loading professionals:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesionales",
        variant: "destructive",
      })
    }
  }

  const handleServiceSelect = async (serviceIndex: number) => {
    try {
      setSelectedService(serviceIndex)
      const serviceProfessionals = await getProfessionalsByService(serviceIndex)
      setProfessionals(serviceProfessionals)
    } catch (error) {
      console.error("Error loading service professionals:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesionales del servicio",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = async (professionalId: number) => {
    try {
      const professional = await getProfessionalById(professionalId)
      setSelectedProfessional(professional)
    } catch (error) {
      console.error("Error loading professional details:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del profesional",
        variant: "destructive",
      })
    }
  }

  const handleContact = (professionalId: number) => {
    toast({
      title: "Contacto Iniciado",
      description: "Se ha enviado tu solicitud de contacto al profesional",
    })
  }

  const handleHire = (professionalId: number) => {
    toast({
      title: "Proceso de Contratación",
      description: "Se ha iniciado el proceso de contratación. Te contactaremos pronto.",
    })
  }

  // Filtrar y ordenar profesionales
  const filteredAndSortedProfessionals = professionals
    .filter(prof => {
      const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prof.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prof.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesLocation = filterLocation === "all" || prof.location.includes(filterLocation)
      
      return matchesSearch && matchesLocation
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "experience":
          return b.completedJobs - a.completedJobs
        case "reviews":
          return b.totalReviews - a.totalReviews
        default:
          return 0
      }
    })

  // Si hay un profesional seleccionado, mostrar sus detalles
  if (selectedProfessional) {
    return (
      <ProfessionalDetail
        professional={selectedProfessional}
        onBack={() => setSelectedProfessional(null)}
        onContact={handleContact}
        onHire={handleHire}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedService !== null 
            ? `Profesionales de ${serviceTypes[selectedService]}`
            : "Explorar Profesionales"
          }
        </h2>
      </div>

      {/* Selección de Servicios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant={selectedService === null ? "default" : "outline"}
          onClick={loadAllProfessionals}
          className="flex items-center space-x-2 p-4 h-auto"
        >
          <Search className="h-5 w-5" />
          <span>Todos</span>
        </Button>
        {serviceTypes.map((service, index) => {
          const IconComponent = serviceIcons[index]
          return (
            <Button
              key={index}
              variant={selectedService === index ? "default" : "outline"}
              onClick={() => handleServiceSelect(index)}
              className="flex items-center space-x-2 p-4 h-auto"
            >
              <IconComponent className="h-5 w-5" />
              <span>{service}</span>
            </Button>
          )
        })}
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar profesionales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Mejor calificados</SelectItem>
                <SelectItem value="experience">Más experiencia</SelectItem>
                <SelectItem value="reviews">Más reseñas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                <SelectItem value="Madrid">Madrid</SelectItem>
                <SelectItem value="Barcelona">Barcelona</SelectItem>
                <SelectItem value="Valencia">Valencia</SelectItem>
                <SelectItem value="Sevilla">Sevilla</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {filteredAndSortedProfessionals.length} encontrados
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Profesionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredAndSortedProfessionals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron profesionales</h3>
              <p className="text-sm">
                Prueba ajustando los filtros o términos de búsqueda
              </p>
            </div>
          </div>
        ) : (
          filteredAndSortedProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onViewDetails={handleViewDetails}
              onContact={handleContact}
            />
          ))
        )}
      </div>
    </div>
  )
}
