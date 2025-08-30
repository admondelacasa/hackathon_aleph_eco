# Guía de Integración Web3 para BuildTrust

## Dependencias necesarias (ya instaladas)
- ethers: Para interactuar con Ethereum
- next: Framework principal

## Dependencias adicionales a instalar
```bash
# Si tienes npm configurado:
npm install @metamask/sdk @walletconnect/web3-provider

# O si usas yarn:
yarn add @metamask/sdk @walletconnect/web3-provider
```

## Archivos que vamos a crear/modificar:

1. `lib/web3.ts` - Configuración Web3
2. `components/web3-provider.tsx` - Provider de Web3
3. `components/wallet-connector.tsx` - Conector de billeteras
4. `hooks/use-web3.ts` - Hook personalizado para Web3
5. `app/layout.tsx` - Modificación para incluir Web3Provider
6. Modificar contratos inteligentes para deployment real

## Red objetivo: Ethereum Mainnet o Sepolia Testnet
