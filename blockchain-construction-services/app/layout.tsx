import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Web3Provider } from '@/hooks/use-web3'
import './globals.css'

export const metadata: Metadata = {
  title: 'BuildTrust - Plataforma Blockchain para Servicios de Construcción',
  description: 'Plataforma descentralizada para servicios de construcción con pagos seguros y liberación gradual de fondos',
  generator: 'BuildTrust',
  icons: {
    icon: '/BuildTrust-logo-v4.png',
    shortcut: '/BuildTrust-logo-v4.png',
    apple: '/BuildTrust-logo-v4.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Web3Provider>
          {children}
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
