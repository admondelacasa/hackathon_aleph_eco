"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Scale, FileText, Clock, CheckCircle, Upload, Calendar } from "lucide-react"

interface DisputeEvidence {
  id: number
  type: "text" | "image" | "document"
  content: string
  fileUrl?: string
  fileName?: string
  timestamp: Date
  submittedBy: string
}

interface DisputeResolutionProps {
  serviceId: number
  disputeId: number
  clientAddress: string
  contractorAddress: string
  currentUser: string
  onResolveDispute?: (favorClient: boolean, resolution: string) => void
}

export function DisputeResolution({
  serviceId,
  disputeId,
  clientAddress,
  contractorAddress,
  currentUser,
  onResolveDispute,
}: DisputeResolutionProps) {
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([
    {
      id: 1,
      type: "text",
      content:
        "El contratista no completó el trabajo según las especificaciones acordadas. Falta la instalación del sistema de seguridad.",
      timestamp: new Date(Date.now() - 86400000),
      submittedBy: clientAddress,
    },
    {
      id: 2,
      type: "image",
      content: "Foto del trabajo realizado hasta la fecha",
      fileUrl: "/placeholder.svg?height=200&width=300",
      timestamp: new Date(Date.now() - 86400000),
      submittedBy: clientAddress,
    },
    {
      id: 3,
      type: "text",
      content:
        "El cliente cambió los requerimientos después de comenzar el trabajo. Las especificaciones originales fueron completadas correctamente.",
      timestamp: new Date(Date.now() - 43200000),
      submittedBy: contractorAddress,
    },
    {
      id: 4,
      type: "document",
      content: "Contrato original firmado",
      fileName: "contrato_original.pdf",
      timestamp: new Date(Date.now() - 43200000),
      submittedBy: contractorAddress,
    },
  ])

  const [newEvidence, setNewEvidence] = useState("")
  const [resolution, setResolution] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const isMediator = currentUser !== clientAddress && currentUser !== contractorAddress
  const isParticipant = currentUser === clientAddress || currentUser === contractorAddress

  const handleSubmitEvidence = () => {
    if (newEvidence.trim()) {
      const evidence: DisputeEvidence = {
        id: Date.now(),
        type: "text",
        content: newEvidence.trim(),
        timestamp: new Date(),
        submittedBy: currentUser,
      }

      setEvidence((prev) => [...prev, evidence])
      setNewEvidence("")
    }
  }

  const handleResolveDispute = (favorClient: boolean) => {
    if (onResolveDispute && resolution.trim()) {
      onResolveDispute(favorClient, resolution.trim())
    }
  }

  const getParticipantName = (address: string) => {
    if (address === clientAddress) return "Cliente"
    if (address === contractorAddress) return "Contratista"
    return "Mediador"
  }

  const getParticipantColor = (address: string) => {
    if (address === clientAddress) return "bg-blue-100 text-blue-800"
    if (address === contractorAddress) return "bg-green-100 text-green-800"
    return "bg-purple-100 text-purple-800"
  }

  return (
    <div className="space-y-6">
      {/* Dispute Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <CardTitle>Disputa #{disputeId}</CardTitle>
                <p className="text-sm text-gray-600">Servicio #{serviceId}</p>
              </div>
            </div>
            <Badge variant="destructive">En Proceso</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">Cliente</div>
              <div className="text-sm text-gray-600 mt-1">{clientAddress.slice(0, 10)}...</div>
            </div>

            <div className="flex items-center justify-center">
              <Scale className="h-8 w-8 text-gray-400" />
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">Contratista</div>
              <div className="text-sm text-gray-600 mt-1">{contractorAddress.slice(0, 10)}...</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dispute Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="evidence">Evidencia</TabsTrigger>
          <TabsTrigger value="resolution">Resolución</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Detalles de la Disputa</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Fecha de Inicio</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date().toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Estado</h4>
                  <Badge variant="destructive">En Proceso</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Descripción del Conflicto</h4>
                <p className="text-gray-600 leading-relaxed">
                  Disputa iniciada debido a desacuerdos sobre la completitud del trabajo y cambios en los requerimientos
                  durante la ejecución del proyecto.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Valor en Disputa</h4>
                <div className="text-2xl font-bold text-red-600">1.2 ETH</div>
                <p className="text-sm text-gray-600">Monto pendiente de liberación</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Evidencia Presentada</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evidence.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={getParticipantColor(item.submittedBy)}>
                        {getParticipantName(item.submittedBy)}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.timestamp.toLocaleString()}
                      </div>
                    </div>

                    {item.type === "text" && <p className="text-gray-700">{item.content}</p>}

                    {item.type === "image" && (
                      <div className="space-y-2">
                        <p className="text-gray-700">{item.content}</p>
                        <img
                          src={item.fileUrl || "/placeholder.svg"}
                          alt="Evidence"
                          className="rounded-lg max-w-sm h-auto border"
                        />
                      </div>
                    )}

                    {item.type === "document" && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{item.fileName}</p>
                          <p className="text-sm text-gray-600">{item.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isParticipant && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Agregar Evidencia</h4>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Describe tu evidencia o argumento..."
                      value={newEvidence}
                      onChange={(e) => setNewEvidence(e.target.value)}
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Archivo
                      </Button>
                      <Button onClick={handleSubmitEvidence} disabled={!newEvidence.trim()}>
                        Enviar Evidencia
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolution" className="space-y-4">
          {isMediator ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5" />
                  <span>Resolución de Disputa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Decisión del Mediador</h4>
                  <Textarea
                    placeholder="Explica tu decisión y razonamiento..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleResolveDispute(true)}
                    disabled={!resolution.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Favorecer Cliente
                  </Button>
                  <Button
                    onClick={() => handleResolveDispute(false)}
                    disabled={!resolution.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Favorecer Contratista
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Esperando Resolución</h3>
                <p className="text-gray-600">Un mediador revisará la evidencia presentada y tomará una decisión.</p>
                <div className="mt-6">
                  <Badge variant="outline">Tiempo estimado: 3-5 días hábiles</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
