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
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
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
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b287?w=150&h=150&fit=crop&crop=face",
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
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
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
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
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
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
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
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
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
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
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
      location: "Bogotá Norte",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
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
        phone: "+57 301 234 567",
        email: "javier.cerrajero@email.com"
      }
    },
    // Nuevos profesionales de Latinoamérica
    {
      id: 8,
      address: "0x8901234567890123456789012345678901234567",
      name: "Ana Sofía Ramírez",
      description: "Arquitecta especializada en diseño sustentable y construcción ecológica. 10 años transformando espacios.",
      skills: ["Diseño arquitectónico", "Construcción sustentable", "Remodelación", "Gestión de proyectos"],
      serviceTypes: [3], // CONSTRUCTION
      rating: 4.8,
      totalReviews: 94,
      completedJobs: 87,
      joinDate: Date.now() - 23328000000, // 9 meses atrás
      hourlyRate: "0.045",
      location: "Ciudad de México",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c898b586?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 1 hora",
      successRate: 95.4,
      portfolio: [
        {
          title: "Casa ecológica familiar",
          description: "Diseño y construcción de vivienda sustentable de 180m²",
          completedDate: Date.now() - 5184000000, // 2 meses atrás
        }
      ],
      reviews: [
        {
          id: 14,
          clientName: "Roberto Mendoza",
          clientAddress: "0xb123456789012345678901234567890123456789",
          rating: 5,
          comment: "Ana superó todas nuestras expectativas. El diseño es hermoso y funcional.",
          date: Date.now() - 3024000000, // 5 semanas atrás
          serviceType: 3,
          verified: true
        }
      ],
      contact: {
        phone: "+52 55 1234 5678",
        email: "ana.ramirez.arq@email.com"
      }
    },
    {
      id: 9,
      address: "0x9012345678901234567890123456789012345678",
      name: "Diego Fernández",
      description: "Plomero especialista en instalaciones de agua y gas con certificación internacional. Servicio 24/7.",
      skills: ["Plomería residencial", "Instalaciones de gas", "Sistemas de calefacción", "Reparaciones de emergencia"],
      serviceTypes: [1], // PLUMBING
      rating: 4.7,
      totalReviews: 156,
      completedJobs: 203,
      joinDate: Date.now() - 15552000000, // 6 meses atrás
      hourlyRate: "0.028",
      location: "Buenos Aires Centro",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 45 min",
      successRate: 97.2,
      portfolio: [
        {
          title: "Renovación sistema de agua",
          description: "Cambio completo de tuberías en edificio de 4 pisos",
          completedDate: Date.now() - 2592000000, // 1 mes atrás
        }
      ],
      reviews: [
        {
          id: 15,
          clientName: "Carmen Silva",
          clientAddress: "0xc234567890123456789012345678901234567890",
          rating: 4,
          comment: "Buen trabajo, aunque tardó un poco más de lo esperado. Precio justo.",
          date: Date.now() - 1814400000, // 3 semanas atrás
          serviceType: 1,
          verified: true
        }
      ],
      contact: {
        phone: "+54 11 4567 8901",
        email: "diego.plomero@email.com"
      }
    },
    {
      id: 10,
      address: "0xa123456789012345678901234567890123456789",
      name: "Isabella Santos",
      description: "Diseñadora de interiores con especialización en espacios comerciales y residenciales modernos.",
      skills: ["Diseño de interiores", "Decoración", "Mobiliario personalizado", "Iluminación"],
      serviceTypes: [4], // PAINTING
      rating: 4.9,
      totalReviews: 73,
      completedJobs: 68,
      joinDate: Date.now() - 18144000000, // 7 meses atrás
      hourlyRate: "0.038",
      location: "São Paulo",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 2 horas",
      successRate: 98.1,
      portfolio: [
        {
          title: "Remodelación oficina corporativa",
          description: "Diseño completo de espacios de trabajo modernos",
          completedDate: Date.now() - 1209600000, // 2 semanas atrás
        }
      ],
      reviews: [
        {
          id: 16,
          clientName: "Paulo Costa",
          clientAddress: "0xd345678901234567890123456789012345678901",
          rating: 5,
          comment: "Isabella tiene un ojo increíble para el diseño. Nuestra oficina quedó espectacular.",
          date: Date.now() - 604800000, // 1 semana atrás
          serviceType: 4,
          verified: true
        }
      ],
      contact: {
        phone: "+55 11 9876 5432",
        email: "isabella.design@email.com"
      }
    },
    {
      id: 11,
      address: "0xb234567890123456789012345678901234567890",
      name: "Miguel Ángel Vargas",
      description: "Carpintero artesanal con 20 años de experiencia en muebles a medida y restauración de antigüedades.",
      skills: ["Carpintería fina", "Muebles a medida", "Restauración", "Ebanistería"],
      serviceTypes: [5], // CARPENTRY
      rating: 4.8,
      totalReviews: 102,
      completedJobs: 134,
      joinDate: Date.now() - 28512000000, // 11 meses atrás
      hourlyRate: "0.032",
      location: "Medellín",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 3 horas",
      successRate: 96.7,
      portfolio: [
        {
          title: "Cocina integral de roble",
          description: "Diseño y fabricación completa de cocina personalizada",
          completedDate: Date.now() - 3024000000, // 5 semanas atrás
        }
      ],
      reviews: [
        {
          id: 17,
          clientName: "Lucía Morales",
          clientAddress: "0xe456789012345678901234567890123456789012",
          rating: 5,
          comment: "Miguel es un verdadero artista. Los muebles quedaron hermosos y funcionales.",
          date: Date.now() - 2419200000, // 4 semanas atrás
          serviceType: 5,
          verified: true
        }
      ],
      contact: {
        phone: "+57 304 567 8901",
        email: "miguel.carpintero@email.com"
      }
    },
    {
      id: 12,
      address: "0xc345678901234567890123456789012345678901",
      name: "Valentina Rojas",
      description: "Especialista en sistemas de aire acondicionado y climatización para hogares y oficinas.",
      skills: ["Instalación AC", "Mantenimiento HVAC", "Refrigeración", "Ventilación"],
      serviceTypes: [8], // HVAC
      rating: 4.6,
      totalReviews: 87,
      completedJobs: 95,
      joinDate: Date.now() - 12960000000, // 5 meses atrás
      hourlyRate: "0.042",
      location: "Santiago Centro",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 1 hora",
      successRate: 94.8,
      portfolio: [
        {
          title: "Sistema central edificio",
          description: "Instalación de climatización para edificio de oficinas",
          completedDate: Date.now() - 2592000000, // 1 mes atrás
        }
      ],
      reviews: [
        {
          id: 18,
          clientName: "Andrés Ruiz",
          clientAddress: "0xf567890123456789012345678901234567890123",
          rating: 4,
          comment: "Trabajo profesional, aunque el precio fue un poco alto. Quedamos conformes.",
          date: Date.now() - 1814400000, // 3 semanas atrás
          serviceType: 8,
          verified: true
        }
      ],
      contact: {
        phone: "+56 9 8765 4321",
        email: "valentina.clima@email.com"
      }
    },
    {
      id: 13,
      address: "0xd456789012345678901234567890123456789012",
      name: "Rafael Torres",
      description: "Técnico en electrodomésticos con certificación en todas las marcas principales. Reparaciones garantizadas.",
      skills: ["Reparación neveras", "Lavadoras", "Hornos microondas", "Electrodomésticos"],
      serviceTypes: [12], // APPLIANCE_REPAIR
      rating: 4.7,
      totalReviews: 198,
      completedJobs: 245,
      joinDate: Date.now() - 20736000000, // 8 meses atrás
      hourlyRate: "0.025",
      location: "Quito Norte",
      avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 2 horas",
      successRate: 95.6,
      portfolio: [
        {
          title: "Reparación nevera industrial",
          description: "Mantenimiento completo de nevera para restaurante",
          completedDate: Date.now() - 604800000, // 1 semana atrás
        }
      ],
      reviews: [
        {
          id: 19,
          clientName: "María Elena Vásquez",
          clientAddress: "0x0123456789012345678901234567890123456789",
          rating: 5,
          comment: "Rafael salvó mi nevera justo antes de una fiesta. Excelente servicio.",
          date: Date.now() - 345600000, // 4 días atrás
          serviceType: 12,
          verified: true
        }
      ],
      contact: {
        phone: "+593 98 765 4321",
        email: "rafael.electrodomesticos@email.com"
      }
    },
    {
      id: 14,
      address: "0xe567890123456789012345678901234567890123",
      name: "Camila Guerrero",
      description: "Paisajista y jardinera especializada en jardines urbanos y azoteas verdes con plantas nativas.",
      skills: ["Diseño de jardines", "Plantas nativas", "Riego automático", "Mantenimiento"],
      serviceTypes: [0], // LANDSCAPING
      rating: 4.9,
      totalReviews: 65,
      completedJobs: 58,
      joinDate: Date.now() - 15552000000, // 6 meses atrás
      hourlyRate: "0.035",
      location: "Lima Miraflores",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 4 horas",
      successRate: 97.8,
      portfolio: [
        {
          title: "Jardín vertical corporativo",
          description: "Diseño e instalación de muro verde de 50m²",
          completedDate: Date.now() - 1814400000, // 3 semanas atrás
        }
      ],
      reviews: [
        {
          id: 20,
          clientName: "Fernando Castro",
          clientAddress: "0x1234567890123456789012345678901234567890",
          rating: 5,
          comment: "Camila transformó nuestro patio en un oasis. Conoce mucho sobre plantas locales.",
          date: Date.now() - 1209600000, // 2 semanas atrás
          serviceType: 0,
          verified: true
        }
      ],
      contact: {
        phone: "+51 987 654 321",
        email: "camila.jardinera@email.com"
      }
    },
    {
      id: 15,
      address: "0xf678901234567890123456789012345678901234",
      name: "Sebastián Moreno",
      description: "Soldador certificado en soldadura MIG, TIG y por arco. Especialista en estructuras metálicas.",
      skills: ["Soldadura MIG/TIG", "Estructuras metálicas", "Reparación industrial", "Fabricación"],
      serviceTypes: [14], // WELDING
      rating: 4.8,
      totalReviews: 89,
      completedJobs: 112,
      joinDate: Date.now() - 25920000000, // 10 meses atrás
      hourlyRate: "0.048",
      location: "Monterrey",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 1 hora",
      successRate: 97.3,
      portfolio: [
        {
          title: "Escalera metálica exterior",
          description: "Fabricación e instalación de escalera de emergencia",
          completedDate: Date.now() - 2592000000, // 1 mes atrás
        }
      ],
      reviews: [
        {
          id: 21,
          clientName: "Jorge Salinas",
          clientAddress: "0x2345678901234567890123456789012345678901",
          rating: 4,
          comment: "Trabajo sólido y bien ejecutado. Sebastian es muy profesional.",
          date: Date.now() - 1814400000, // 3 semanas atrás
          serviceType: 14,
          verified: true
        }
      ],
      contact: {
        phone: "+52 81 2345 6789",
        email: "sebastian.soldador@email.com"
      }
    },
    {
      id: 16,
      address: "0x0789012345678901234567890123456789012345",
      name: "Daniela Herrera",
      description: "Especialista en control de plagas urbanas con métodos ecológicos y seguros para mascotas.",
      skills: ["Control de plagas", "Fumigación ecológica", "Prevención", "Desinfección"],
      serviceTypes: [13], // PEST_CONTROL
      rating: 4.6,
      totalReviews: 134,
      completedJobs: 167,
      joinDate: Date.now() - 18144000000, // 7 meses atrás
      hourlyRate: "0.030",
      location: "Guadalajara",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 3 horas",
      successRate: 93.2,
      portfolio: [
        {
          title: "Tratamiento preventivo restaurant",
          description: "Plan integral de control de plagas para cocina comercial",
          completedDate: Date.now() - 1209600000, // 2 semanas atrás
        }
      ],
      reviews: [
        {
          id: 22,
          clientName: "Patricia Jiménez",
          clientAddress: "0x3456789012345678901234567890123456789012",
          rating: 4,
          comment: "Efectivo contra las hormigas, pero tuvo que regresar dos veces.",
          date: Date.now() - 604800000, // 1 semana atrás
          serviceType: 13,
          verified: true
        }
      ],
      contact: {
        phone: "+52 33 3456 7890",
        email: "daniela.plagas@email.com"
      }
    },
    {
      id: 17,
      address: "0x1890123456789012345678901234567890123456",
      name: "Mateo Delgado",
      description: "Técnico especialista en instalación y reparación de cristales, ventanas y mamparas de baño.",
      skills: ["Cristales templados", "Ventanas", "Mamparas", "Espejos"],
      serviceTypes: [15], // GLASS
      rating: 4.7,
      totalReviews: 76,
      completedJobs: 89,
      joinDate: Date.now() - 12960000000, // 5 meses atrás
      hourlyRate: "0.036",
      location: "Caracas Este",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 2 horas",
      successRate: 95.1,
      portfolio: [
        {
          title: "Mamparas oficina moderna",
          description: "Instalación de divisiones de cristal templado",
          completedDate: Date.now() - 1814400000, // 3 semanas atrás
        }
      ],
      reviews: [
        {
          id: 23,
          clientName: "Alejandra Núñez",
          clientAddress: "0x4567890123456789012345678901234567890123",
          rating: 5,
          comment: "Mateo hizo un trabajo perfecto con las mamparas del baño. Muy limpio y ordenado.",
          date: Date.now() - 1209600000, // 2 semanas atrás
          serviceType: 15,
          verified: true
        }
      ],
      contact: {
        phone: "+58 212 345 6789",
        email: "mateo.cristales@email.com"
      }
    },
    {
      id: 18,
      address: "0x2901234567890123456789012345678901234567",
      name: "Sofía Paredes",
      description: "Pintora profesional especializada en técnicas decorativas y pintura artística para interiores.",
      skills: ["Pintura decorativa", "Técnicas artísticas", "Murales", "Restauración"],
      serviceTypes: [4], // PAINTING
      rating: 4.9,
      totalReviews: 54,
      completedJobs: 47,
      joinDate: Date.now() - 10368000000, // 4 meses atrás
      hourlyRate: "0.041",
      location: "Cartagena",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 6 horas",
      successRate: 98.7,
      portfolio: [
        {
          title: "Mural artístico café",
          description: "Mural personalizado de 15m² con tema tropical",
          completedDate: Date.now() - 604800000, // 1 semana atrás
        }
      ],
      reviews: [
        {
          id: 24,
          clientName: "Carlos Mendoza",
          clientAddress: "0x5678901234567890123456789012345678901234",
          rating: 5,
          comment: "Sofía es increíble. El mural de nuestro café quedó espectacular, todos lo admiran.",
          date: Date.now() - 345600000, // 4 días atrás
          serviceType: 4,
          verified: true
        }
      ],
      contact: {
        phone: "+57 300 123 4567",
        email: "sofia.pintora@email.com"
      }
    },
    {
      id: 19,
      address: "0x3012345678901234567890123456789012345678",
      name: "Eduardo Vega",
      description: "Especialista en techos y cubiertas, impermeabilización y mantenimiento de azoteas.",
      skills: ["Impermeabilización", "Techos", "Cubiertas", "Mantenimiento azoteas"],
      serviceTypes: [6], // ROOFING
      rating: 4.5,
      totalReviews: 123,
      completedJobs: 148,
      joinDate: Date.now() - 22320000000, // 8.5 meses atrás
      hourlyRate: "0.039",
      location: "San José Centro",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 4 horas",
      successRate: 92.8,
      portfolio: [
        {
          title: "Impermeabilización edificio",
          description: "Tratamiento completo de azotea de 200m²",
          completedDate: Date.now() - 2592000000, // 1 mes atrás
        }
      ],
      reviews: [
        {
          id: 25,
          clientName: "Ana García",
          clientAddress: "0x6789012345678901234567890123456789012345",
          rating: 4,
          comment: "Eduardo solucionó las filtraciones, aunque tardó más días de los acordados.",
          date: Date.now() - 2419200000, // 4 semanas atrás
          serviceType: 6,
          verified: true
        }
      ],
      contact: {
        phone: "+506 8765 4321",
        email: "eduardo.techos@email.com"
      }
    },
    {
      id: 20,
      address: "0x4123456789012345678901234567890123456789",
      name: "Gabriela Morales",
      description: "Limpieza profesional especializada en oficinas corporativas y espacios comerciales.",
      skills: ["Limpieza corporativa", "Desinfección", "Limpieza post-construcción", "Mantenimiento"],
      serviceTypes: [7], // CLEANING
      rating: 4.8,
      totalReviews: 167,
      completedJobs: 234,
      joinDate: Date.now() - 31536000000, // 1 año atrás
      hourlyRate: "0.022",
      location: "Panamá Centro",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 1 hora",
      successRate: 97.9,
      portfolio: [
        {
          title: "Limpieza post-construcción oficina",
          description: "Limpieza completa después de remodelación de 500m²",
          completedDate: Date.now() - 1209600000, // 2 semanas atrás
        }
      ],
      reviews: [
        {
          id: 26,
          clientName: "Luis Rodríguez",
          clientAddress: "0x7890123456789012345678901234567890123456",
          rating: 5,
          comment: "Gabriela y su equipo son excepcionales. Nuestra oficina queda impecable siempre.",
          date: Date.now() - 604800000, // 1 semana atrás
          serviceType: 7,
          verified: true
        }
      ],
      contact: {
        phone: "+507 6543 2109",
        email: "gabriela.limpieza@email.com"
      }
    },
    {
      id: 21,
      address: "0x5234567890123456789012345678901234567890",
      name: "Alejandro Cruz",
      description: "Albañil especialista en construcción tradicional y moderna, acabados de lujo y restauración.",
      skills: ["Albañilería", "Acabados", "Restauración", "Construcción tradicional"],
      serviceTypes: [10], // MASONRY
      rating: 4.6,
      totalReviews: 145,
      completedJobs: 178,
      joinDate: Date.now() - 28512000000, // 11 meses atrás
      hourlyRate: "0.031",
      location: "La Paz Centro",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 3 horas",
      successRate: 94.2,
      portfolio: [
        {
          title: "Fachada colonial restaurada",
          description: "Restauración completa de fachada histórica",
          completedDate: Date.now() - 3024000000, // 5 semanas atrás
        }
      ],
      reviews: [
        {
          id: 27,
          clientName: "Isabel Chávez",
          clientAddress: "0x8901234567890123456789012345678901234567",
          rating: 4,
          comment: "Alejandro tiene buena técnica, pero a veces llega tarde a las citas.",
          date: Date.now() - 1814400000, // 3 semanas atrás
          serviceType: 10,
          verified: true
        }
      ],
      contact: {
        phone: "+591 7654 3210",
        email: "alejandro.albanil@email.com"
      }
    },
    {
      id: 22,
      address: "0x6345678901234567890123456789012345678901",
      name: "Mariana López",
      description: "Especialista en instalación de pisos: cerámica, porcelanato, madera y laminados.",
      skills: ["Instalación cerámica", "Pisos laminados", "Porcelanato", "Madera"],
      serviceTypes: [11], // FLOORING
      rating: 4.9,
      totalReviews: 82,
      completedJobs: 76,
      joinDate: Date.now() - 15552000000, // 6 meses atrás
      hourlyRate: "0.037",
      location: "Asunción",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 2 horas",
      successRate: 98.4,
      portfolio: [
        {
          title: "Piso porcelanato casa completa",
          description: "Instalación de 120m² de porcelanato imitación madera",
          completedDate: Date.now() - 1814400000, // 3 semanas atrás
        }
      ],
      reviews: [
        {
          id: 28,
          clientName: "Roberto Silva",
          clientAddress: "0x9012345678901234567890123456789012345678",
          rating: 5,
          comment: "Mariana es súper detallista. El piso quedó perfecto, sin una sola falla.",
          date: Date.now() - 1209600000, // 2 semanas atrás
          serviceType: 11,
          verified: true
        }
      ],
      contact: {
        phone: "+595 21 345 6789",
        email: "mariana.pisos@email.com"
      }
    },
    {
      id: 23,
      address: "0x7456789012345678901234567890123456789012",
      name: "Andrés Ramírez",
      description: "Electricista industrial con especialización en paneles solares y sistemas de energía renovable.",
      skills: ["Electricidad industrial", "Paneles solares", "Energía renovable", "Automatización"],
      serviceTypes: [2], // ELECTRICAL
      rating: 4.8,
      totalReviews: 96,
      completedJobs: 108,
      joinDate: Date.now() - 20736000000, // 8 meses atrás
      hourlyRate: "0.044",
      location: "Montevideo",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 2 horas",
      successRate: 96.8,
      portfolio: [
        {
          title: "Sistema solar residencial",
          description: "Instalación completa de 20 paneles solares con inversor",
          completedDate: Date.now() - 2592000000, // 1 mes atrás
        }
      ],
      reviews: [
        {
          id: 29,
          clientName: "Carmen Fernández",
          clientAddress: "0xa123456789012345678901234567890123456789",
          rating: 5,
          comment: "Andrés instaló nuestros paneles solares perfectamente. Ya estamos ahorrando en electricidad.",
          date: Date.now() - 1814400000, // 3 semanas atrás
          serviceType: 2,
          verified: true
        }
      ],
      contact: {
        phone: "+598 99 876 543",
        email: "andres.solar@email.com"
      }
    },
    {
      id: 24,
      address: "0x8567890123456789012345678901234567890123",
      name: "Lucía Mendoza",
      description: "Diseñadora de jardines especializada en espacios pequeños urbanos y jardines verticales.",
      skills: ["Jardines urbanos", "Espacios pequeños", "Jardines verticales", "Plantas de interior"],
      serviceTypes: [0], // LANDSCAPING
      rating: 4.7,
      totalReviews: 63,
      completedJobs: 57,
      joinDate: Date.now() - 12960000000, // 5 meses atrás
      hourlyRate: "0.033",
      location: "Tegucigalpa",
      avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 4 horas",
      successRate: 96.1,
      portfolio: [
        {
          title: "Jardín balcón apartamento",
          description: "Transformación de balcón de 8m² en jardín urbano",
          completedDate: Date.now() - 1209600000, // 2 semanas atrás
        }
      ],
      reviews: [
        {
          id: 30,
          clientName: "Mario Castillo",
          clientAddress: "0xb234567890123456789012345678901234567890",
          rating: 4,
          comment: "Lucía tiene muy buenas ideas, aunque el mantenimiento es más complejo de lo esperado.",
          date: Date.now() - 604800000, // 1 semana atrás
          serviceType: 0,
          verified: true
        }
      ],
      contact: {
        phone: "+504 9876 5432",
        email: "lucia.jardines@email.com"
      }
    },
    {
      id: 25,
      address: "0x9678901234567890123456789012345678901234",
      name: "Felipe Herrera",
      description: "Técnico en reparación de computadoras y equipos electrónicos, servicio a domicilio.",
      skills: ["Reparación PC", "Equipos electrónicos", "Redes", "Soporte técnico"],
      serviceTypes: [12], // APPLIANCE_REPAIR
      rating: 4.5,
      totalReviews: 134,
      completedJobs: 156,
      joinDate: Date.now() - 18144000000, // 7 meses atrás
      hourlyRate: "0.027",
      location: "San Salvador",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 3 horas",
      successRate: 93.7,
      portfolio: [
        {
          title: "Red oficina pequeña",
          description: "Configuración de red empresarial para 15 computadoras",
          completedDate: Date.now() - 2592000000, // 1 mes atrás
        }
      ],
      reviews: [
        {
          id: 31,
          clientName: "Sandra Morales",
          clientAddress: "0xc345678901234567890123456789012345678901",
          rating: 4,
          comment: "Felipe arregló mi computadora, pero tardó más tiempo del esperado en diagnosticar.",
          date: Date.now() - 1814400000, // 3 semanas atrás
          serviceType: 12,
          verified: true
        }
      ],
      contact: {
        phone: "+503 7654 3210",
        email: "felipe.tecnico@email.com"
      }
    },
    {
      id: 26,
      address: "0xa789012345678901234567890123456789012345",
      name: "Natalia Vargas",
      description: "Cerrajera profesional especializada en cerraduras de alta seguridad y sistemas biométricos.",
      skills: ["Cerraduras alta seguridad", "Sistemas biométricos", "Llaves master", "Cerrajería automotriz"],
      serviceTypes: [9], // LOCKSMITH
      rating: 4.9,
      totalReviews: 71,
      completedJobs: 68,
      joinDate: Date.now() - 10368000000, // 4 meses atrás
      hourlyRate: "0.041",
      location: "Managua",
      avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 1 hora",
      successRate: 98.2,
      portfolio: [
        {
          title: "Sistema biométrico corporativo",
          description: "Instalación de acceso biométrico para oficina de 3 plantas",
          completedDate: Date.now() - 1814400000, // 3 semanas atrás
        }
      ],
      reviews: [
        {
          id: 32,
          clientName: "José Álvarez",
          clientAddress: "0xd456789012345678901234567890123456789012",
          rating: 5,
          comment: "Natalia instaló un sistema súper moderno. Ahora me siento mucho más seguro.",
          date: Date.now() - 1209600000, // 2 semanas atrás
          serviceType: 9,
          verified: true
        }
      ],
      contact: {
        phone: "+505 8765 4321",
        email: "natalia.cerrajera@email.com"
      }
    },
    {
      id: 27,
      address: "0xb890123456789012345678901234567890123456",
      name: "Omar Castillo",
      description: "Constructor especializado en estructuras de concreto y cimentaciones para todo tipo de edificaciones.",
      skills: ["Estructuras de concreto", "Cimentaciones", "Construcción pesada", "Supervisión"],
      serviceTypes: [3], // CONSTRUCTION
      rating: 4.6,
      totalReviews: 89,
      completedJobs: 103,
      joinDate: Date.now() - 25920000000, // 10 meses atrás
      hourlyRate: "0.046",
      location: "Guatemala Centro",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      verified: true,
      responseTime: "< 6 horas",
      successRate: 95.4,
      portfolio: [
        {
          title: "Cimentación casa 2 plantas",
          description: "Excavación y construcción de cimientos para vivienda familiar",
          completedDate: Date.now() - 3024000000, // 5 semanas atrás
        }
      ],
      reviews: [
        {
          id: 33,
          clientName: "Gloria Pérez",
          clientAddress: "0xe567890123456789012345678901234567890123",
          rating: 4,
          comment: "Omar hizo un trabajo sólido, aunque el proyecto se extendió una semana más.",
          date: Date.now() - 2419200000, // 4 semanas atrás
          serviceType: 3,
          verified: true
        }
      ],
      contact: {
        phone: "+502 5432 1098",
        email: "omar.constructor@email.com"
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
