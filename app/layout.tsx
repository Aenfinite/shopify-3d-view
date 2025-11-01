import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
// import { FirebaseInitializer } from "@/components/firebase-initializer"
import { PWAManager } from "@/components/pwa-manager"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "3D Jacket Configurator - Shopify MTM",
  description: "Customize your jacket in real-time 3D with instant model loading and PWA caching",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  themeColor: '#a2a2a2ff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '3D Jacket Configurator'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1a237e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="3D Jacket Configurator" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <PWAManager />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
