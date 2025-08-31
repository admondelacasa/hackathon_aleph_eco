"use client"

import { useState, useEffect } from "react"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Hammer, Wrench, Zap, TreePine, Shield, Coins, CheckCircle, CheckCircle2, AlertCircle, Loader2, Search, Wallet, Building2, Paintbrush, Home, SprayCanIcon, Wind, Key, Construction, Square, Settings, Bug, Glasses, Brush, Users, Eye, Clock } from "lucide-react"
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

const serviceTypes = [
  "Gardening", "Plumbing", "Electrical", "Construction", 
  "Painting", "Carpentry", "Roofing", "Cleaning", 
  "HVAC", "Locksmith", "Masonry", "Flooring",
  "Appliance Repair", "Pest Control", "Welding", "Glazing"
]
const serviceIcons = [TreePine, Wrench, Zap, Hammer, Paintbrush, Construction, Home, Brush, Wind, Key, Construction, Square, Settings, Bug, Zap, Glasses]

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
      // Check if user is already registered in localStorage
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
    
    const isNewUser = !userProfile
    toast({
      title: isNewUser ? "Profile Completed" : "Profile Updated", 
      description: isNewUser 
        ? `Welcome to BuildTrust, ${userData.username}!`
        : `Your profile has been updated successfully.`,
    })
  }

  const handleEditProfile = () => {
    setShowRegistration(true)
  }

  const handleCancelEditProfile = () => {
    setShowRegistration(false)
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
        description: "The application must run in the browser",
        variant: "destructive",
      })
      return
    }

    if (!window.ethereum) {
      console.log("[v0] window.ethereum not found")
      toast({
        title: "MetaMask Not Detected",
        description: "Please install MetaMask from metamask.io to continue",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] MetaMask detected, attempting connection...")

    try {
      await connectWallet()
      console.log("[v0] Connection successful")
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully",
      })
    } catch (error: any) {
      console.log("[v0] Connection failed:", error)
      toast({
        title: "Connection Error",
        description: error.message || "Could not connect wallet",
        variant: "destructive",
      })
    }
  }

  const handleCreateService = async (serviceData: any) => {
    try {
      // Solo verificar que el cliente haya confirmado
      if (!serviceData.confirmations?.clientConfirmed) {
        toast({
          title: "Error",
          description: "You must confirm as client to create the contract",
          variant: "destructive",
        })
        return
      }

      // Create a new contract pending provider confirmation
      const newContract = {
        id: Date.now().toString(),
        title: serviceData.title,
        description: serviceData.description,
        serviceType: serviceData.serviceType,
        contractorUsername: serviceData.contractorUsername,
        contractorWalletAddress: serviceData.contractorWalletAddress,
        walletVerified: serviceData.walletVerified,
        budget: serviceData.budget,
        location: serviceData.location,
        deadline: serviceData.deadline,
        milestones: serviceData.milestones,
        status: "Pending Confirmation",
        createdAt: new Date().toISOString(),
        clientConfirmed: true,
        contractorConfirmed: false,
        confirmations: serviceData.confirmations
      }

      setActiveContracts(prev => [...prev, newContract])

      toast({
        title: "Contract Created",
        description: `Contract sent to ${serviceData.contractorUsername} for review and confirmation`,
      })

      setActiveTab("my-services")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not create contract",
        variant: "destructive",
      })
    }
  }

  const handleClaimRewards = async () => {
    try {
      await claimRewards()
      toast({
        title: "Rewards Claimed",
        description: "Your rewards have been transferred to your wallet",
      })
      await loadUserData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not claim rewards",
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
      title: "Contract Finalized",
      description: "The contract has been completed successfully",
    })
  }

  const getStatusBadge = (status: number) => {
    const statuses = [
      { label: "Created", variant: "secondary" as const },
      { label: "In Progress", variant: "default" as const },
      { label: "Completed", variant: "default" as const },
      { label: "In Dispute", variant: "destructive" as const },
      { label: "Cancelled", variant: "outline" as const },
    ]
    return statuses[status] || statuses[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image 
                src="/BuildTrust-logo-v4.png" 
                alt="BuildTrust Logo" 
                width={32} 
                height={32}
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-2xl font-bold text-white">BuildTrust</h1>
            </div>

            {!isConnected ? (
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => window.open('/user-registry', '_blank')}
                  variant="outline"
                  className="bg-green-600/20 text-white border-green-300/50 hover:bg-green-600/30 font-semibold"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Web3 Registry
                </Button>
                <Button
                  onClick={() => window.open('/symbiotic', '_blank')}
                  variant="outline"
                  className="bg-purple-600/20 text-white border-purple-300/50 hover:bg-purple-600/30 font-semibold"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Symbiotic Network
                </Button>
                <Button
                  onClick={() => window.open('/web3-test', '_blank')}
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Real Web3
                </Button>
                <Button
                  onClick={() => window.open('/web3-integration-demo', '_blank')}
                  variant="outline"
                  className="bg-blue-600 text-white border-blue-400 hover:bg-blue-700 font-semibold"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Demo Web3 Users
                </Button>
                <MetaMaskGuide />
                <Button
                  onClick={handleConnectWallet}
                  disabled={walletLoading}
                  className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
                >
                  {walletLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Wallet"
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
                <Button
                  onClick={() => window.open('/user-registry', '_blank')}
                  variant="outline"
                  size="sm"
                  className="bg-green-600/20 text-white border-green-300/50 hover:bg-green-600/30"
                >
                  <Key className="h-4 w-4 mr-1" />
                  Registry
                </Button>
                <Button
                  onClick={() => window.open('/web3-user-system', '_blank')}
                  variant="outline"
                  size="sm"
                  className="bg-emerald-600/20 text-white border-emerald-300/50 hover:bg-emerald-600/30"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Web3 System
                </Button>
                <Button
                  onClick={() => window.open('/symbiotic', '_blank')}
                  variant="outline"
                  size="sm"
                  className="bg-purple-600/20 text-white border-purple-300/50 hover:bg-purple-600/30"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Symbiotic
                </Button>
                <Button
                  onClick={() => window.open('/web3-test', '_blank')}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  <Wallet className="h-4 w-4 mr-1" />
                  Web3
                </Button>
                <Badge variant="outline" className="px-3 py-1">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Coins className="h-4 w-4" />
                  <span>{Number.parseFloat(balance).toFixed(2)} USDT</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="text-center py-16 px-4">
              <div className="mb-8">
                <Image 
                  src="/BuildTrust-logo-v4.png" 
                  alt="BuildTrust Logo" 
                  width={200} 
                  height={200}
                  className="h-40 w-40 object-contain mx-auto mb-6 drop-shadow-2xl"
                />
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    BuildTrust
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Latin America's most secure platform for hiring construction services
                </p>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Professionals</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="text-3xl font-bold text-red-600 mb-2">1.2M+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                </div>
              </div>

              {/* Main Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                {/* Seguridad Blockchain */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-3xl p-8 shadow-xl border border-orange-200 dark:border-orange-700/50 hover:transform hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blockchain Security</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Smart contracts that protect your money until the work is 100% completed.
                  </p>
                  <div className="flex items-center text-orange-600 font-semibold">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Protected funds
                  </div>
                </div>

                {/* Verified Professionals */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-3xl p-8 shadow-xl border border-red-200 dark:border-red-700/50 hover:transform hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Elite Professionals</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Verified contractors with real certifications and years of proven experience.
                  </p>
                  <div className="flex items-center text-red-600 font-semibold">
                    <Star className="h-5 w-5 mr-2" />
                    Average rating 4.8/5
                  </div>
                </div>

                {/* Transparencia Total */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-3xl p-8 shadow-xl border border-blue-200 dark:border-blue-700/50 hover:transform hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Total Transparency</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Real-time project tracking with verifiable milestones and direct communication.
                  </p>
                  <div className="flex items-center text-blue-600 font-semibold">
                    <Clock className="h-5 w-5 mr-2" />
                    Live updates
                  </div>
                </div>
              </div>

              {/* Services Grid */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
                  Most Requested Services
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
                  {[
                    { icon: "🏠", name: "Construction", count: "200+" },
                    { icon: "🔧", name: "Plumbing", count: "150+" },
                    { icon: "⚡", name: "Electrical", count: "180+" },
                    { icon: "🎨", name: "Painting", count: "120+" },
                    { icon: "🪟", name: "Windows", count: "90+" },
                    { icon: "🚿", name: "Bathrooms", count: "110+" },
                  ].map((service, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 text-center group">
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {service.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{service.name}</h4>
                      <p className="text-sm text-orange-600 font-medium">{service.count} professionals</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 max-w-4xl mx-auto text-white shadow-2xl mb-16">
                <div className="flex items-center justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-300 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl font-medium italic mb-6">
                  "BuildTrust revolutionized the way I hire services. The blockchain security gives me total peace of mind."
                </blockquote>
                <cite className="font-semibold">— Maria Gonzalez, Satisfied Client</cite>
              </div>

              {/* CTA Section */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Ready to get started?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of clients who already trust BuildTrust for their construction projects.
                </p>
                <Button 
                  onClick={handleConnectWallet} 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xl px-12 py-4 text-white font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-2xl"
                >
                  <Wallet className="h-6 w-6 mr-3" />
                  Connect Wallet and Start
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Connect your wallet in seconds and access the best construction platform
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Professionals</TabsTrigger>
              <TabsTrigger value="create">Create Contract</TabsTrigger>
              <TabsTrigger value="my-services">My Services</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <ServiceBrowser />
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <ServiceCreationForm onSubmit={handleCreateService} onCancel={() => setActiveTab("browse")} />
            </TabsContent>

            <TabsContent value="my-services" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Services</h2>
                <div className="flex space-x-2">
                  <Badge variant="outline">Active Contracts: {activeContracts.length}</Badge>
                  <Badge variant="outline">As Client: {userServices.asClient.length}</Badge>
                  <Badge variant="outline">As Contractor: {userServices.asContractor.length}</Badge>
                </div>
              </div>

              <div className="space-y-6">
                {/* Contratos Activos */}
                {activeContracts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-orange-600">Contracts in Progress</h3>
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

                {/* Previous Services */}
                {userServices.asClient.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">As Client</h3>
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
                    <h3 className="text-lg font-semibold mb-4">As Contractor</h3>
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
                      <p className="text-gray-500 mb-4">You don't have any active services or contracts</p>
                      <Button onClick={() => setActiveTab("create")}>Create your first contract</Button>
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
                      Contractor Profile
                      <ReputationBadge
                        averageRating={contractorReputation.averageRating}
                        totalReviews={contractorReputation.totalReviews}
                        completedJobs={contractorReputation.completedJobs}
                        size="sm"
                      />
                    </CardTitle>
                    <CardDescription>Complete your profile to receive more jobs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input placeholder="Your full name" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea placeholder="Describe your experience and specialties..." rows={3} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Specialties</label>
                      <div className="flex flex-wrap gap-2">
                        {serviceTypes.map((type, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full">Update Profile</Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => window.open(`/contractor/${account}/reviews`, "_blank")}
                    >
                      View My Reviews ({contractorReputation.totalReviews})
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
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
                      <span className="text-sm text-gray-600">Completed Jobs</span>
                      <span className="font-bold">{contractorReputation.completedJobs}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reviews</span>
                      <span className="font-bold text-orange-600">{contractorReputation.totalReviews}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Verified</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Staked</span>
                        <span className="font-bold">{Number.parseFloat(totalStaked).toFixed(2)} USDT</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pending Rewards</span>
                        <span className="font-bold text-green-600">
                          {Number.parseFloat(pendingRewards).toFixed(2)} USDT
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">Total Earnings</span>
                        <span className="font-bold text-purple-600">
                          {Number.parseFloat(contractorReputation.totalEarnings).toFixed(2)} USDT
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

      {/* User Registration Modal */}
      {showRegistration && isConnected && account && (
        <UserRegistration
          walletAddress={account}
          onSubmit={handleUserRegistration}
          existingProfile={userProfile}
          onCancel={userProfile ? handleCancelEditProfile : undefined}
        />
      )}
    </div>
  )
}
