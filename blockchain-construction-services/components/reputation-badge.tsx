"use client"

import { Badge } from "@/components/ui/badge"
import { Star, Award, Shield, TrendingUp } from "lucide-react"

interface ReputationBadgeProps {
  averageRating: number
  totalReviews: number
  completedJobs: number
  size?: "sm" | "md" | "lg"
}

export function ReputationBadge({ averageRating, totalReviews, completedJobs, size = "md" }: ReputationBadgeProps) {
  const getReputationLevel = () => {
    if (averageRating >= 4.8 && completedJobs >= 50) return "elite"
    if (averageRating >= 4.5 && completedJobs >= 25) return "expert"
    if (averageRating >= 4.0 && completedJobs >= 10) return "professional"
    if (completedJobs >= 5) return "verified"
    return "new"
  }

  const getReputationConfig = (level: string) => {
    switch (level) {
      case "elite":
        return {
          label: "Contratista Elite",
          icon: Award,
          variant: "default" as const,
          className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
        }
      case "expert":
        return {
          label: "Experto Verificado",
          icon: Shield,
          variant: "default" as const,
          className: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
        }
      case "professional":
        return {
          label: "Profesional",
          icon: TrendingUp,
          variant: "default" as const,
          className: "bg-gradient-to-r from-green-500 to-teal-600 text-white",
        }
      case "verified":
        return {
          label: "Verificado",
          icon: Shield,
          variant: "secondary" as const,
          className: "",
        }
      default:
        return {
          label: "Nuevo",
          icon: Star,
          variant: "outline" as const,
          className: "",
        }
    }
  }

  const level = getReputationLevel()
  const config = getReputationConfig(level)
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Badge variant={config.variant} className={`${sizeClasses[size]} ${config.className} flex items-center space-x-1`}>
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
      {size !== "sm" && (
        <span className="ml-1">
          ({averageRating.toFixed(1)} ★ • {totalReviews} reseñas)
        </span>
      )}
    </Badge>
  )
}
