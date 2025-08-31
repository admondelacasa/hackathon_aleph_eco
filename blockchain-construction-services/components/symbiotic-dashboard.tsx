"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Coins, 
  Network,
  Lock,
  Unlock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  BarChart3,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Settings
} from "lucide-react"
import { useSymbioticVault } from "@/hooks/use-symbiotic-vault"

interface SymbioticDashboardProps {
  userAddress?: string
  onConnect?: () => void
}

export function SymbioticDashboard({ userAddress, onConnect }: SymbioticDashboardProps) {
  const {
    vaultData,
    tranches,
    stakerPosition,
    securityRequests,
    stakeInTranche,
    requestWithdrawal,
    claimRewards,
    provideSecurityToNetwork,
    isLoading,
    error,
    isConnected,
    refreshData,
    calculateExpectedRewards
  } = useSymbioticVault(userAddress)

  const [selectedTrancheId, setSelectedTrancheId] = useState<number>(0)
  const [stakeAmount, setStakeAmount] = useState("")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel <= 3) return "text-green-600 bg-green-100"
    if (riskLevel <= 6) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getRiskLabel = (riskLevel: number) => {
    if (riskLevel <= 3) return "Low Risk"
    if (riskLevel <= 6) return "Medium Risk"
    return "High Risk"
  }

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      return
    }

    const success = await stakeInTranche(selectedTrancheId, stakeAmount)
    if (success) {
      setStakeAmount("")
      await refreshData()
    }
  }

  const handleRequestWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      return
    }

    const success = await requestWithdrawal(withdrawalAmount)
    if (success) {
      setWithdrawalAmount("")
      await refreshData()
    }
  }

  const handleClaimRewards = async () => {
    const success = await claimRewards()
    if (success) {
      await refreshData()
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Card className="text-center py-12">
          <CardContent>
            <Shield className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold mb-4">Symbiotic Network Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to access the Symbiotic shared security protocol
            </p>
            <Button onClick={onConnect} className="bg-blue-600 hover:bg-blue-700">
              <Wallet className="h-4 w-4 mr-2" />
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🛡️ Symbiotic Network
          </h1>
          <p className="text-gray-600 mt-2">Shared Security Protocol Dashboard</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {vaultData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value Locked</p>
                  <p className="text-2xl font-bold text-green-600">${vaultData.totalValueLocked}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stakers</p>
                  <p className="text-2xl font-bold text-blue-600">{vaultData.totalStakers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average APY</p>
                  <p className="text-2xl font-bold text-purple-600">{vaultData.averageAPY}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rewards Distributed</p>
                  <p className="text-2xl font-bold text-orange-600">${vaultData.totalRewardsDistributed}</p>
                </div>
                <Coins className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="security">Security Market</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Position */}
            {stakerPosition && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5" />
                    <span>Your Position</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Staked</p>
                      <p className="text-xl font-bold text-blue-600">${stakerPosition.totalStaked}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Earned Rewards</p>
                      <p className="text-xl font-bold text-green-600">${stakerPosition.earnedRewards}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current APY</span>
                      <span className="text-sm font-medium">{stakerPosition.currentAPY}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Tranche</span>
                      <Badge className={getRiskColor(tranches[stakerPosition.activeTrancheId]?.riskLevel || 0)}>
                        {tranches[stakerPosition.activeTrancheId]?.name || 'N/A'}
                      </Badge>
                    </div>
                    {parseFloat(stakerPosition.pendingWithdrawal) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending Withdrawal</span>
                        <span className="text-sm font-medium text-orange-600">
                          ${stakerPosition.pendingWithdrawal}
                        </span>
                      </div>
                    )}
                  </div>

                  {parseFloat(stakerPosition.earnedRewards) > 0 && (
                    <Button onClick={handleClaimRewards} disabled={isLoading} className="w-full">
                      <Coins className="h-4 w-4 mr-2" />
                      Claim Rewards (${stakerPosition.earnedRewards})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tranches Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Risk Tranches</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tranches.map((tranche) => (
                  <div key={tranche.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{tranche.name}</h3>
                        <Badge className={getRiskColor(tranche.riskLevel)}>
                          {getRiskLabel(tranche.riskLevel)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{tranche.expectedYield / 100}% APY</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Utilization</span>
                        <span>{tranche.utilizationRate}%</span>
                      </div>
                      <Progress value={tranche.utilizationRate} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>${tranche.totalStaked} staked</span>
                        <span>${tranche.maxCapacity} capacity</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staking Tab */}
        <TabsContent value="staking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stake Tokens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpRight className="h-5 w-5" />
                  <span>Stake Tokens</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tranche-select">Select Tranche</Label>
                  <Select value={selectedTrancheId.toString()} onValueChange={(value) => setSelectedTrancheId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose risk tranche" />
                    </SelectTrigger>
                    <SelectContent>
                      {tranches.map((tranche) => (
                        <SelectItem key={tranche.id} value={tranche.id.toString()}>
                          {tranche.name} - {tranche.expectedYield / 100}% APY
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stake-amount">Amount to Stake</Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    placeholder="Enter amount..."
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>

                {stakeAmount && selectedTrancheId !== null && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Expected Annual Rewards</p>
                    <p className="text-lg font-bold text-blue-700">
                      ${calculateExpectedRewards(selectedTrancheId, stakeAmount, 365)} per year
                    </p>
                  </div>
                )}

                <Button onClick={handleStake} disabled={isLoading || !stakeAmount} className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Stake Tokens
                </Button>
              </CardContent>
            </Card>

            {/* Withdraw Tokens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowDownLeft className="h-5 w-5" />
                  <span>Withdraw Tokens</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stakerPosition && (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Available to Withdraw</span>
                        <span className="font-medium">${stakerPosition.totalStaked}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="withdrawal-amount">Amount to Withdraw</Label>
                      <Input
                        id="withdrawal-amount"
                        type="number"
                        placeholder="Enter amount..."
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        max={stakerPosition.totalStaked.replace(/,/g, '')}
                      />
                    </div>

                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Withdrawals have a 7-day delay period for security purposes.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleRequestWithdrawal} 
                      disabled={isLoading || !withdrawalAmount}
                      variant="outline"
                      className="w-full"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Request Withdrawal
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Market Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Marketplace</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{request.network}</h3>
                        <p className="text-sm text-gray-600">Security Amount: ${request.securityAmount}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={request.isFulfilled ? "default" : "secondary"}>
                          {request.isFulfilled ? "Active" : "Pending"}
                        </Badge>
                        {request.isFulfilled && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            +${request.estimatedRewards} rewards
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">{request.duration} days</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Premium Rate:</span>
                        <p className="font-medium">{request.premiumRate / 100}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Collateral Ratio:</span>
                        <p className="font-medium">{request.collateralRatio}%</p>
                      </div>
                    </div>
                  </div>
                ))}

                {securityRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Network className="h-12 w-12 mx-auto mb-2" />
                    <p>No active security requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Protocol Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Networks Secured</span>
                    <span className="font-medium">12</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Operators</span>
                    <span className="font-medium">47</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slashing Events</span>
                    <span className="font-medium text-red-600">0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-medium text-green-600">99.98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tranches.map((tranche) => (
                    <div key={tranche.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{tranche.name}</span>
                        <span className="text-sm text-gray-600">
                          ${tranche.totalStaked} ({tranche.utilizationRate}%)
                        </span>
                      </div>
                      <Progress value={tranche.utilizationRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
