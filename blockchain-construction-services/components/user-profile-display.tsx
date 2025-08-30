"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { User, Phone, CreditCard, Wallet, Settings, LogOut, ChevronDown } from "lucide-react"
import type { UserProfile } from "./user-registration"

interface UserProfileDisplayProps {
  userProfile: UserProfile
  walletAddress: string
  balance: string
  onEditProfile: () => void
  onDisconnectWallet: () => void
}

export function UserProfileDisplay({ 
  userProfile, 
  walletAddress, 
  balance, 
  onEditProfile, 
  onDisconnectWallet 
}: UserProfileDisplayProps) {
  const [showFullWallet, setShowFullWallet] = useState(false)

  const formatWalletAddress = (address: string) => {
    if (showFullWallet) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Balance Display */}
      <div className="hidden md:flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
        <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {parseFloat(balance).toFixed(4)} ETH
        </span>
      </div>

      {/* User Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">{userProfile.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatWalletAddress(walletAddress)}
                </p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80" align="end">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{userProfile.username}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Usuario Verificado
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                Activo
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <Wallet className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Wallet:</span>
                <button
                  onClick={() => setShowFullWallet(!showFullWallet)}
                  className="text-orange-600 hover:text-orange-700 hover:underline flex-1 text-left"
                >
                  {formatWalletAddress(walletAddress)}
                </button>
              </div>

              <div className="flex items-center space-x-2 p-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Teléfono:</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {userProfile.phoneNumber}
                </span>
              </div>

              <div className="flex items-center space-x-2 p-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Documento:</span>
                <span className="text-gray-800 dark:text-gray-200">
                  ***{userProfile.documentNumber.slice(-4)}
                </span>
              </div>

              <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-300">Balance:</span>
                <span className="font-semibold text-green-600">
                  {parseFloat(balance).toFixed(4)} ETH
                </span>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onEditProfile}>
            <Settings className="h-4 w-4 mr-2" />
            Editar Perfil
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={onDisconnectWallet}
            className="text-red-600 dark:text-red-400"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Desconectar Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
