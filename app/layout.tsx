import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Camotes Online Store - Microfinance Inc.',
  description: 'Legit & Trusted Camotes Online Store. DTI Registered. E-loans, Bugas, Snacks, Gadgets, Appliances, and Sangla services. Dali ra! Valid ID ra ang kailangan.',
  generator: 'v0.app',
  icons: {
    icon: '/icon.png', // Simply save your square/circular logo as icon.png inside the public folder
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
