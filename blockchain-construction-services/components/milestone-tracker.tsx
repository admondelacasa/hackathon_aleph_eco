"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Play } from "lucide-react"

interface Milestone {
  id: number
  title: string
  description: string
  amount: string
  status: "pending" | "in-progress" | "completed" | "approved"
  completedAt?: string
  dueDate?: string
}

interface MilestoneTrackerProps {
  milestones: Milestone[]
  totalAmount: string
  releasedAmount: string
  userRole: "client" | "contractor"
  onStartMilestone?: (milestoneId: number) => void
  onCompleteMilestone?: (milestoneId: number) => void
  onApproveMilestone?: (milestoneId: number) => void
}

export function MilestoneTracker({
  milestones,
  totalAmount,
  releasedAmount,
  userRole,
  onStartMilestone,
  onCompleteMilestone,
  onApproveMilestone,
}: MilestoneTrackerProps) {
  const completedMilestones = milestones.filter((m) => m.status === "approved").length
  const progress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-500" />
      case "completed":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>
      case "completed":
        return <Badge className="bg-orange-100 text-orange-800">Esperando Aprobación</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>
      default:
        return <Badge variant="secondary">Pendiente</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Seguimiento de Hitos</CardTitle>
          <div className="text-right">
            <div className="text-sm text-gray-600">Progreso General</div>
            <div className="font-bold text-lg">
              {completedMilestones}/{milestones.length}
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total: {totalAmount} ETH</span>
          <span>Liberado: {releasedAmount} ETH</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium">{milestone.title}</h4>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(milestone.status)}
                {getStatusBadge(milestone.status)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Valor: {milestone.amount} ETH</span>
                {milestone.dueDate && <span>Estimated Completion: {milestone.dueDate}</span>}
                {milestone.completedAt && <span>Completado: {milestone.completedAt}</span>}
              </div>

              <div className="flex space-x-2">
                {userRole === "contractor" && milestone.status === "pending" && onStartMilestone && (
                  <Button size="sm" variant="outline" onClick={() => onStartMilestone(milestone.id)}>
                    Iniciar
                  </Button>
                )}

                {userRole === "contractor" && milestone.status === "in-progress" && onCompleteMilestone && (
                  <Button size="sm" onClick={() => onCompleteMilestone(milestone.id)}>
                    Marcar Completado
                  </Button>
                )}

                {userRole === "client" && milestone.status === "completed" && onApproveMilestone && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onApproveMilestone(milestone.id)}
                  >
                    Aprobar y Liberar Pago
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
