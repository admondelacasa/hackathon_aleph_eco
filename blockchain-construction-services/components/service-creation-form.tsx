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
import { Plus, X, MapPin, Calendar, DollarSign } from "lucide-react"

interface ServiceCreationFormProps {
  onSubmit: (serviceData: any) => void
  onCancel?: () => void
}

export function ServiceCreationForm({ onSubmit, onCancel }: ServiceCreationFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceType: "",
    budget: "",
    location: "",
    deadline: "",
    milestones: [""],
    skills: [] as string[],
    urgency: "normal",
  })

  const [newSkill, setNewSkill] = useState("")

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

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validMilestones = formData.milestones.filter((m) => m.trim() !== "")
    onSubmit({
      ...formData,
      milestones: validMilestones,
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Crear Nuevo Servicio</CardTitle>
        <p className="text-gray-600">Describe tu proyecto y recibe propuestas de contratistas verificados</p>
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

          {/* Skills Required */}
          <div className="space-y-4">
            <Label>Habilidades Requeridas</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Ej: Soldadura, Instalación eléctrica"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                Agregar
              </Button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{skill}</span>
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label>Urgencia del Proyecto</Label>
            <Select
              value={formData.urgency}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, urgency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja - Flexible con tiempos</SelectItem>
                <SelectItem value="normal">Normal - Dentro de fechas establecidas</SelectItem>
                <SelectItem value="high">Alta - Necesito comenzar pronto</SelectItem>
                <SelectItem value="urgent">Urgente - Necesito comenzar inmediatamente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancelar
              </Button>
            )}
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Publicar Servicio
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
