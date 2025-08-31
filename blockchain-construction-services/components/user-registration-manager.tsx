"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Wallet, 
  User, 
  Shield, 
  Key, 
  CheckCircle, 
  XCircle, 
  Loader2,
  UserPlus,
  Search,
  Copy,
  Check,
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react"
import { useBlockchain } from '@/hooks/use-blockchain'
import { useUserRegistrySimple, RegisteredUser } from '@/hooks/use-user-registry-simple'
import { useToast } from "@/hooks/use-toast"

export default function UserRegistrationManager() {
  // Blockchain hooks
  const { isConnected, account, connectWallet } = useBlockchain()
  const { 
    registerUser, 
    getUserProfile, 
    getUserProfileByUsername, 
    isCurrentUserRegistered,
    getAllRegisteredUsers,
    getPublicKeyFromWallet,
    isLoading,
    error,
    registeredUsers
  } = useUserRegistrySimple()
  
  const { toast } = useToast()
  
  // Registration form state
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isCurrentUserReg, setIsCurrentUserReg] = useState(false)
  
  // User lookup state
  const [searchUsername, setSearchUsername] = useState('')
  const [foundUser, setFoundUser] = useState<RegisteredUser | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  
  // Test message state (simplified)
  const [testMessage, setTestMessage] = useState('')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Check if current user is registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (isConnected && account) {
        const registered = await isCurrentUserRegistered()
        setIsCurrentUserReg(registered)
      }
    }
    
    checkRegistration()
  }, [isConnected, account, isCurrentUserRegistered])

  // Handle user registration
  const handleRegisterUser = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true)
    
    try {
      const profileData = JSON.stringify({
        displayName: displayName.trim() || username,
        email: email.trim()
      })
      
      await registerUser(username.trim(), profileData)
      
      setIsCurrentUserReg(true)
      setUsername('')
      setDisplayName('')
      setEmail('')
      
      toast({
        title: "Success!",
        description: "User registered successfully on blockchain",
      })
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "Failed to register user",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  // Handle user search
  const handleSearchUser = async () => {
    if (!searchUsername.trim()) {
      toast({
        title: "Error",
        description: "Username is required for search",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setFoundUser(null)
    
    try {
      const user = await getUserProfileByUsername(searchUsername.trim())
      
      if (user && user.isRegistered) {
        setFoundUser(user)
        toast({
          title: "User Found!",
          description: `Found user: ${user.username}`,
        })
      } else {
        toast({
          title: "User Not Found",
          description: `No registered user found with username: ${searchUsername}`,
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Search Failed",
        description: err.message || "Failed to search user",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Handle copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      })
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="h-6 w-6" />
              Web3 User Registration System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Connect your wallet to access the user registration system
            </p>
            <Button onClick={connectWallet} size="lg">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Web3 User Registration System</h1>
        <p className="text-muted-foreground">
          Register users on blockchain, manage profiles, and enable secure communication
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Connected Wallet:</p>
              <p className="text-sm text-muted-foreground font-mono">{account}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isCurrentUserReg ? "default" : "secondary"}>
                {isCurrentUserReg ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Registered
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Registered
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      {!isCurrentUserReg && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Register New User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter unique username"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <Button 
              onClick={handleRegisterUser} 
              disabled={isRegistering || !username.trim()}
              className="w-full"
            >
              {isRegistering ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Register User
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Enter username to search"
              className="flex-1"
            />
            <Button 
              onClick={handleSearchUser}
              disabled={isSearching || !searchUsername.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {foundUser && (
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <p className="font-mono text-sm">{foundUser.username}</p>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm truncate">{foundUser.address}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(foundUser.address)}
                      >
                        {copiedText === foundUser.address ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Public Key</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm truncate">{foundUser.publicKey}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(foundUser.publicKey)}
                      >
                        {copiedText === foundUser.publicKey ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Registered At</Label>
                    <p className="text-sm">
                      {new Date(foundUser.registeredAt * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
                {foundUser.profileData && (
                  <div className="mt-4">
                    <Label>Profile Data</Label>
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(JSON.parse(foundUser.profileData), null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Simple Message Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Message Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testMessage">Test Message</Label>
            <Input
              id="testMessage"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a test message"
            />
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Encryption functionality will be implemented in a future update. For now, you can prepare your messages here.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Registered Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Registered Users ({registeredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading registered users...</span>
            </div>
          ) : registeredUsers.length > 0 ? (
            <div className="space-y-4">
              {registeredUsers.map((user: RegisteredUser) => (
                <Card key={user.address}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Username</Label>
                        <p className="font-semibold">{user.username}</p>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <p className="font-mono text-xs truncate">{user.address}</p>
                      </div>
                      <div>
                        <Label>Registered</Label>
                        <p className="text-sm">
                          {new Date(user.registeredAt * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No registered users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
