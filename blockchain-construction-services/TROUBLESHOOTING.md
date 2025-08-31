# 🔧 Guía de Solución de Errores Web3

## ❌ Error: "missing revert data" 

### Descripción
Este error ocurre cuando una transacción falla en la blockchain pero no proporciona información específica sobre la causa.

### Causas Comunes:
1. **Contrato no desplegado o dirección incorrecta**
2. **Nodo blockchain no está ejecutándose**  
3. **MetaMask conectado a red incorrecta**
4. **Parámetros de función incorrectos**
5. **Gas insuficiente**

### Solución Paso a Paso:

#### 1. Verificar que el Nodo Hardhat esté ejecutándose
```powershell
# En una terminal separada
cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"
npx hardhat node
```

#### 2. Re-desplegar el Contrato
```powershell
# En otra terminal, con el nodo ejecutándose
cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"
npx hardhat run scripts/deploy-user-registry-simple.js --network localhost
```

#### 3. Verificar Configuración de MetaMask
- **Red**: Localhost 8545
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Símbolo**: ETH

#### 4. Importar Cuenta de Desarrollo
Usar una de estas claves privadas:
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

## 🔍 Otros Errores Comunes

### Error: "Cannot find module"
**Causa**: Dependencias no instaladas
**Solución**: 
```powershell
cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"
npm install --legacy-peer-deps
```

### Error: "Network connection failed"
**Causa**: Nodo blockchain no disponible
**Solución**: Reiniciar el nodo Hardhat

### Error: "User denied transaction signature"
**Causa**: Usuario canceló la transacción en MetaMask
**Solución**: Reintentar y confirmar en MetaMask

### Error: "Insufficient funds"
**Causa**: No hay suficiente ETH en la cuenta
**Solución**: Usar una cuenta de desarrollo con 10,000 ETH

## 🔄 Secuencia de Inicio Correcta

### Terminal 1: Nodo Blockchain
```powershell
cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"
npx hardhat node
```

### Terminal 2: Despliegue de Contratos
```powershell
cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"
npx hardhat run scripts/deploy-user-registry-simple.js --network localhost
```

### Terminal 3: Frontend
```powershell
cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"
npm run dev
```

## 📋 Checklist de Diagnóstico

### Antes de usar la aplicación:
- [ ] ✅ Nodo Hardhat ejecutándose (puerto 8545)
- [ ] ✅ Contratos desplegados correctamente
- [ ] ✅ Frontend Next.js ejecutándose (puerto 3000)
- [ ] ✅ MetaMask configurado para red local
- [ ] ✅ Cuenta importada con ETH suficiente
- [ ] ✅ Archivo `.env.local` con dirección correcta del contrato

### Durante el uso:
- [ ] ✅ MetaMask conectado a la aplicación
- [ ] ✅ Cuenta seleccionada tiene ETH
- [ ] ✅ Red de MetaMask es Localhost 8545
- [ ] ✅ No hay errores en la consola del navegador

## 🚨 Reinicio Completo

Si todo falla, seguir estos pasos:

1. **Cerrar todos los terminales**
2. **Reiniciar nodo blockchain**:
   ```powershell
   cd "C:\Users\ezequ\hackathon_aleph_eco\blockchain-construction-services"
   npx hardhat node
   ```
3. **Re-desplegar contratos**:
   ```powershell
   npx hardhat run scripts/deploy-user-registry-simple.js --network localhost
   ```
4. **Reiniciar frontend**:
   ```powershell
   npm run dev
   ```
5. **Refrescar página en navegador**
6. **Reconectar MetaMask**

## 📞 Estado Actual del Sistema

✅ **Contrato desplegado en**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`  
✅ **Frontend ejecutándose en**: http://localhost:3000  
✅ **Página de registro**: http://localhost:3000/user-registry  

**¡El error "missing revert data" ha sido resuelto!** 🎉
