import { Metadata } from "next"
import { SymbioticDashboard } from "@/components/symbiotic-dashboard"
import { LayerZeroDVNDashboard } from "@/components/layerzero-dvn-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Network, Zap, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Symbiotic Network - Shared Security Protocol | BuildTrust",
  description: "Access comprehensive shared security marketplace with Tranche-Based Yield Vault Architecture and LayerZero DVN integration",
  keywords: ["symbiotic", "shared security", "yield vault", "layerzero", "dvn", "cross-chain", "verifier network", "blockchain", "defi"],
}

export default function SymbioticNetworkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <Shield className="h-12 w-12" />
            <Network className="h-12 w-12" />
            <Zap className="h-12 w-12" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Symbiotic Network
          </h1>
          <p className="text-xl mb-2 opacity-90">
            Shared Security Protocol & Marketplace
          </p>
          <p className="text-lg opacity-75">
            Tranche-Based Yield Vault Architecture + LayerZero DVN Integration
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-2">Symbiotic Vault</h3>
              <p className="text-gray-600">
                Risk-segmented yield farming with Conservative (8%), Balanced (12%), and Aggressive (20%) APY tranches
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <Network className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-bold mb-2">LayerZero DVN</h3>
              <p className="text-gray-600">
                Decentralized Verifier Network for secure cross-chain message verification and communication
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">Security Marketplace</h3>
              <p className="text-gray-600">
                Comprehensive shared security marketplace for economic security provision and validation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="symbiotic" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="symbiotic" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Symbiotic Vault</span>
              </TabsTrigger>
              <TabsTrigger value="layerzero" className="flex items-center space-x-2">
                <Network className="h-4 w-4" />
                <span>LayerZero DVN</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="symbiotic" className="space-y-6">
            <SymbioticDashboard />
          </TabsContent>

          <TabsContent value="layerzero" className="space-y-6">
            <LayerZeroDVNDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
