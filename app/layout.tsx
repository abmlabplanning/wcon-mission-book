import type { Metadata, Viewport } from 'next'
import { BottomNav } from '@/src/components/layout/BottomNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'W공동체 Connect Mission Book',
  description: '2026 W Conference - Connect 미션북',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'W Mission Book',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2D5A27',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-[#F5F2EC] antialiased">
        <main className="pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
