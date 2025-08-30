"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, CheckCircle, TrendingUp } from "lucide-react"
import { Professional } from "@/hooks/use-professionals"

interface ProfessionalCardProps {
  professional: Professional
  onViewDetails: (professionalId: number) => void
  onContact: (professionalId: number) => void
}

export function ProfessionalCard({ professional, onViewDetails, onContact }: ProfessionalCardProps) {
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

  return (
    <Card className="hover:shadow-lg transition-shadow border-gray-200 hover:border-blue-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {professional.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {professional.name}
                </h3>
                {professional.verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                {renderStars(professional.rating)}
                <span className="text-sm text-gray-600 ml-1">
                  {professional.rating} ({professional.totalReviews} reseñas)
                </span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {professional.hourlyRate} ETH/h
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
          {professional.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {professional.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {professional.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{professional.skills.length - 3} más
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {professional.completedJobs}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Trabajos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {professional.successRate}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Éxito</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {professional.responseTime}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Respuesta</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{professional.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Miembro desde {new Date(professional.joinDate).getFullYear()}</span>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(professional.id)}
            className="flex-1"
          >
            Ver Detalles
          </Button>
          <Button
            size="sm"
            onClick={() => onContact(professional.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Contactar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
