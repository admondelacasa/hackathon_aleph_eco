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
    },
    {
      id: 5,
      address: "0x567890123456789012345678901234567890bcde",
      name: "Roberto Silva",
      description: "Pintor profesional especializado en pintura interior, exterior y decorativa. 12 años de experiencia.",
      skills: ["Pintura interior", "Pintura exterior", "Pintura decorativa", "Empapelado", "Lacado"],
      serviceTypes: [4], // PAINTING
      rating: 4.7,
      totalReviews: 94,
      completedJobs: 143,
      joinDate: Date.now() - 15552000000, // 6 meses atrás
      hourlyRate: "0.018",
      location: "Valencia Centro",
      verified: true,
      responseTime: "< 3 horas",
      successRate: 95.8,
      portfolio: [
        {
          title: "Renovación apartamento moderno",
          description: "Pintura completa de apartamento de 90m² con acabados premium",
          completedDate: Date.now() - 1209600000, // 2 semanas atrás
        },
        {
          title: "Fachada edificio comercial",
          description: "Pintura exterior de edificio de 4 plantas con impermeabilización",
          completedDate: Date.now() - 4320000000, // 1.5 meses atrás
        }
      ],
      reviews: [
        {
          id: 8,
          clientName: "Carmen López",
          clientAddress: "0x5678901234567890123456789012345678901234",
          rating: 5,
          comment: "Trabajo impecable. Muy cuidadoso con los detalles y muy limpio.",
          date: Date.now() - 864000000, // 10 días atrás
          serviceType: 4,
          verified: true
        }
      ],
      contact: {
        phone: "+34 656 789 012",
        email: "roberto.pintor@email.com"
      }
    },
    {
      id: 6,
      address: "0x678901234567890123456789012345678901cdef",
      name: "Manuel Herrera",
      description: "Carpintero artesano con 20 años de experiencia en muebles a medida y restauración.",
      skills: ["Muebles a medida", "Restauración", "Carpintería de obra", "Ebanistería", "Instalación cocinas"],
      serviceTypes: [5], // CARPENTRY
      rating: 4.9,
      totalReviews: 78,
      completedJobs: 89,
      joinDate: Date.now() - 41472000000, // 16 meses atrás
      hourlyRate: "0.028",
      location: "Sevilla Este",
      verified: true,
      responseTime: "< 4 horas",
      successRate: 98.9,
      portfolio: [
        {
          title: "Cocina completa en roble",
          description: "Diseño y fabricación de cocina integral en madera maciza",
          completedDate: Date.now() - 2592000000, // 1 mes atrás
        },
        {
          title: "Restauración mesa antigua",
          description: "Restauración completa de mesa del siglo XIX",
          completedDate: Date.now() - 5184000000, // 2 meses atrás
        }
      ],
      reviews: [
        {
          id: 9,
          clientName: "Francisco Ruiz",
          clientAddress: "0x6789012345678901234567890123456789012345",
          rating: 5,
          comment: "Un verdadero artista. La calidad del trabajo es excepcional.",
          date: Date.now() - 1814400000, // 3 semanas atrás
          serviceType: 5,
          verified: true
        }
      ],
      contact: {
        phone: "+34 667 890 123",
        email: "manuel.carpintero@email.com",
        website: "www.carpinteriamanu.es"
      }
    },
    {
      id: 7,
      address: "0x789012345678901234567890123456789012def0",
      name: "Patricia Morales",
      description: "Técnica en climatización y calefacción. Especialista en instalación y mantenimiento de sistemas HVAC.",
      skills: ["Aire acondicionado", "Calefacción", "Ventilación", "Bombas de calor", "Mantenimiento HVAC"],
      serviceTypes: [8], // HVAC
      rating: 4.8,
      totalReviews: 67,
      completedJobs: 92,
      joinDate: Date.now() - 25920000000, // 10 meses atrás
      hourlyRate: "0.032",
      location: "Bilbao Norte",
      verified: true,
      responseTime: "< 2 horas",
      successRate: 97.8,
      portfolio: [
        {
          title: "Sistema climatización oficina",
          description: "Instalación completa de sistema de climatización para oficina de 300m²",
          completedDate: Date.now() - 1814400000, // 3 semanas atrás
        },
        {
          title: "Bomba de calor residencial",
          description: "Instalación de bomba de calor aerotérmica para vivienda unifamiliar",
          completedDate: Date.now() - 3628800000, // 6 semanas atrás
        }
      ],
      reviews: [
        {
          id: 10,
          clientName: "Antonio García",
          clientAddress: "0x7890123456789012345678901234567890123456",
          rating: 5,
          comment: "Muy profesional y técnica. Solucionó un problema complejo rápidamente.",
          date: Date.now() - 1209600000, // 2 semanas atrás
          serviceType: 8,
          verified: true
        }
      ],
      contact: {
        phone: "+34 678 901 234",
        email: "patricia.clima@email.com"
      }
    },
    {
      id: 8,
      address: "0x890123456789012345678901234567890123ef01",
      name: "Diego Ramírez",
      description: "Especialista en techos y cubiertas. Experto en reparaciones e impermeabilización de tejados.",
      skills: ["Reparación tejados", "Impermeabilización", "Canalones", "Tejas", "Cubiertas metálicas"],
      serviceTypes: [6], // ROOFING
      rating: 4.6,
      totalReviews: 83,
      completedJobs: 107,
      joinDate: Date.now() - 18144000000, // 7 meses atrás
      hourlyRate: "0.026",
      location: "Zaragoza Centro",
      verified: true,
      responseTime: "< 6 horas",
      successRate: 94.4,
      portfolio: [
        {
          title: "Reparación tejado casa rural",
          description: "Reparación completa de tejado de teja árabe con impermeabilización",
          completedDate: Date.now() - 2419200000, // 4 semanas atrás
        }
      ],
      reviews: [
        {
          id: 11,
          clientName: "Elena Jiménez",
          clientAddress: "0x8901234567890123456789012345678901234567",
          rating: 4,
          comment: "Buen trabajo, aunque tardó un poco más de lo esperado por el mal tiempo.",
          date: Date.now() - 1814400000, // 3 semanas atrás
          serviceType: 6,
          verified: true
        }
      ],
      contact: {
        phone: "+34 689 012 345",
        email: "diego.tejados@email.com"
      }
    },
    {
      id: 9,
      address: "0x901234567890123456789012345678901234f012",
      name: "Sandra Vega",
      description: "Servicio profesional de limpieza residencial y comercial. Especialista en limpieza profunda.",
      skills: ["Limpieza residencial", "Limpieza comercial", "Limpieza profunda", "Cristales", "Alfombras"],
      serviceTypes: [7], // CLEANING
      rating: 4.9,
      totalReviews: 156,
      completedJobs: 203,
      joinDate: Date.now() - 31104000000, // 12 meses atrás
      hourlyRate: "0.015",
      location: "Málaga Este",
      verified: true,
      responseTime: "< 1 hora",
      successRate: 99.0,
      portfolio: [
        {
          title: "Limpieza oficina corporativa",
          description: "Limpieza semanal de oficina de 500m² incluyendo cristales",
          completedDate: Date.now() - 604800000, // 1 semana atrás
        }
      ],
      reviews: [
        {
          id: 12,
          clientName: "Luis Herrero",
          clientAddress: "0x9012345678901234567890123456789012345678",
          rating: 5,
          comment: "Excelente servicio. Muy puntual y el resultado es impecable.",
          date: Date.now() - 432000000, // 5 días atrás
          serviceType: 7,
          verified: true
        }
      ],
      contact: {
        phone: "+34 690 123 456",
        email: "sandra.limpieza@email.com"
      }
    },
    {
      id: 10,
      address: "0xa01234567890123456789012345678901234f0123",
      name: "Javier Molina",
      description: "Cerrajero 24h con amplia experiencia en seguridad residencial y comercial.",
      skills: ["Apertura cerraduras", "Cambio bombines", "Cajas fuertes", "Puertas blindadas", "Sistemas seguridad"],
      serviceTypes: [9], // LOCKSMITH
      rating: 4.7,
      totalReviews: 134,
      completedJobs: 189,
      joinDate: Date.now() - 20736000000, // 8 meses atrás
      hourlyRate: "0.035",
      location: "Madrid Sur",
      verified: true,
      responseTime: "< 30 min",
      successRate: 96.8,
      portfolio: [
        {
          title: "Instalación puerta blindada",
          description: "Instalación completa de puerta de seguridad grado 3",
          completedDate: Date.now() - 1814400000, // 3 semanas atrás
        }
      ],
      reviews: [
        {
          id: 13,
          clientName: "Rosa Delgado",
          clientAddress: "0xa012345678901234567890123456789012345678",
          rating: 5,
          comment: "Servicio muy rápido. Llegó en 20 minutos y solucionó el problema.",
          date: Date.now() - 1209600000, // 2 semanas atrás
          serviceType: 9,
          verified: true
        }
      ],
      contact: {
        phone: "+34 601 234 567",
        email: "javier.cerrajero@email.com"
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
