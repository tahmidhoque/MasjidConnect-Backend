import { Inter } from 'next/font/google';
import { Providers } from './providers';
import "./globals.css"
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MasjidConnect - Smart Digital Solutions for Mosques',
  description: 'Empowering mosques with smart digital solutions to enhance communication, engagement, and accessibility for communities across the UK.',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
