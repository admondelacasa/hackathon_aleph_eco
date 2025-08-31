"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Network, 
  Shield, 
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  TrendingUp,
  Send,
  RefreshCw,
  Award,
  Target,
  Link
} from "lucide-react"
import { useLayerZeroDVN } from "@/hooks/use-layerzero-dvn"

interface LayerZeroDVNDashboardProps {
  userAddress?: string
  onConnect?: () => void
}

export function LayerZeroDVNDashboard({ userAddress, onConnect }: LayerZeroDVNDashboardProps) {
  const {
    dvnStats,
    verifierInfo,
    messageVerifications,
    crossChainMessages,
    registerAsVerifier,
    verifyMessage,
    challengeVerification,
    claimVerifierRewards,
    sendCrossChainMessage,
    isLoading,
    error,
    isRegisteredVerifier,
    refreshData,
    getNetworkInfo
  } = useLayerZeroDVN(userAddress)

  const [activeTab, setActiveTab] = useState("overview")
  const [newMessagePayload, setNewMessagePayload] = useState("")
  const [selectedDestChain, setSelectedDestChain] = useState<string>("")
  const [verificationProof, setVerificationProof] = useState("")
  const [selectedMessageHash, setSelectedMessageHash] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return "text-green-600 bg-green-100"
      case 'pending': return "text-yellow-600 bg-yellow-100"
      case 'challenged': return "text-red-600 bg-red-100"
      case 'verifying': return "text-blue-600 bg-blue-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'challenged': return <AlertTriangle className="h-4 w-4" />
      case 'verifying': return <Activity className="h-4 w-4 animate-pulse" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const handleRegisterVerifier = async () => {
    const success = await registerAsVerifier()
    if (success) {
      await refreshData()
    }
  }

  const handleVerifyMessage = async () => {
    if (!selectedMessageHash || !verificationProof) return
    
    const success = await verifyMessage(selectedMessageHash, verificationProof)
    if (success) {
      setSelectedMessageHash("")
      setVerificationProof("")
      await refreshData()
    }
  }

  const handleSendCrossChainMessage = async () => {
    if (!newMessagePayload || !selectedDestChain) return
    
    const messageHash = await sendCrossChainMessage(parseInt(selectedDestChain), newMessagePayload)
    if (messageHash) {
      setNewMessagePayload("")
      setSelectedDestChain("")
      await refreshData()
    }
  }

  const handleClaimRewards = async () => {
    const success = await claimVerifierRewards()
    if (success) {
      await refreshData()
    }
  }

  if (!userAddress) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Card className="text-center py-12">
          <CardContent>
            <Network className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold mb-4">LayerZero DVN Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to access the Decentralized Verifier Network
            </p>
            <Button onClick={onConnect} className="bg-blue-600 hover:bg-blue-700">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            ⚡ LayerZero DVN
          </h1>
          <p className="text-gray-600 mt-2">Decentralized Verifier Network Dashboard</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {!isRegisteredVerifier && (
            <Button onClick={handleRegisterVerifier} disabled={isLoading}>
              <Shield className="h-4 w-4 mr-2" />
              Register as Verifier
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* DVN Stats */}
      {dvnStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Verifiers</p>
                  <p className="text-2xl font-bold text-blue-600">{dvnStats.totalVerifiers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Verifications</p>
                  <p className="text-2xl font-bold text-green-600">{dvnStats.totalVerifications.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{dvnStats.successRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verifier">Verifier</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="crosschain">Cross-Chain</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verifier Status */}
            {verifierInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Verifier Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={verifierInfo.isActive ? "default" : "secondary"}>
                      {verifierInfo.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Staked Amount</p>
                      <p className="text-lg font-bold text-blue-600">${verifierInfo.stakedAmount}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Current Rewards</p>
                      <p className="text-lg font-bold text-green-600">${verifierInfo.currentRewards}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Verifications</span>
                      <span className="text-sm font-medium">{verifierInfo.verificationCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium">
                        {verifierInfo.verificationCount > 0 
                          ? Math.round((verifierInfo.successfulVerifications / verifierInfo.verificationCount) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reputation Score</span>
                      <span className="text-sm font-medium">{verifierInfo.reputationScore}/100</span>
                    </div>
                  </div>

                  {parseFloat(verifierInfo.currentRewards) > 0 && (
                    <Button onClick={handleClaimRewards} disabled={isLoading} className="w-full">
                      <Award className="h-4 w-4 mr-2" />
                      Claim Rewards (${verifierInfo.currentRewards})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Verifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Verifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messageVerifications.slice(0, 5).map((verification) => (
                    <div key={verification.messageHash} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">
                            {getNetworkInfo(verification.srcChainId).icon} → {getNetworkInfo(verification.dstChainId).icon}
                          </span>
                          <Badge className={getStatusColor(verification.status)}>
                            {getStatusIcon(verification.status)}
                            {verification.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {verification.messageHash.slice(0, 10)}...{verification.messageHash.slice(-8)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">+${verification.reward}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(verification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {messageVerifications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="h-12 w-12 mx-auto mb-2" />
                      <p>No verifications yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Verifier Tab */}
        <TabsContent value="verifier" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verify Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Verify Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message-hash">Message Hash</Label>
                  <Input
                    id="message-hash"
                    placeholder="0x..."
                    value={selectedMessageHash}
                    onChange={(e) => setSelectedMessageHash(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof">Verification Proof</Label>
                  <Textarea
                    id="proof"
                    placeholder="Enter verification proof..."
                    value={verificationProof}
                    onChange={(e) => setVerificationProof(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleVerifyMessage} 
                  disabled={isLoading || !selectedMessageHash || !verificationProof || !isRegisteredVerifier}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Verify Message
                </Button>

                {!isRegisteredVerifier && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You must register as a verifier first to verify messages.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Verifier Performance */}
            {verifierInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Success Rate</span>
                        <span>{Math.round((verifierInfo.successfulVerifications / Math.max(verifierInfo.verificationCount, 1)) * 100)}%</span>
                      </div>
                      <Progress 
                        value={Math.round((verifierInfo.successfulVerifications / Math.max(verifierInfo.verificationCount, 1)) * 100)} 
                        className="h-2" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Reputation Score</span>
                        <span>{verifierInfo.reputationScore}/100</span>
                      </div>
                      <Progress value={verifierInfo.reputationScore} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{verifierInfo.successfulVerifications}</p>
                      <p className="text-xs text-gray-600">Successful</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{verifierInfo.slashingCount}</p>
                      <p className="text-xs text-gray-600">Slashed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Message Verifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messageVerifications.map((verification) => (
                  <div key={verification.messageHash} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">
                          {verification.messageHash.slice(0, 12)}...{verification.messageHash.slice(-8)}
                        </span>
                        <Badge className={getStatusColor(verification.status)}>
                          {getStatusIcon(verification.status)}
                          {verification.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">+${verification.reward}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(verification.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Source:</span>
                        <p className="font-medium">
                          {getNetworkInfo(verification.srcChainId).icon} {verification.srcNetwork}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Destination:</span>
                        <p className="font-medium">
                          {getNetworkInfo(verification.dstChainId).icon} {verification.dstNetwork}
                        </p>
                      </div>
                    </div>

                    {verification.isChallenged && (
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This verification has been challenged and is under review.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}

                {messageVerifications.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-16 w-16 mx-auto mb-4" />
                    <p>No message verifications found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cross-Chain Tab */}
        <TabsContent value="crosschain" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Cross-Chain Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Send Cross-Chain Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dest-chain">Destination Chain</Label>
                  <Select value={selectedDestChain} onValueChange={setSelectedDestChain}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination chain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="137">🟣 Polygon</SelectItem>
                      <SelectItem value="42161">🔵 Arbitrum</SelectItem>
                      <SelectItem value="10">🔴 Optimism</SelectItem>
                      <SelectItem value="56">🟡 BSC</SelectItem>
                      <SelectItem value="43114">⚪ Avalanche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payload">Message Payload</Label>
                  <Textarea
                    id="payload"
                    placeholder="Enter your cross-chain message..."
                    value={newMessagePayload}
                    onChange={(e) => setNewMessagePayload(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSendCrossChainMessage} 
                  disabled={isLoading || !newMessagePayload || !selectedDestChain}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Cross-Chain Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Link className="h-5 w-5" />
                  <span>Recent Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crossChainMessages.slice(0, 4).map((message) => (
                    <div key={message.hash} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {message.srcChain} → {message.dstChain}
                          </span>
                          <Badge className={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{message.payload}</p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{message.hash.slice(0, 10)}...{message.hash.slice(-6)}</span>
                        <span>{message.verificationCount}/{message.requiredVerifications} verified</span>
                      </div>
                      
                      <Progress 
                        value={(message.verificationCount / message.requiredVerifications) * 100} 
                        className="h-1 mt-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {dvnStats && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Rewards Distributed</span>
                      <span className="font-medium">${dvnStats.totalRewardsDistributed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Verification Time</span>
                      <span className="font-medium">{dvnStats.averageVerificationTime}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Networks</span>
                      <span className="font-medium">{dvnStats.activeNetworks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">{dvnStats.successRate}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Networks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <span>🔷</span>
                    <span className="text-sm">Ethereum</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <span>🟣</span>
                    <span className="text-sm">Polygon</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <span>🔵</span>
                    <span className="text-sm">Arbitrum</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <span>🔴</span>
                    <span className="text-sm">Optimism</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <span>🟡</span>
                    <span className="text-sm">BSC</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <span>⚪</span>
                    <span className="text-sm">Avalanche</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
