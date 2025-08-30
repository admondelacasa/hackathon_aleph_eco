"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Award,
  ArrowLeft
} from "lucide-react"
import { Professional, Review } from "@/hooks/use-professionals"

interface ProfessionalDetailProps {
  professional: Professional
  onBack: () => void
  onContact: (professionalId: number) => void
  onHire: (professionalId: number) => void
}

export function ProfessionalDetail({ professional, onBack, onContact, onHire }: ProfessionalDetailProps) {
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      )
    }

    return stars
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderReview = (review: Review) => (
    <Card key={review.id} className="bg-gray-50 dark:bg-gray-800">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {review.clientName}
              </span>
              {review.verified && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="flex items-center space-x-1 mt-1">
              {renderStars(review.rating)}
              <span className="text-sm text-gray-600 ml-1">
                {review.rating}/5
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(review.date)}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {review.comment}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Perfil del Profesional
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {professional.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {professional.name}
                      </h1>
                      {professional.verified && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(professional.rating)}
                      <span className="text-gray-600 ml-2">
                        {professional.rating}/5 ({professional.totalReviews} reseñas)
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{professional.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Desde {new Date(professional.joinDate).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-3 py-1">
                  {professional.hourlyRate} ETH/h
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {professional.description}
              </p>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {professional.completedJobs}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Trabajos Completados
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {professional.successRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Tasa de Éxito
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {professional.responseTime}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Tiempo de Respuesta
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {professional.totalReviews}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Reseñas Totales
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Habilidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Especialidades y Habilidades</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {professional.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          {professional.portfolio.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Trabajos Destacados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {professional.portfolio.map((project, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {project.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {project.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      Completado el {formatDate(project.completedDate)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Reseñas */}
          <Card>
            <CardHeader>
              <CardTitle>Reseñas de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {professional.reviews.map(renderReview)}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Acciones */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={() => onHire(professional.id)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  Contactar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {professional.contact.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{professional.contact.phone}</span>
                </div>
              )}
              {professional.contact.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{professional.contact.email}</span>
                </div>
              )}
              {professional.contact.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a 
                    href={`https://${professional.contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {professional.contact.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verificación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Identidad verificada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Certificaciones validadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Referencias verificadas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
