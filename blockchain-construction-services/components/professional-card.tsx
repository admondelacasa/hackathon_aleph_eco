"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, MapPin, Clock, CheckCircle, Phone } from "lucide-react"
import { Professional } from "@/hooks/use-professionals"

interface ProfessionalCardProps {
  professional: Professional
  onViewDetails: (professionalId: number) => void
  onContact: (professionalId: number) => void
}

export function ProfessionalCard({ professional, onViewDetails, onContact }: ProfessionalCardProps) {
  const [showPhoneDialog, setShowPhoneDialog] = useState(false)

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
    <Card className="hover:shadow-lg transition-shadow border-gray-200 hover:border-orange-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
              {professional.avatar ? (
                <img 
                  src={professional.avatar} 
                  alt={professional.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {professional.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {professional.name}
                </h3>
                {professional.verified && (
                  <CheckCircle className="h-4 w-4 text-orange-500" />
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
          {/* Removed ETH/h rate badge */}
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

        <div className="flex justify-center">
          <div className="text-center py-2 px-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {professional.completedJobs}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Trabajos Completados</div>
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
            onClick={() => setShowPhoneDialog(true)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            <Phone className="h-4 w-4 mr-1" />
            Contactar
          </Button>
        </div>
      </CardContent>

      {/* Phone Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactar a {professional.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <Phone className="h-6 w-6 text-orange-600" />
            <div>
              <p className="font-medium text-gray-900">Número de teléfono</p>
              <p className="text-lg font-mono text-orange-600">
                {professional.contact?.phone || "No disponible"}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowPhoneDialog(false)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
