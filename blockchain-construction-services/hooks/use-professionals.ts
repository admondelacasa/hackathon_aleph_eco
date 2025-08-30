"use client"

import { useState, useCallback } from "react"
import { SERVICE_TYPES } from "@/lib/contracts"

export interface Review {
  id: number
  clientName: string
  clientAddress: string
  rating: number
  comment: string
  date: number
  serviceType: number
  verified: boolean
}

export interface Professional {
  id: number
  address: string
  name: string
  description: string
  skills: string[]
  serviceTypes: number[]
  rating: number
  totalReviews: number
  completedJobs: number
  joinDate: number
  hourlyRate: string
  location: string
  avatar?: string
  verified: boolean
  responseTime: string
  successRate: number
  portfolio: {
    title: string
    description: string
    image?: string
    completedDate: number
  }[]
  reviews: Review[]
  contact: {
    phone?: string
    email?: string
    website?: string
  }
}

export function useProfessionals() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data demo de profesionales
  const mockProfessionals: Professional[] = [
    {
      id: 1,
      address: "0x742d35Cc6635Bb327234567890123456789ab987",
      name: "Carlos Mendoza",
      description: "Electricista certificado con 15 años de experiencia en instalaciones residenciales e industriales.",
      skills: ["Instalaciones eléctricas", "Automatización", "Paneles solares", "Sistemas de seguridad"],
      serviceTypes: [2], // ELECTRICAL
      rating: 4.9,
      totalReviews: 127,
      completedJobs: 156,
      joinDate: Date.now() - 31536000000, // 1 año atrás
      hourlyRate: "0.025",
      location: "Madrid Centro",
      verified: true,
      responseTime: "< 2 horas",
      successRate: 98.7,
      portfolio: [
        {
          title: "Instalación completa casa moderna",
          description: "Sistema eléctrico completo para vivienda de 200m²",
          completedDate: Date.now() - 2592000000, // 1 mes atrás
        },
        {
          title: "Automatización oficina",
          description: "Sistema domótico para oficina corporativa",
          completedDate: Date.now() - 5184000000, // 2 meses atrás
        }
      ],
      reviews: [
        {
          id: 1,
          clientName: "María González",
          clientAddress: "0x1234567890123456789012345678901234567890",
          rating: 5,
          comment: "Excelente trabajo, muy profesional y puntual. La instalación quedó perfecta.",
          date: Date.now() - 1209600000, // 2 semanas atrás
          serviceType: 2,
          verified: true
        },
        {
          id: 2,
          clientName: "José Martín",
          clientAddress: "0x2345678901234567890123456789012345678901",
          rating: 5,
          comment: "Trabajo impecable. Cumplió todos los plazos y el precio fue justo.",
          date: Date.now() - 2419200000, // 4 semanas atrás
          serviceType: 2,
          verified: true
        }
      ],
      contact: {
        phone: "+34 612 345 678",
        email: "carlos.electricista@email.com",
        website: "www.carloselectricista.es"
      }
    },
    {
      id: 2,
      address: "0x856f123456789012345678901234567890abcdef",
      name: "Ana Rodríguez",
      description: "Fontanera especialista en reparaciones urgentes y instalaciones de alta calidad.",
      skills: ["Reparaciones urgentes", "Instalación de calderas", "Fontanería industrial", "Detección de fugas"],
      serviceTypes: [1], // PLUMBING
      rating: 4.8,
      totalReviews: 89,
      completedJobs: 112,
      joinDate: Date.now() - 20736000000, // 8 meses atrás
      hourlyRate: "0.022",
      location: "Barcelona Norte",
      verified: true,
      responseTime: "< 1 hora",
      successRate: 96.4,
      portfolio: [
        {
          title: "Renovación baño completo",
          description: "Instalación completa de fontanería en baño principal",
          completedDate: Date.now() - 1814400000, // 3 semanas atrás
        }
      ],
      reviews: [
        {
          id: 3,
          clientName: "Pedro Sánchez",
          clientAddress: "0x3456789012345678901234567890123456789012",
          rating: 5,
          comment: "Reparó una fuga muy difícil de localizar. Muy recomendable.",
          date: Date.now() - 604800000, // 1 semana atrás
          serviceType: 1,
          verified: true
        }
      ],
      contact: {
        phone: "+34 623 456 789",
        email: "ana.fontanera@email.com"
      }
    },
    {
      id: 3,
      address: "0x123abc456def789012345678901234567890cdef",
      name: "Miguel Torres",
      description: "Constructor con amplia experiencia en obras residenciales y reformas integrales.",
      skills: ["Obra nueva", "Reformas", "Albañilería", "Gestión de proyectos"],
      serviceTypes: [3], // CONSTRUCTION
      rating: 4.7,
      totalReviews: 203,
      completedJobs: 245,
      joinDate: Date.now() - 63072000000, // 2 años atrás
      hourlyRate: "0.035",
      location: "Valencia Centro",
      verified: true,
      responseTime: "< 4 horas",
      successRate: 94.8,
      portfolio: [
        {
          title: "Piscina residencial",
          description: "Construcción completa de piscina con sistema de filtrado",
          completedDate: Date.now() - 7776000000, // 3 meses atrás
        },
        {
          title: "Reforma integral",
          description: "Reforma completa de apartamento 120m²",
          completedDate: Date.now() - 15552000000, // 6 meses atrás
        }
      ],
      reviews: [
        {
          id: 4,
          clientName: "Carmen López",
          clientAddress: "0x4567890123456789012345678901234567890123",
          rating: 5,
          comment: "Excelente constructor. La piscina quedó mejor de lo esperado.",
          date: Date.now() - 5184000000, // 2 meses atrás
          serviceType: 3,
          verified: true
        },
        {
          id: 5,
          clientName: "Francisco Ruiz",
          clientAddress: "0x5678901234567890123456789012345678901234",
          rating: 4,
          comment: "Buen trabajo en general, aunque se retrasó un poco en la entrega.",
          date: Date.now() - 10368000000, // 4 meses atrás
          serviceType: 3,
          verified: true
        }
      ],
      contact: {
        phone: "+34 634 567 890",
        email: "miguel.constructor@email.com",
        website: "www.construccionesmiguel.com"
      }
    },
    {
      id: 4,
      address: "0xabcdef123456789012345678901234567890abcd",
      name: "Laura Fernández",
      description: "Paisajista y jardinera especializada en jardines sostenibles y diseño exterior.",
      skills: ["Diseño de jardines", "Paisajismo", "Riego automático", "Plantas autóctonas"],
      serviceTypes: [0], // GARDENING
      rating: 4.9,
      totalReviews: 64,
      completedJobs: 78,
      joinDate: Date.now() - 15552000000, // 6 meses atrás
      hourlyRate: "0.020",
      location: "Sevilla Este",
      verified: true,
      responseTime: "< 3 horas",
      successRate: 97.4,
      portfolio: [
        {
          title: "Jardín mediterráneo",
          description: "Diseño y creación de jardín con plantas autóctonas",
          completedDate: Date.now() - 3888000000, // 1.5 meses atrás
        }
      ],
      reviews: [
        {
          id: 6,
          clientName: "Roberto García",
          clientAddress: "0x6789012345678901234567890123456789012345",
          rating: 5,
          comment: "Transformó completamente nuestro jardín. Un trabajo espectacular.",
          date: Date.now() - 2592000000, // 1 mes atrás
          serviceType: 0,
          verified: true
        }
      ],
      contact: {
        phone: "+34 645 678 901",
        email: "laura.paisajista@email.com",
        website: "www.jardineslaura.es"
      }
    }
  ]

  const getProfessionalsByService = useCallback(
    async (serviceType: number) => {
      setIsLoading(true)
      setError(null)

      try {
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const filteredProfessionals = mockProfessionals.filter(prof => 
          prof.serviceTypes.includes(serviceType)
        )

        return filteredProfessionals.sort((a, b) => b.rating - a.rating)
      } catch (error: any) {
        setError(error.message || "Error fetching professionals")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getProfessionalById = useCallback(
    async (professionalId: number) => {
      setIsLoading(true)
      setError(null)

      try {
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const professional = mockProfessionals.find(prof => prof.id === professionalId)
        
        if (!professional) {
          throw new Error("Professional not found")
        }

        return professional
      } catch (error: any) {
        setError(error.message || "Error fetching professional")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getAllProfessionals = useCallback(
    async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 400))
        
        return mockProfessionals.sort((a, b) => b.rating - a.rating)
      } catch (error: any) {
        setError(error.message || "Error fetching professionals")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    getProfessionalsByService,
    getProfessionalById,
    getAllProfessionals,
    isLoading,
    error,
  }
}
