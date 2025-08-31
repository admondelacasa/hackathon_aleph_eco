"use client"

import SimpleUserRegistration from '@/components/simple-user-registration'

export default function UserRegistrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Web3 Registration System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Connect MetaMask, register your public key and use end-to-end encryption
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your public key is stored securely on the blockchain to enable encrypted communication
          </p>
        </div>

        <SimpleUserRegistration />
      </div>
    </div>
  )
}
