"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, CheckCircle, MapPin, Calendar, Award, Briefcase } from "lucide-react"

interface ContractorProfileProps {
  contractor: {
    address: string
    name: string
    description: string
    skills: string[]
    totalJobs: number
    completedJobs: number
    rating: number
    reviewCount: number
    isVerified: boolean
    joinedDate: string
    location?: string
    avatar?: string
    specialties?: string[]
    certifications?: string[]
  }
  onHire?: () => void
  onMessage?: () => void
  showActions?: boolean
}

export function ContractorProfile({ contractor, onHire, onMessage, showActions = true }: ContractorProfileProps) {
  const successRate = contractor.totalJobs > 0 ? Math.round((contractor.completedJobs / contractor.totalJobs) * 100) : 0

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={contractor.avatar || "/placeholder.svg"} alt={contractor.name} />
            <AvatarFallback className="text-lg font-semibold">
              {contractor.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-xl">{contractor.name}</CardTitle>
              {contractor.isVerified && (
                <Badge className="bg-blue-100 text-blue-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {contractor.location && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {contractor.location}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Desde {contractor.joinedDate}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(contractor.rating)}
                <span className="text-sm font-medium ml-1">
                  {contractor.rating.toFixed(1)} ({contractor.reviewCount} reseñas)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Descripción</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{contractor.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Briefcase className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{contractor.completedJobs}</div>
            <div className="text-xs text-gray-600">Trabajos Completados</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Award className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{successRate}%</div>
            <div className="text-xs text-gray-600">Tasa de Éxito</div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Star className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{contractor.rating.toFixed(1)}</div>
            <div className="text-xs text-gray-600">Calificación</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Especialidades</h4>
          <div className="flex flex-wrap gap-2">
            {contractor.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {contractor.certifications && contractor.certifications.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Certificaciones</h4>
            <div className="flex flex-wrap gap-2">
              {contractor.certifications.map((cert, index) => (
                <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex space-x-3 pt-4 border-t">
            {onMessage && (
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onMessage}>
                Enviar Mensaje
              </Button>
            )}
            {onHire && (
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onHire}>
                Contratar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
