"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, DollarSign, Clock, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react"
import { useConstructionServices, type Service } from "@/hooks/use-construction-services"
import { useBlockchain } from "@/hooks/use-blockchain"
import { ServiceCard } from "./service-card"

interface ServiceStats {
  total: number
  active: number
  completed: number
  disputed: number
  totalValue: string
  averageValue: string
}

export function ServiceDashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [stats, setStats] = useState<ServiceStats>({
    total: 0,
    active: 0,
    completed: 0,
    disputed: 0,
    totalValue: "0",
    averageValue: "0",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const { account, isConnected } = useBlockchain()
  const { getUserServices } = useConstructionServices()

  const serviceTypes = ["Jardinería", "Plomería", "Electricidad", "Construcción"]
  const serviceIcons = [null, null, null, null] // Placeholder for icons

  useEffect(() => {
    if (isConnected && account) {
      loadServices()
    }
  }, [isConnected, account])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm, statusFilter, typeFilter, activeTab])

  const loadServices = async () => {
    try {
      const userServices = await getUserServices()
      const allServices = [...userServices.asClient, ...userServices.asContractor]
      setServices(allServices)
      calculateStats(allServices)
    } catch (error) {
      console.error("Error loading services:", error)
    }
  }

  const calculateStats = (serviceList: Service[]) => {
    const total = serviceList.length
    const active = serviceList.filter((s) => s.status === 1).length
    const completed = serviceList.filter((s) => s.status === 2).length
    const disputed = serviceList.filter((s) => s.status === 3).length

    const totalValue = serviceList.reduce((sum, s) => sum + Number.parseFloat(s.totalAmount), 0)
    const averageValue = total > 0 ? totalValue / total : 0

    setStats({
      total,
      active,
      completed,
      disputed,
      totalValue: totalValue.toFixed(4),
      averageValue: averageValue.toFixed(4),
    })
  }

  const filterServices = () => {
    let filtered = services

    // Filter by tab
    if (activeTab === "client") {
      filtered = filtered.filter((s) => s.client.toLowerCase() === account?.toLowerCase())
    } else if (activeTab === "contractor") {
      filtered = filtered.filter((s) => s.contractor.toLowerCase() === account?.toLowerCase())
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (s) => s.description.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toString().includes(searchTerm),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status.toString() === statusFilter)
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((s) => s.serviceType.toString() === typeFilter)
    }

    setFilteredServices(filtered)
  }

  const getStatusBadge = (status: number) => {
    const statuses = [
      { label: "Creado", variant: "secondary" as const, icon: Clock },
      { label: "En Progreso", variant: "default" as const, icon: Clock },
      { label: "Completado", variant: "default" as const, icon: CheckCircle },
      { label: "En Disputa", variant: "destructive" as const, icon: AlertTriangle },
      { label: "Cancelado", variant: "outline" as const, icon: Clock },
    ]
    return statuses[status] || statuses[0]
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Servicios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">{stats.totalValue} ETH</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por descripción o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="0">Creado</SelectItem>
                <SelectItem value="1">En Progreso</SelectItem>
                <SelectItem value="2">Completado</SelectItem>
                <SelectItem value="3">En Disputa</SelectItem>
                <SelectItem value="4">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {serviceTypes.map((type, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="client">Como Cliente</TabsTrigger>
              <TabsTrigger value="contractor">Como Contratista</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No se encontraron servicios</p>
                  <Button variant="outline">Crear Nuevo Servicio</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      serviceTypes={serviceTypes}
                      serviceIcons={serviceIcons}
                      onViewDetails={(id) => window.open(`/service/${id}`, "_blank")}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
