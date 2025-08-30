"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, MapPin, Calendar, DollarSign, User, CheckCircle } from "lucide-react"

interface ServiceCreationFormProps {
  onSubmit: (serviceData: any) => void
  onCancel?: () => void
}

export function ServiceCreationForm({ onSubmit, onCancel }: ServiceCreationFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceType: "",
    contractorUsername: "",
    walletVerified: false,
    budget: "",
    location: "",
    deadline: "",
    milestones: [""],
  })

  const [confirmations, setConfirmations] = useState({
    clientConfirmed: false,
    contractorConfirmed: false,
  })

  const serviceTypes = [
    { value: "0", label: "Jardinería", icon: "🌱" },
    { value: "1", label: "Plomería", icon: "🔧" },
    { value: "2", label: "Electricidad", icon: "⚡" },
    { value: "3", label: "Construcción", icon: "🏗️" },
  ]

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, ""],
    }))
  }

  const removeMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }))
  }

  const updateMilestone = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => (i === index ? value : milestone)),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validMilestones = formData.milestones.filter((m) => m.trim() !== "")
    
    if (confirmations.clientConfirmed && confirmations.contractorConfirmed) {
      onSubmit({
        ...formData,
        milestones: validMilestones,
        confirmations,
      })
    } else {
      alert("Ambas partes deben confirmar antes de crear el contrato")
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Crear Nuevo Contrato</CardTitle>
        <p className="text-gray-600">Define los términos del contrato con el contratista seleccionado</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Proyecto</Label>
              <Input
                id="title"
                placeholder="Ej: Instalación de sistema eléctrico completo"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Tipo de Servicio</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center space-x-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Detallada</Label>
            <Textarea
              id="description"
              placeholder="Describe detalladamente el trabajo que necesitas, materiales, especificaciones técnicas, etc."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          {/* Contractor Section */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <Label className="text-lg font-semibold">Usuario Contratista</Label>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractorUsername">Nombre de Usuario</Label>
                <Input
                  id="contractorUsername"
                  placeholder="Ingresa el nombre de usuario del contratista"
                  value={formData.contractorUsername}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contractorUsername: e.target.value }))}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="walletVerified"
                    checked={formData.walletVerified}
                    onCheckedChange={(checked) => 
                      setFormData((prev) => ({ ...prev, walletVerified: checked as boolean }))
                    }
                  />
                  <Label htmlFor="walletVerified" className="text-sm">
                    Wallet verificada
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Budget and Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Presupuesto (ETH)</span>
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="0.0"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Ubicación</span>
              </Label>
              <Input
                id="location"
                placeholder="Ciudad, País"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Fecha Límite</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Hitos del Proyecto</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar Hito
              </Button>
            </div>

            <div className="space-y-3">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                    {index + 1}
                  </div>
                  <Input
                    placeholder={`Descripción del hito ${index + 1}`}
                    value={milestone}
                    onChange={(e) => updateMilestone(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.milestones.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <Label className="text-lg font-semibold">Confirmación del Contrato</Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clientConfirmed"
                  checked={confirmations.clientConfirmed}
                  onCheckedChange={(checked) => 
                    setConfirmations((prev) => ({ ...prev, clientConfirmed: checked as boolean }))
                  }
                />
                <Label htmlFor="clientConfirmed" className="text-sm">
                  Como cliente, doy mi consentimiento para crear este contrato
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contractorConfirmed"
                  checked={confirmations.contractorConfirmed}
                  onCheckedChange={(checked) => 
                    setConfirmations((prev) => ({ ...prev, contractorConfirmed: checked as boolean }))
                  }
                />
                <Label htmlFor="contractorConfirmed" className="text-sm">
                  Como prestador del servicio, acepto los términos del contrato
                </Label>
              </div>
              
              {confirmations.clientConfirmed && confirmations.contractorConfirmed && (
                <div className="flex items-center space-x-2 mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    ¡Ambas partes han confirmado! El contrato está listo para crearse.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!confirmations.clientConfirmed || !confirmations.contractorConfirmed}
            >
              {confirmations.clientConfirmed && confirmations.contractorConfirmed 
                ? "Crear Contrato" 
                : "Confirmar Ambas Partes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
