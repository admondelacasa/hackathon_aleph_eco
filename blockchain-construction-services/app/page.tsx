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
import { ServiceBrowser } from "@/components/service-browser"
import { ContractCard } from "@/components/contract-card"
import { ReputationBadge } from "@/components/reputation-badge"
import { UserRegistration, type UserProfile } from "@/components/user-registration"
import { UserProfileDisplay } from "@/components/user-profile-display"
import { toast } from "@/hooks/use-toast"
import { MetaMaskGuide } from "@/components/metamask-guide"

const serviceTypes = ["Jardinería", "Plomería", "Electricidad", "Construcción"]
const serviceIcons = [TreePine, Wrench, Zap, Hammer]

export default function ConstructionServicesApp() {
  const [activeTab, setActiveTab] = useState("browse")
  const [showProfessionals, setShowProfessionals] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [userServices, setUserServices] = useState<{ asClient: Service[]; asContractor: Service[] }>({
    asClient: [],
    asContractor: [],
  })
  const [activeContracts, setActiveContracts] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [pendingRewards, setPendingRewards] = useState("0")
  const [totalStaked, setTotalStaked] = useState("0")
  const [contractorReputation, setContractorReputation] = useState({
    totalReviews: 42,
    averageRating: 4.8,
    completedJobs: 45,
    totalEarnings: "12.5",
  })

  const { account, isConnected, isLoading: walletLoading, balance, connectWallet, disconnectWallet } = useBlockchain()

  const { createService, getUserServices, getAvailableServices, isLoading: servicesLoading, error: servicesError } = useConstructionServices()

  const { getPendingRewards, getTotalStaked, claimRewards, isLoading: stakingLoading } = useStaking()

  const { getContractorReputation, loading: feedbackLoading } = useFeedback()

  useEffect(() => {
    if (isConnected && account) {
      loadUserData()
      checkUserRegistration()
    } else {
      // Load demo services even when not connected
      loadDemoServices()
    }
  }, [isConnected, account])

  const checkUserRegistration = () => {
    if (account) {
      // Verificar si el usuario ya está registrado en localStorage
      const savedProfile = localStorage.getItem(`userProfile_${account}`)
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile))
        setShowRegistration(false)
      } else {
        setShowRegistration(true)
      }
    }
  }

  const handleUserRegistration = (userData: UserProfile) => {
    // Guardar el perfil en localStorage
    localStorage.setItem(`userProfile_${account}`, JSON.stringify(userData))
    setUserProfile(userData)
    setShowRegistration(false)
    
    toast({
      title: "Perfil Completado",
      description: `¡Bienvenido a BuildTrust, ${userData.username}!`,
    })
  }

  const handleEditProfile = () => {
    setShowRegistration(true)
  }

  const handleDisconnectWallet = async () => {
    await disconnectWallet()
    setUserProfile(null)
    setShowRegistration(false)
  }

  const loadDemoServices = async () => {
    try {
      const availableServices = await getAvailableServices()
      setServices(availableServices)
    } catch (error) {
      console.error("Error loading demo services:", error)
    }
  }

  const loadUserData = async () => {
    try {
      const userServicesData = await getUserServices()
      setUserServices(userServicesData)

      // Load available services for browsing
      const availableServices = await getAvailableServices()
      setServices(availableServices)

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
      if (!serviceData.confirmations?.clientConfirmed || !serviceData.confirmations?.contractorConfirmed) {
        toast({
          title: "Error",
          description: "Ambas partes deben confirmar antes de crear el contrato",
          variant: "destructive",
        })
        return
      }

      // Crear un nuevo contrato
      const newContract = {
        id: Date.now().toString(),
        title: serviceData.title,
        description: serviceData.description,
        serviceType: serviceData.serviceType,
        contractorUsername: serviceData.contractorUsername,
        walletVerified: serviceData.walletVerified,
        budget: serviceData.budget,
        location: serviceData.location,
        deadline: serviceData.deadline,
        milestones: serviceData.milestones,
        status: "En Curso",
        createdAt: new Date().toISOString(),
        clientConfirmed: true,
        contractorConfirmed: true,
      }

      setActiveContracts(prev => [...prev, newContract])

      toast({
        title: "Contrato Creado",
        description: `Contrato creado exitosamente con ${serviceData.contractorUsername}`,
      })

      setActiveTab("my-services")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el contrato",
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

  const handleUpdateMilestones = (contractId: string, milestones: string[]) => {
    setActiveContracts(prev => 
      prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, milestones }
          : contract
      )
    )
  }

  const handleFinalizeContract = (contractId: string) => {
    setActiveContracts(prev => 
      prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: "Completado" }
          : contract
      )
    )
    
    toast({
      title: "Contrato Finalizado",
      description: "El contrato se ha completado exitosamente",
    })
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
            ) : userProfile ? (
              <UserProfileDisplay
                userProfile={userProfile}
                walletAddress={account}
                balance={balance}
                onEditProfile={handleEditProfile}
                onDisconnectWallet={handleDisconnectWallet}
              />
            ) : (
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Coins className="h-4 w-4" />
                  <span>{Number.parseFloat(balance).toFixed(4)} ETH</span>
                </div>
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
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-16 max-w-xl mx-auto">
              Conectamos clientes y profesionales con la máxima seguridad y transparencia.
            </p>
            
            {/* ¿Por qué BuildTrust? */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                ¿Por qué BuildTrust?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pagos Seguros</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Fondos bloqueados hasta completar el trabajo
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Valoraciones Reales</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sistema de puntuación verificado y rastreable
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Búsqueda Avanzada</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Filtros por zona, precio y calificación
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Wallet className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Billetera Integrada</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Gestión de pagos con tecnología blockchain
                  </p>
                </div>
              </div>
            </div>

            {/* Cómo Funciona */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Cómo Funciona
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Busca y Contrata</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Encuentra el profesional perfecto usando nuestros filtros avanzados
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pago Seguro</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Los fondos se bloquean hasta que el trabajo esté completado
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Valora el Trabajo</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Califica la experiencia para ayudar a otros usuarios
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleConnectWallet} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Conectar Wallet para Comenzar
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Explorar profesionales</TabsTrigger>
              <TabsTrigger value="create">Crear contrato</TabsTrigger>
              <TabsTrigger value="my-services">Mis servicios</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <ServiceBrowser />
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <ServiceCreationForm onSubmit={handleCreateService} onCancel={() => setActiveTab("browse")} />
            </TabsContent>

            <TabsContent value="my-services" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Servicios</h2>
                <div className="flex space-x-2">
                  <Badge variant="outline">Contratos Activos: {activeContracts.length}</Badge>
                  <Badge variant="outline">Como Cliente: {userServices.asClient.length}</Badge>
                  <Badge variant="outline">Como Contratista: {userServices.asContractor.length}</Badge>
                </div>
              </div>

              <div className="space-y-6">
                {/* Contratos Activos */}
                {activeContracts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-600">Contratos en Curso</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {activeContracts.map((contract) => (
                        <ContractCard
                          key={contract.id}
                          contract={contract}
                          role="client"
                          onUpdateMilestones={handleUpdateMilestones}
                          onFinalizeContract={handleFinalizeContract}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Servicios Anteriores */}
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

                {activeContracts.length === 0 && userServices.asClient.length === 0 && userServices.asContractor.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500 mb-4">No tienes servicios o contratos activos</p>
                      <Button onClick={() => setActiveTab("create")}>Crear tu primer contrato</Button>
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

      {/* Modal de Registro de Usuario */}
      {showRegistration && isConnected && account && (
        <UserRegistration
          walletAddress={account}
          onSubmit={handleUserRegistration}
        />
      )}
    </div>
  )
}
