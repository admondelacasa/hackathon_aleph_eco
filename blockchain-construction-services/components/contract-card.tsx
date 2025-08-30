"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { User, MapPin, Calendar, DollarSign, CheckCircle } from "lucide-react"

interface ContractCardProps {
  contract: any
  role: "client" | "contractor"
}

export function ContractCard({ contract, role }: ContractCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "en curso": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completado": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelado": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const completedMilestones = contract.milestones?.filter((m: string) => m.includes("✓"))?.length || 0
  const totalMilestones = contract.milestones?.length || 1
  const progress = (completedMilestones / totalMilestones) * 100

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-2">{contract.title}</CardTitle>
            <Badge className={`text-xs ${getStatusColor(contract.status)}`}>
              {contract.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {contract.walletVerified && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Wallet ✓
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {contract.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">
              {role === "client" ? contract.contractorUsername : "Cliente"}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-green-600">{contract.budget} ETH</span>
          </div>
          
          {contract.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">{contract.location}</span>
            </div>
          )}
          
          {contract.deadline && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">
                {new Date(contract.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {contract.milestones && contract.milestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Progreso</span>
              <span className="text-gray-600 dark:text-gray-300">
                {completedMilestones}/{totalMilestones} hitos
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            Ver Detalles
          </Button>
          {contract.status === "En Curso" && (
            <Button size="sm" className="flex-1">
              {role === "client" ? "Contactar" : "Actualizar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
