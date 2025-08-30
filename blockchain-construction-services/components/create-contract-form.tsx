"use client"

import { useState } from "react"
import { useConstructionServices } from "@/hooks/use-construction-services"
import { useUSDT } from "@/hooks/use-usdt"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"

export function CreateContractForm() {
  const { createService } = useConstructionServices()
  const { checkBalance, checkAllowance, approveUSDT } = useUSDT()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    contractor: "",
    description: "",
    milestones: "1",
    milestoneDescriptions: [""],
  })
  const [currentStep, setCurrentStep] = useState<'initial' | 'checking' | 'approving' | 'creating'>('initial')

  // Validaciones en tiempo real
  const [validations, setValidations] = useState({
    hasEnoughBalance: false,
    hasApproval: false,
    isValidAmount: false
  })

  // Verificar balance y aprobación cuando cambia el monto
  const handleAmountChange = async (amount: string) => {
    setFormData(prev => ({ ...prev, amount }))
    
    if (!amount || isNaN(Number(amount))) {
      setValidations(prev => ({ ...prev, isValidAmount: false }))
      return
    }

    try {
      setCurrentStep('checking')
      // Verificar balance
      const balance = await checkBalance()
      const hasEnough = Number(balance) >= Number(amount)
      
      // Verificar aprobación
      const allowance = await checkAllowance(CONTRACT_ADDRESSES.CONSTRUCTION_ESCROW)
      const hasApproval = Number(allowance) >= Number(amount)

      setValidations({
        hasEnoughBalance: hasEnough,
        hasApproval: hasApproval,
        isValidAmount: true
      })

      setNeedsApproval(!hasApproval)
      setCurrentStep('initial')

      // Mostrar advertencias relevantes
      if (!hasEnough) {
        toast({
          title: "Balance insuficiente",
          description: `Necesitas ${amount} USDT pero solo tienes ${balance} USDT`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error checking balances:", error)
      toast({
        title: "Error",
        description: "No se pudo verificar el balance o la aprobación",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      if (needsApproval) {
        setCurrentStep('approving')
        const approved = await approveUSDT(
          CONTRACT_ADDRESSES.CONSTRUCTION_ESCROW,
          formData.amount
        )
        if (!approved) {
          throw new Error("No se pudo aprobar el uso de USDT")
        }
      }

      setCurrentStep('creating')
      const result = await createService(
        formData.contractor,
        formData.description,
        Date.now() + 7 * 24 * 60 * 60 * 1000, // Example deadline: 1 week from now
        "CONSTRUCTION", // Example serviceType, adjust as needed
        formData.milestoneDescriptions,
        formData.amount
      )

      toast({
        title: "¡Contrato creado!",
        description: "El contrato se ha creado correctamente.",
        variant: "default"
      })

      // Resetear formulario
      setFormData({
        amount: "",
        contractor: "",
        description: "",
        milestones: "1",
        milestoneDescriptions: [""],
      })
      setCurrentStep('initial')

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear el contrato",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Crear Nuevo Contrato</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label>Monto (USDT)</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
              min="0"
              step="0.01"
            />
            {validations.isValidAmount && !validations.hasEnoughBalance && (
              <Alert variant="destructive">
                <AlertTitle>Balance insuficiente</AlertTitle>
                <AlertDescription>
                  No tienes suficientes USDT para crear este contrato.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <label>Contratista (dirección)</label>
            <Input
              type="text"
              value={formData.contractor}
              onChange={(e) => setFormData(prev => ({ ...prev, contractor: e.target.value }))}
              placeholder="0x..."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label>Descripción del contrato</label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el trabajo a realizar..."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label>Número de milestones</label>
            <Input
              type="number"
              value={formData.milestones}
              onChange={(e) => {
                const value = e.target.value
                const numMilestones = parseInt(value) || 1
                setFormData(prev => ({ 
                  ...prev, 
                  milestones: value,
                  milestoneDescriptions: Array(numMilestones).fill("").map((_, i) => 
                    prev.milestoneDescriptions[i] || `Milestone ${i + 1}`
                  )
                }))
              }}
              min="1"
              max="10"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <label>Descripción de los milestones</label>
            {formData.milestoneDescriptions.map((desc, index) => (
              <Input
                key={index}
                type="text"
                value={desc}
                onChange={(e) => {
                  const newDescriptions = [...formData.milestoneDescriptions]
                  newDescriptions[index] = e.target.value
                  setFormData(prev => ({ ...prev, milestoneDescriptions: newDescriptions }))
                }}
                placeholder={`Milestone ${index + 1}`}
                disabled={isLoading}
              />
            ))}
          </div>

          <div className="space-y-4">
            {needsApproval && (
              <Alert>
                <AlertTitle>Aprobación necesaria</AlertTitle>
                <AlertDescription>
                  Necesitas aprobar el uso de {formData.amount} USDT antes de crear el contrato.
                  Esta es una operación única por cantidad.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !validations.isValidAmount || !validations.hasEnoughBalance}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStep === 'checking' && "Verificando..."}
              {currentStep === 'approving' && "Aprobando USDT..."}
              {currentStep === 'creating' && "Creando contrato..."}
              {currentStep === 'initial' && (needsApproval ? "Aprobar y Crear" : "Crear Contrato")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
