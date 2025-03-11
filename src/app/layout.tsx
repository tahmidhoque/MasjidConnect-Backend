import { Inter } from "next/font/google"
import "./globals.css"
import { ClientProvider } from "@/components/providers/client-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Metadata } from 'next'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'MasjidConnect',
  description: 'Connecting your Masjid community',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon.png',
    icon: '/favicon.ico'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ClientProvider>
      </body>
    </html>
  )
}
