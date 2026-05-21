import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ServiceProvider } from '@/context/ServiceContext' // <-- Import the new shared context provider
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Camotes Online Store",
  description: "Microfinance Inc. Ledger System",
  icons: {
    icon: "/icon-light-32x32.png?v=1", // The ?v=1 completely destroys old browser memory cache!
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased bg-background text-foreground">
        {/* Wrap your children in the provider so admin updates can be shared everywhere */}
        <ServiceProvider>
          {children}
        </ServiceProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}