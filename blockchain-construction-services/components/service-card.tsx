"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star, Clock, MapPin, User } from "lucide-react"

interface ServiceCardProps {
  service: {
    id: number
    client: string
    contractor: string
    totalAmount: string
    releasedAmount: string
    milestones: number
    completedMilestones: number
    status: number
    description: string
    serviceType: number
    createdAt?: number | string
    deadline?: number | string
    location?: string
    contractorName?: string
    contractorRating?: number
  }
  serviceTypes: string[]
  serviceIcons: any[]
  onViewDetails: (serviceId: number) => void
  onApply?: (serviceId: number) => void
  showApplyButton?: boolean
}

export function ServiceCard({
  service,
  serviceTypes,
  serviceIcons,
  onViewDetails,
  onApply,
  showApplyButton = false,
}: ServiceCardProps) {
  const IconComponent = serviceIcons[service.serviceType]
  const progress = service.milestones > 0 ? (service.completedMilestones / service.milestones) * 100 : 0

  const formatDate = (date: number | string | undefined) => {
    if (!date) return null
    if (typeof date === 'number') {
      return new Date(date).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
    return typeof date === 'string' ? date : null
  }

  const getStatusBadge = (status: number) => {
    const statuses = [
      { label: "Created", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
      { label: "In Progress", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      { label: "Completed", variant: "default" as const, color: "bg-green-100 text-green-800" },
      { label: "In Dispute", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      { label: "Cancelled", variant: "outline" as const, color: "bg-gray-100 text-gray-600" },
    ]
    return statuses[status] || statuses[0]
  }

  const statusInfo = getStatusBadge(service.status)

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5 text-blue-600" />
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">#{service.id}</span>
            {service.createdAt && (
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(service.createdAt)}
              </div>
            )}
          </div>
        </div>

        <CardTitle className="text-lg leading-tight">{service.description}</CardTitle>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{serviceTypes[service.serviceType]}</span>
          {service.location && (
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {service.location}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {service.contractorName && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">{service.contractorName}</span>
            </div>
            {service.contractorRating && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{service.contractorRating}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {service.completedMilestones}/{service.milestones} milestones
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Total Value</div>
            <div className="font-bold text-lg text-blue-600">{service.totalAmount} USDT</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Released</div>
            <div className="font-bold text-lg text-green-600">{service.releasedAmount} USDT</div>
          </div>
        </div>

        {service.deadline && (
          <div className="flex items-center justify-center p-2 bg-orange-50 rounded-lg">
            <Clock className="h-4 w-4 text-orange-600 mr-2" />
            <span className="text-sm text-orange-700">Estimated Completion: {formatDate(service.deadline)}</span>
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => onViewDetails(service.id)}
          >
            View Details
          </Button>
          {showApplyButton && onApply && (
            <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => onApply(service.id)}>
              Apply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
