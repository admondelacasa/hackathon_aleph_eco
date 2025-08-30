"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowLeft, Clock, CheckCircle, AlertTriangle, User, MessageSquare, Calendar } from "lucide-react"
import { MilestoneTracker } from "@/components/milestone-tracker"
import { ContractorProfile } from "@/components/contractor-profile"
import { ReviewSystem } from "@/components/review-system"
import { toast } from "@/hooks/use-toast"
import { Service, Milestone } from "@/hooks/use-construction-services"
import { useBlockchain } from "@/hooks/use-blockchain"
import { useConstructionServices } from "@/hooks/use-construction-services"

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = Number.parseInt(params.id as string)

  const [service, setService] = useState<Service | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const { account, isConnected } = useBlockchain()
  const {
    getService,
    getServiceMilestones,
    completeMilestone,
    approveMilestone,
    raiseDispute,
    isLoading: contractLoading,
  } = useConstructionServices()

  useEffect(() => {
    if (isConnected && serviceId) {
      loadServiceData()
    }
  }, [isConnected, serviceId])

  const loadServiceData = async () => {
    try {
      setLoading(true)
      const [serviceData, milestonesData] = await Promise.all([getService(serviceId), getServiceMilestones(serviceId)])

      setService(serviceData)
      setMilestones(milestonesData)
    } catch (error) {
      console.error("Error loading service data:", error)
      toast({
        title: "Error",
        description: "Could not load service information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteMilestone = async (milestoneIndex: number) => {
    try {
      await completeMilestone(serviceId, milestoneIndex)
      toast({
        title: "Milestone Completed",
        description: "The milestone has been marked as completed",
      })
      await loadServiceData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not complete the milestone",
        variant: "destructive",
      })
    }
  }

  const handleApproveMilestone = async (milestoneIndex: number) => {
    try {
      await approveMilestone(serviceId, milestoneIndex)
      toast({
        title: "Milestone Approved",
        description: "Payment has been released to the contractor",
      })
      await loadServiceData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not approve the milestone",
        variant: "destructive",
      })
    }
  }

  const handleRaiseDispute = async () => {
    try {
      await raiseDispute(serviceId)
      toast({
        title: "Dispute Started",
        description: "The dispute has been registered in the system",
      })
      await loadServiceData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not start the dispute",
        variant: "destructive",
      })
    }
  }

  const getStatusInfo = (status: number) => {
    const statuses = [
      { label: "Created", color: "bg-gray-100 text-gray-800", icon: Clock },
      { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Clock },
      { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
      { label: "In Dispute", color: "bg-red-100 text-red-800", icon: AlertTriangle },
      { label: "Cancelled", color: "bg-gray-100 text-gray-600", icon: Clock },
    ]
    return statuses[status] || statuses[0]
  }

  const getUserRole = (): "client" | "contractor" | "viewer" => {
    if (!service || !account) return "viewer"
    if (service.client.toLowerCase() === account.toLowerCase()) return "client"
    if (service.contractor.toLowerCase() === account.toLowerCase()) return "contractor"
    return "viewer"
  }

  const serviceTypes = ["Gardening", "Plumbing", "Electrical", "Construction"]

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Connect your wallet to view service details</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading service...</span>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Service not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(service.status)
  const StatusIcon = statusInfo.icon
  const userRole = getUserRole()
  const progress = service.milestones > 0 ? (service.completedMilestones / service.milestones) * 100 : 0

  // Mock contractor data
  const contractorData = {
    address: service.contractor,
    name: "Juan Pérez",
    description: "Contractor specialized in construction and electrical work with over 10 years of experience.",
    skills: ["Construction", "Electrical", "Plumbing"],
    totalJobs: 45,
    completedJobs: 43,
    rating: 4.8,
    reviewCount: 38,
    isVerified: true,
    joinedDate: "2022",
    location: "Mexico City",
    specialties: ["Electrical installations", "Residential construction"],
    certifications: ["Certified Electrician", "Safe Construction"],
  }

  // Mock reviews data
  const mockReviews = [
    {
      id: 1,
      reviewer: service.client,
      reviewerName: "María González",
      rating: 5,
      comment: "Excellent work, very professional and punctual. Highly recommended.",
      timestamp: "2 weeks ago",
      isClient: true,
      helpful: 3,
      serviceType: "Electrical",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-5 w-5" />
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            <span className="text-gray-500">Service #{service.id}</span>
          </div>
        </div>

        {/* Service Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{service.description}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{serviceTypes[service.serviceType]}</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created: {new Date(service.createdAt * 1000).toLocaleDateString()}
                  </div>
                  {service.deadline > 0 && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Deadline: {new Date(service.deadline * 1000).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{service.totalAmount} ETH</div>
                <div className="text-sm text-gray-600">Released: {service.releasedAmount} ETH</div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Project Progress</span>
                  <span>
                    {service.completedMilestones}/{service.milestones} milestones completed
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Client:</span>
                    <span className="ml-2 font-medium">{service.client.slice(0, 10)}...</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Contractor:</span>
                    <span className="ml-2 font-medium">{service.contractor.slice(0, 10)}...</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {userRole !== "viewer" && (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </Button>
                      {service.status === 1 && (
                        <Button variant="destructive" size="sm" onClick={handleRaiseDispute} disabled={contractLoading}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Dispute
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="contractor">Contractor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Service Type</h4>
                      <Badge variant="outline">{serviceTypes[service.serviceType]}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Creation Date</h4>
                      <p className="text-gray-600">{new Date(service.createdAt * 1000).toLocaleDateString()}</p>
                    </div>
                    {service.deadline > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Deadline</h4>
                        <p className="text-gray-600">{new Date(service.deadline * 1000).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-bold">{service.totalAmount} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Released:</span>
                      <span className="font-bold text-green-600">{service.releasedAmount} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-bold text-orange-600">
                        {(Number.parseFloat(service.totalAmount) - Number.parseFloat(service.releasedAmount)).toFixed(
                          4,
                        )}{" "}
                        ETH
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Milestone Distribution</div>
                    <div className="space-y-2">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>Milestone {index + 1}:</span>
                          <span className={milestone.approved ? "text-green-600" : "text-gray-600"}>
                            {milestone.amount} ETH
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            <MilestoneTracker
              milestones={milestones.map((m, index) => ({
                id: index,
                title: `Milestone ${index + 1}`,
                description: m.description,
                amount: m.amount,
                status: m.approved ? "approved" : m.completed ? "completed" : "pending",
                completedAt: m.completedAt > 0 ? new Date(m.completedAt * 1000).toLocaleDateString() : undefined,
              }))}
              totalAmount={service.totalAmount}
              releasedAmount={service.releasedAmount}
              userRole={userRole}
              onCompleteMilestone={handleCompleteMilestone}
              onApproveMilestone={handleApproveMilestone}
            />
          </TabsContent>

          <TabsContent value="contractor">
            <ContractorProfile
              contractor={contractorData}
              showActions={userRole === "client"}
              onHire={() => console.log("Hire contractor")}
              onMessage={() => console.log("Message contractor")}
            />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewSystem
              reviews={mockReviews}
              canReview={userRole === "client" && service.status === 2}
              averageRating={4.8}
              totalReviews={1}
              onSubmitReview={(rating: number, comment: string) => {
                console.log("Submit review:", rating, comment)
                toast({
                  title: "Review Submitted",
                  description: "Your review has been published successfully",
                })
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
