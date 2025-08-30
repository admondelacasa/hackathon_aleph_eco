"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, DollarSign, Clock, CheckCircle, AlertTriangle, BarChart3, FileText, Calendar, User } from "lucide-react"
import { useConstructionServices, type Service } from "@/hooks/use-construction-services"
import { useBlockchain } from "@/hooks/use-blockchain"
import { ServiceCard } from "./service-card"
import { ContractView } from "./contract-view"

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
  const [pendingContracts, setPendingContracts] = useState<any[]>([])
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [showContractView, setShowContractView] = useState(false)
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

  const serviceTypes = [
    "Jardinería", "Plomería", "Electricidad", "Construcción", 
    "Pintura", "Carpintería", "Techos", "Limpieza", 
    "Climatización", "Cerrajería", "Albañilería", "Suelos",
    "Reparación electrodomésticos", "Control de plagas", "Soldadura", "Cristalería"
  ]
  const serviceIcons = [null, null, null, null] // Placeholder for icons

  useEffect(() => {
    if (isConnected && account) {
      loadServices()
      loadPendingContracts()
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

  // Simular contratos pendientes para prestadores de servicios
  const loadPendingContracts = async () => {
    try {
      // Simulamos algunos contratos pendientes para demostrar la funcionalidad
      const mockPendingContracts = [
        {
          id: "contract-001",
          title: "Instalación Sistema Eléctrico Residencial",
          description: "Necesito una instalación completa del sistema eléctrico para una casa de 150m². Incluye cableado interno, tablero principal, tomas de corriente, interruptores y conexión a medidor. La casa tiene 3 dormitorios, 2 baños, cocina, living-comedor y lavadero.",
          serviceType: "2", // Electricidad
          budget: "2.5",
          location: "Buenos Aires, Argentina",
          deadline: "2025-09-15",
          milestones: [
            "Revisión inicial y planificación del proyecto",
            "Instalación del tablero principal y conexiones",
            "Cableado interno de todas las habitaciones",
            "Instalación de tomas e interruptores",
            "Pruebas finales y certificación"
          ],
          clientUsername: "maria_garcia",
          contractorUsername: "carlos_electricista",
          confirmations: {
            clientConfirmed: true,
            contractorConfirmed: false
          },
          createdAt: "2025-08-25"
        },
        {
          id: "contract-002", 
          title: "Reparación Integral de Techo",
          description: "Mi casa tiene filtraciones en el techo tras las lluvias recientes. Necesito una reparación integral que incluya revisión de tejas, membranas, canaletas y posibles refuerzos estructurales. El área aproximada es de 80m².",
          serviceType: "6", // Techos
          budget: "1.8",
          location: "Córdoba, Argentina", 
          deadline: "2025-09-10",
          milestones: [
            "Inspección detallada del estado del techo",
            "Reparación de estructura si es necesario",
            "Reemplazo de tejas y membranas dañadas",
            "Limpieza y reparación de canaletas",
            "Prueba de impermeabilización final"
          ],
          clientUsername: "juan_lopez",
          contractorUsername: "roberto_techista",
          confirmations: {
            clientConfirmed: true,
            contractorConfirmed: false
          },
          createdAt: "2025-08-28"
        }
      ]
      
      // Filtrar solo contratos donde el usuario actual es el contratista
      // y aún no ha confirmado
      const userContracts = mockPendingContracts.filter(contract => 
        contract.contractorUsername.toLowerCase().includes("carlos") || 
        contract.contractorUsername.toLowerCase().includes("roberto")
      )
      
      setPendingContracts(userContracts)
    } catch (error) {
      console.error("Error loading pending contracts:", error)
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

  const handleContractorConfirm = (contractId: string) => {
    setPendingContracts(prev => 
      prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, confirmations: { ...contract.confirmations, contractorConfirmed: true }}
          : contract
      )
    )
    setShowContractView(false)
    setSelectedContract(null)
    alert("¡Contrato confirmado exitosamente!")
  }

  const viewContractDetails = (contract: any) => {
    setSelectedContract(contract)
    setShowContractView(true)
  }

  if (showContractView && selectedContract) {
    return (
      <ContractView
        contractData={selectedContract}
        userRole="contractor"
        onContractorConfirm={() => handleContractorConfirm(selectedContract.id)}
        onBack={() => {
          setShowContractView(false)
          setSelectedContract(null)
        }}
      />
    )
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="client">Como Cliente</TabsTrigger>
              <TabsTrigger value="contractor">Como Contratista</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Contratos Pendientes
                {pendingContracts.filter(c => !c.confirmations.contractorConfirmed).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingContracts.filter(c => !c.confirmations.contractorConfirmed).length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingContracts.filter(c => !c.confirmations.contractorConfirmed).length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No tienes contratos pendientes de confirmación</p>
                  <p className="text-sm text-gray-400">
                    Cuando los clientes creen contratos contigo, aparecerán aquí para tu revisión y confirmación.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingContracts
                    .filter(contract => !contract.confirmations.contractorConfirmed)
                    .map((contract) => (
                      <Card key={contract.id} className="p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                Pendiente de Confirmación
                              </Badge>
                              <Badge variant="secondary">
                                ID: {contract.id}
                              </Badge>
                            </div>
                            
                            <h3 className="text-lg font-semibold mb-2">{contract.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {contract.description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium">{contract.budget} ETH</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span>{contract.deadline}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <User className="h-4 w-4 text-purple-600" />
                                <span>Cliente: {contract.clientUsername}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-6">
                            <Button 
                              onClick={() => viewContractDetails(contract)}
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                            >
                              Revisar y Confirmar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value={activeTab} className="mt-6">
              {activeTab !== "pending" && (
                <>
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
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
