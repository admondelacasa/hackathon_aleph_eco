# 🚀 Sistema de Registro Web3 - Guía de Uso

## ✅ Estado del Sistema
- ✅ Nodo Hardhat ejecutándose en http://127.0.0.1:8545/
- ✅ Contrato UserRegistry desplegado en: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- ✅ Frontend Next.js ejecutándose en http://localhost:3000
- ✅ Página de registro disponible en http://localhost:3000/user-registry

## 🔗 Enlaces Rápidos
- **Página Principal**: http://localhost:3000
- **Página de Registro**: http://localhost:3000/user-registry
- **Blockchain Local**: http://127.0.0.1:8545/

## 🦊 Configuración de MetaMask

### Agregar Red Local de Desarrollo
1. Abre MetaMask
2. Ve a Configuración > Redes > Agregar Red
3. Configura los siguientes datos:
   - **Nombre de la red**: Localhost 8545
   - **Nueva URL de RPC**: http://127.0.0.1:8545
   - **ID de cadena**: 31337
   - **Símbolo de moneda**: ETH
   - **URL del explorador de bloques**: (deja vacío)

### Importar Cuenta de Desarrollo
Usa cualquiera de estas claves privadas para importar una cuenta con 10,000 ETH:

```
Cuenta #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Cuenta #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8  
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

## 🎯 Cómo Usar el Sistema

### 1. Conectar Wallet
1. Ve a http://localhost:3000/user-registry
2. Haz clic en "Conectar MetaMask"
3. Autoriza la conexión en MetaMask
4. Verifica que tu dirección aparezca conectada

### 2. Registrar Usuario
1. Una vez conectado, llena el formulario:
   - **Nombre de Usuario**: Ingresa un nombre único
   - **Clave Pública**: (opcional - se genera automáticamente)
   - **Datos de Perfil**: (opcional) JSON con información adicional
2. Haz clic en "Registrar Usuario"
3. Confirma la transacción en MetaMask
4. Espera la confirmación de registro exitoso

### 3. Ver Usuarios Registrados
- Los usuarios registrados aparecerán automáticamente en la lista
- Puedes ver la información de perfil de cada usuario
- Todos los datos se almacenan directamente en la blockchain

## 🛠️ Comandos de Desarrollo

### Para reiniciar el sistema:
```bash
# Terminal 1 - Nodo Blockchain
cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"
npx hardhat node

# Terminal 2 - Desplegar Contratos
cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"  
npx hardhat run scripts/deploy-user-registry-simple.js --network localhost

# Terminal 3 - Frontend
cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"
npm run dev
```

## 🔍 Solución de Problemas

### Error de Conexión de MetaMask
- Verifica que MetaMask esté conectado a la red Localhost 8545
- Asegúrate de que el nodo Hardhat esté ejecutándose

### Error de Transacción
- Verifica que tengas ETH suficiente en tu cuenta
- Revisa que el contrato esté desplegado correctamente

### Página en Blanco
- Verifica que Next.js esté ejecutándose sin errores de compilación
- Revisa la consola del navegador para errores JavaScript

## 🎉 ¡Listo para Usar!

Tu sistema de registro Web3 está completamente funcional. Los usuarios pueden:
- Conectar sus wallets MetaMask
- Registrarse en la blockchain
- Ver otros usuarios registrados
- Todo de forma descentralizada sin servidores centrales

¡Disfruta explorando tu sistema Web3! 🚀
