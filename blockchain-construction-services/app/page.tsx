"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Hammer, Wrench, Zap, TreePine, Shield, Coins, CheckCircle, AlertCircle, Loader2, Search, Wallet } from "lucide-react"
import { useBlockchain } from "@/hooks/use-blockchain"
import { useConstructionServices, type Service } from "@/hooks/use-construction-services"
import { useStaking } from "@/hooks/use-staking"
import { useFeedback } from "@/hooks/use-feedback"
import { ServiceCard } from "@/components/service-card"
import { ServiceCreationForm } from "@/components/service-creation-form"
import { ReputationBadge } from "@/components/reputation-badge"
import { toast } from "@/hooks/use-toast"
import { MetaMaskGuide } from "@/components/metamask-guide"

const serviceTypes = ["Jardinería", "Plomería", "Electricidad", "Construcción"]
const serviceIcons = [TreePine, Wrench, Zap, Hammer]

export default function ConstructionServicesApp() {
  const [activeTab, setActiveTab] = useState("browse")
  const [services, setServices] = useState<Service[]>([])
  const [userServices, setUserServices] = useState<{ asClient: Service[]; asContractor: Service[] }>({
    asClient: [],
    asContractor: [],
  })
  const [pendingRewards, setPendingRewards] = useState("0")
  const [totalStaked, setTotalStaked] = useState("0")
  const [contractorReputation, setContractorReputation] = useState({
    totalReviews: 42,
    averageRating: 4.8,
    completedJobs: 45,
    totalEarnings: "12.5",
  })

  const { account, isConnected, isLoading: walletLoading, balance, connectWallet, disconnectWallet } = useBlockchain()

  const { createService, getUserServices, isLoading: servicesLoading, error: servicesError } = useConstructionServices()

  const { getPendingRewards, getTotalStaked, claimRewards, isLoading: stakingLoading } = useStaking()

  const { getContractorReputation, loading: feedbackLoading } = useFeedback()

  useEffect(() => {
    if (isConnected && account) {
      loadUserData()
    }
  }, [isConnected, account])

  const loadUserData = async () => {
    try {
      const userServicesData = await getUserServices()
      setUserServices(userServicesData)

      const rewards = await getPendingRewards()
      setPendingRewards(rewards)

      const staked = await getTotalStaked()
      setTotalStaked(staked)

      if (account) {
        try {
          const reputation = await getContractorReputation(account)
          setContractorReputation(reputation)
        } catch (error) {
          console.error("Error loading reputation:", error)
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleConnectWallet = async () => {
    console.log("[v0] Connect wallet button clicked")

    if (typeof window === "undefined") {
      console.log("[v0] Window is undefined - running on server")
      toast({
        title: "Error",
        description: "La aplicación debe ejecutarse en el navegador",
        variant: "destructive",
      })
      return
    }

    if (!window.ethereum) {
      console.log("[v0] window.ethereum not found")
      toast({
        title: "MetaMask No Detectado",
        description: "Por favor instala MetaMask desde metamask.io para continuar",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] MetaMask detected, attempting connection...")

    try {
      await connectWallet()
      console.log("[v0] Connection successful")
      toast({
        title: "Wallet Conectada",
        description: "Tu wallet se ha conectado exitosamente",
      })
    } catch (error: any) {
      console.log("[v0] Connection failed:", error)
      toast({
        title: "Error de Conexión",
        description: error.message || "No se pudo conectar la wallet",
        variant: "destructive",
      })
    }
  }

  const handleCreateService = async (serviceData: any) => {
    try {
      const deadline = Math.floor(new Date(serviceData.deadline).getTime() / 1000)

      const result = await createService(
        "0x0000000000000000000000000000000000000000", // Placeholder contractor address
        serviceData.description,
        deadline,
        "CONSTRUCTION", // Default service type
        serviceData.milestones,
        serviceData.budget,
      )

      toast({
        title: "Servicio Creado",
        description: `Servicio creado exitosamente. ID: ${result.serviceId}`,
      })

      await loadUserData()
      setActiveTab("my-services")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el servicio",
        variant: "destructive",
      })
    }
  }

  const handleClaimRewards = async () => {
    try {
      await claimRewards()
      toast({
        title: "Recompensas Reclamadas",
        description: "Tus recompensas han sido transferidas a tu wallet",
      })
      await loadUserData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron reclamar las recompensas",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: number) => {
    const statuses = [
      { label: "Creado", variant: "secondary" as const },
      { label: "En Progreso", variant: "default" as const },
      { label: "Completado", variant: "default" as const },
      { label: "En Disputa", variant: "destructive" as const },
      { label: "Cancelado", variant: "outline" as const },
    ]
    return statuses[status] || statuses[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BuildTrust</h1>
            </div>

            {!isConnected ? (
              <div className="flex items-center space-x-3">
                <MetaMaskGuide />
                <Button
                  onClick={handleConnectWallet}
                  disabled={walletLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {walletLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    "Conectar Wallet"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Coins className="h-4 w-4" />
                  <span>{Number.parseFloat(balance).toFixed(4)} ETH</span>
                </div>
                {Number.parseFloat(pendingRewards) > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClaimRewards}
                    disabled={stakingLoading}
                    className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                  >
                    {stakingLoading ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Star className="h-3 w-3 mr-1" />
                    )}
                    {Number.parseFloat(pendingRewards).toFixed(4)} ETH
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Desconectar
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <Shield className="h-20 w-20 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Bienvenido a BuildTrust</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              La plataforma blockchain descentralizada para servicios de construcción. Conectamos clientes y profesionales 
              con la máxima seguridad y transparencia.
            </p>
            
            {/* Características Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
              <Card className="border-blue-200 hover:border-blue-300 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-blue-700">Pagos Seguros</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Tus fondos están protegidos por contratos inteligentes que garantizan que el dinero solo se libera 
                    cuando el trabajo está completado. No más estafas ni pagos perdidos. Cada transacción queda registrada 
                    de manera inmutable en la blockchain, brindándote total tranquilidad y control sobre tus pagos.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 hover:border-green-300 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-green-700">Valoraciones Reales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Cada reseña y calificación está registrada en blockchain, lo que hace imposible manipular o falsificar 
                    las opiniones. Conoce la reputación real de cada profesional basada en experiencias auténticas de otros 
                    usuarios. Toma decisiones informadas y contrata con confianza sabiendo que las valoraciones son 100% genuinas.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 hover:border-purple-300 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-purple-700">Búsqueda Avanzada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Encuentra exactamente lo que necesitas con nuestro sistema de búsqueda inteligente. Filtra por ubicación, 
                    especialidad, calificaciones, precio y disponibilidad. Nuestro algoritmo te conecta con los profesionales 
                    más adecuados para tu proyecto, ahorrándote tiempo y garantizando que encuentres la calidad que buscas.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 hover:border-orange-300 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl text-orange-700">Billetera Integrada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Gestiona todos tus pagos desde una interfaz simple y segura. Tu billetera MetaMask se integra perfectamente 
                    con BuildTrust, permitiéndote pagar, recibir fondos y hacer staking de manera intuitiva. No necesitas ser 
                    un experto en blockchain para usar nuestra plataforma de forma segura y eficiente.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Llamada a la Acción Reforzada */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Únete a la Revolución de la Construcción Digital
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Miles de profesionales y clientes ya confían en BuildTrust para realizar sus proyectos de construcción 
                de manera segura y transparente.
              </p>
              <Button onClick={handleConnectWallet} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                Conectar Wallet y Comenzar Ahora
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="browse">Explorar Servicios</TabsTrigger>
              <TabsTrigger value="create">Crear Servicio</TabsTrigger>
              <TabsTrigger value="my-services">Mis Servicios</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Servicios Disponibles</h2>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los servicios</SelectItem>
                    {serviceTypes.map((type, index) => (
                      <SelectItem key={index} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {servicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Cargando servicios...</span>
                </div>
              ) : servicesError ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">{servicesError}</p>
                  </CardContent>
                </Card>
              ) : services.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">No hay servicios disponibles en este momento</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      serviceTypes={serviceTypes}
                      serviceIcons={serviceIcons}
                      onViewDetails={(id) => console.log("View details:", id)}
                      showApplyButton={true}
                      onApply={(id) => console.log("Apply to:", id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <ServiceCreationForm onSubmit={handleCreateService} onCancel={() => setActiveTab("browse")} />
            </TabsContent>

            <TabsContent value="my-services" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Servicios</h2>
                <div className="flex space-x-2">
                  <Badge variant="outline">Como Cliente: {userServices.asClient.length}</Badge>
                  <Badge variant="outline">Como Contratista: {userServices.asContractor.length}</Badge>
                </div>
              </div>

              <div className="space-y-6">
                {userServices.asClient.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Como Cliente</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {userServices.asClient.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          serviceTypes={serviceTypes}
                          serviceIcons={serviceIcons}
                          onViewDetails={(id) => console.log("View details:", id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {userServices.asContractor.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Como Contratista</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {userServices.asContractor.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          serviceTypes={serviceTypes}
                          serviceIcons={serviceIcons}
                          onViewDetails={(id) => console.log("View details:", id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {userServices.asClient.length === 0 && userServices.asContractor.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500 mb-4">No tienes servicios activos</p>
                      <Button onClick={() => setActiveTab("create")}>Crear tu primer servicio</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Perfil de Contratista
                      <ReputationBadge
                        averageRating={contractorReputation.averageRating}
                        totalReviews={contractorReputation.totalReviews}
                        completedJobs={contractorReputation.completedJobs}
                        size="sm"
                      />
                    </CardTitle>
                    <CardDescription>Completa tu perfil para recibir más trabajos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre</label>
                      <Input placeholder="Tu nombre completo" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descripción</label>
                      <Textarea placeholder="Describe tu experiencia y especialidades..." rows={3} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Especialidades</label>
                      <div className="flex flex-wrap gap-2">
                        {serviceTypes.map((type, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full">Actualizar Perfil</Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => window.open(`/contractor/${account}/reviews`, "_blank")}
                    >
                      Ver Mis Reseñas ({contractorReputation.totalReviews})
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Calificación</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(contractorReputation.averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium ml-1">{contractorReputation.averageRating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Trabajos Completados</span>
                      <span className="font-bold">{contractorReputation.completedJobs}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reseñas</span>
                      <span className="font-bold text-blue-600">{contractorReputation.totalReviews}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tasa de Éxito</span>
                      <span className="font-bold text-green-600">
                        {contractorReputation.completedJobs > 0
                          ? Math.round(
                              (contractorReputation.completedJobs / (contractorReputation.completedJobs + 2)) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Verificado</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Staked</span>
                        <span className="font-bold">{Number.parseFloat(totalStaked).toFixed(4)} ETH</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Recompensas Pendientes</span>
                        <span className="font-bold text-green-600">
                          {Number.parseFloat(pendingRewards).toFixed(6)} ETH
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">Ganancias Totales</span>
                        <span className="font-bold text-purple-600">
                          {Number.parseFloat(contractorReputation.totalEarnings).toFixed(4)} ETH
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
