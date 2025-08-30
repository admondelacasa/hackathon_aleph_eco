# 🌐 BuildTrust - Guía de Integración Web3 Real

## 📋 Resumen

BuildTrust ahora incluye integración completa con Web3 real para conectar wallets de Ethereum y usar contratos inteligentes en producción. Esta guía te muestra cómo configurar y usar la funcionalidad blockchain.

## 🚀 Características Web3

### ✅ Funcionalidades Implementadas
- 🔌 Conexión real con MetaMask y wallets Ethereum
- 🌐 Soporte para Ethereum Mainnet y Sepolia Testnet
- 💰 Visualización de balance de ETH en tiempo real  
- 🔄 Cambio automático de red
- 📱 Detección de cambios de cuenta/red
- 💾 Persistencia de conexión

### 📝 Contratos Inteligentes
- **ConstructionEscrow**: Pagos seguros con liberación escalonada
- **ServiceFeedback**: Sistema de reputación on-chain
- **StakingRewards**: Sistema de staking y recompensas

## 🛠 Configuración Inicial

### 1. Instalar Dependencias Web3

```bash
# Si tienes npm configurado:
npm install @nomicfoundation/hardhat-toolbox hardhat dotenv

# Si tienes yarn:
yarn add @nomicfoundation/hardhat-toolbox hardhat dotenv
```

### 2. Configurar Variables de Entorno

Copia `.env.template` a `.env` y configura:

```bash
# Copiar template
cp .env.template .env
```

Editar `.env`:
```env
# Obtener de https://infura.io/
INFURA_API_KEY=tu_infura_api_key

# Clave privada de wallet para deployment (¡NUNCA compartir!)
PRIVATE_KEY=tu_private_key_de_deployment

# Opcional: para verificar contratos
ETHERSCAN_API_KEY=tu_etherscan_api_key
```

### 3. Compilar Contratos

```bash
npm run compile
```

## 🚀 Deployment de Contratos

### Para Testnet (Recomendado primero)

```bash
# Deployar en Sepolia testnet
npm run deploy:sepolia
```

### Para Mainnet (Producción)

```bash
# Deployar en Ethereum Mainnet
npm run deploy:mainnet
```

### Después del Deployment

1. El script mostrará las direcciones de los contratos deployados
2. Copia las direcciones y actualiza `lib/web3.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  ethereum: {
    CONSTRUCTION_ESCROW: '0xTU_DIRECCION_MAINNET',
    SERVICE_FEEDBACK: '0xTU_DIRECCION_MAINNET', 
    STAKING_REWARDS: '0xTU_DIRECCION_MAINNET',
  },
  sepolia: {
    CONSTRUCTION_ESCROW: '0xTU_DIRECCION_SEPOLIA',
    SERVICE_FEEDBACK: '0xTU_DIRECCION_SEPOLIA',
    STAKING_REWARDS: '0xTU_DIRECCION_SEPOLIA',
  },
}
```

## 🔧 Uso de la Integración Web3

### 1. Acceder a la Funcionalidad Web3

- Ve a `http://localhost:3000/web3-test` 
- O haz clic en el botón "Web3 Real" en la aplicación

### 2. Conectar Wallet

1. Haz clic en "Conectar MetaMask"
2. Autoriza la conexión en MetaMask
3. La aplicación mostrará tu dirección y balance

### 3. Cambiar de Red

- La aplicación detecta automáticamente la red
- Usa los botones para cambiar entre Ethereum y Sepolia
- Se actualizará el balance automáticamente

## 🏗 Crear Contratos de Construcción

Una vez conectado y con contratos deployados:

### 1. Crear Nuevo Contrato
```typescript
import { useConstructionContracts } from '@/hooks/use-real-contracts'

const { createContract } = useConstructionContracts()

await createContract(
  "0xDireccionDelContratista",
  "Descripción del trabajo",
  "1.5" // Cantidad en ETH
)
```

### 2. Liberar Fondos
```typescript
const { releaseFunds } = useConstructionContracts()

await releaseFunds(contractId)
```

### 3. Obtener Contratos
```typescript
const { getClientContracts } = useConstructionContracts()

const contratos = await getClientContracts()
```

## ⭐ Sistema de Reputación

### Dejar Reseña
```typescript
import { useServiceReviews } from '@/hooks/use-real-contracts'

const { submitReview } = useServiceReviews()

await submitReview(
  contractId,
  5, // rating 1-5
  "Excelente trabajo"
)
```

### Obtener Reputación
```typescript
const { getContractorRating } = useServiceReviews()

const { totalRating, reviewCount } = await getContractorRating(
  "0xDireccionDelContratista"
)
```

## 💎 Sistema de Staking

### Hacer Staking
```typescript
import { useStakingSystem } from '@/hooks/use-real-contracts'

const { stake } = useStakingSystem()

await stake("1.0") // Stake 1 ETH
```

### Reclamar Recompensas
```typescript
const { claimRewards } = useStakingSystem()

await claimRewards()
```

## 🔍 Verificar Contratos (Opcional)

Para verificar los contratos en Etherscan:

```bash
# Para Sepolia
npm run verify:sepolia 0xDIRECCION_CONTRATO

# Para Mainnet  
npm run verify:mainnet 0xDIRECCION_CONTRATO
```

## 📱 Componentes Web3 Disponibles

### WalletConnector
```tsx
import { WalletConnector } from '@/components/wallet-connector'

<WalletConnector />
```

### Hooks Disponibles
```tsx
import { useWeb3 } from '@/hooks/use-web3'
import { 
  useConstructionContracts,
  useServiceReviews,
  useStakingSystem 
} from '@/hooks/use-real-contracts'
```

## 🛡 Seguridad

### Variables de Entorno
- ❌ **NUNCA** subir `.env` al repositorio
- ❌ **NUNCA** compartir tu PRIVATE_KEY
- ✅ Usar wallets separadas para desarrollo/producción
- ✅ Verificar las direcciones de contratos

### Mejores Prácticas
- Probar primero en Sepolia testnet
- Verificar transacciones en Etherscan
- Usar cantidades pequeñas para pruebas iniciales
- Mantener respaldos de claves importantes

## 🔧 Troubleshooting

### MetaMask no se conecta
1. Verificar que MetaMask esté instalado
2. Verificar que estés en la red correcta
3. Refrescar la página
4. Revisar la consola del navegador

### Contratos no responden
1. Verificar que las direcciones sean correctas en `lib/web3.ts`
2. Verificar que estés en la red correcta
3. Verificar que el contrato esté deployado en esa red

### Transacciones fallan
1. Verificar que tengas suficiente ETH para gas
2. Verificar los parámetros de la función
3. Revisar los logs en Etherscan

## 📊 Monitoreo

### Etherscan
- **Mainnet**: https://etherscan.io/
- **Sepolia**: https://sepolia.etherscan.io/

### Estado de la Red
- **Gas Tracker**: https://etherscan.io/gastracker
- **Status**: https://status.ethereum.org/

## 🎯 Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Compilar contratos  
3. ✅ Deployar en testnet
4. ✅ Probar funcionalidad Web3
5. ⏳ Deployar en mainnet para producción
6. ⏳ Integrar con la UI principal de BuildTrust

---

## 💡 Tips para el Hackathon

- **Demo rápido**: Usa Sepolia testnet con ETH gratis de faucets
- **Presentación**: Muestra la página `/web3-test` para demostrar conectividad real
- **Funcionalidad**: Los contratos están listos para usar inmediatamente después del deployment
- **Impresionar jueces**: Muestra transacciones reales en Etherscan durante la demo

¡Tu aplicación BuildTrust ya está lista para usar Web3 real con wallets de Ethereum! 🚀
