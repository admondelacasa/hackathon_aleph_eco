"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReviewSystem } from "@/components/review-system"
import { ArrowLeft, Star } from "lucide-react"
import Link from "next/link"

interface ContractorStats {
  totalJobs: number
  completedJobs: number
  averageRating: number
  totalReviews: number
  responseTime: string
  completionRate: number
  specialties: string[]
}

export default function ContractorReviewsPage() {
  const params = useParams()
  const contractorAddress = params.address as string

  const [contractorStats, setContractorStats] = useState<ContractorStats>({
    totalJobs: 47,
    completedJobs: 45,
    averageRating: 4.8,
    totalReviews: 42,
    responseTime: "2 horas",
    completionRate: 95.7,
    specialties: ["Plomería", "Electricidad", "Reparaciones"],
  })

  const [reviews] = useState([
    {
      id: 1,
      reviewer: "0x1234...5678",
      reviewerName: "María González",
      rating: 5,
      comment: "Excelente trabajo en la instalación eléctrica. Muy profesional y puntual. Recomendado 100%.",
      timestamp: "Hace 2 días",
      isClient: true,
      helpful: 8,
      serviceType: "Instalación Eléctrica",
    },
    {
      id: 2,
      reviewer: "0x8765...4321",
      reviewerName: "Carlos Ruiz",
      rating: 4,
      comment: "Buen trabajo en la reparación de tuberías. Llegó a tiempo y resolvió el problema rápidamente.",
      timestamp: "Hace 1 semana",
      isClient: true,
      helpful: 5,
      serviceType: "Reparación de Plomería",
    },
    {
      id: 3,
      reviewer: "0x9999...1111",
      reviewerName: "Ana Martínez",
      rating: 5,
      comment: "Increíble atención al detalle en el trabajo de jardinería. Mi jardín nunca se había visto mejor.",
      timestamp: "Hace 2 semanas",
      isClient: true,
      helpful: 12,
      serviceType: "Jardinería",
    },
  ])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/contractor/${contractorAddress}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Perfil
            </Button>
          </Link>
        </div>

        {/* Contractor Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg" alt="Contratista" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">Juan Pérez</h1>
                <p className="text-gray-600">Contratista Verificado</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{contractorStats.averageRating}</span>
                </div>
                <p className="text-sm text-gray-600">Calificación</p>
              </div>

              <div className="text-center">
                <div className="font-bold text-blue-600">{contractorStats.completedJobs}</div>
                <p className="text-sm text-gray-600">Trabajos Completados</p>
              </div>

              <div className="text-center">
                <div className="font-bold text-green-600">{contractorStats.completionRate}%</div>
                <p className="text-sm text-gray-600">Tasa de Éxito</p>
              </div>

              <div className="text-center">
                <div className="font-bold text-purple-600">{contractorStats.responseTime}</div>
                <p className="text-sm text-gray-600">Tiempo Respuesta</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {contractorStats.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <ReviewSystem
          reviews={reviews}
          averageRating={contractorStats.averageRating}
          totalReviews={contractorStats.totalReviews}
          canReview={false}
        />
      </div>
    </div>
  )
}
