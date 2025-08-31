"use client"

import SimpleUserRegistration from '@/components/simple-user-registration'

export default function UserRegistrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sistema de Registro Web3 
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Conecta MetaMask, registra tu clave pública y usa encriptación de extremo a extremo
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tu clave pública se almacena de forma segura en la blockchain para permitir comunicación encriptada
          </p>
        </div>

        <SimpleUserRegistration />
      </div>
    </div>
  )
}
