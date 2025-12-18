import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { AchievementNotification } from '@/components/achievements/AchievementNotification'
import { Navigation } from '@/components/navigation/Navigation'
import { MobileNav, MobileBottomNav } from '@/components/mobile/MobileNav'
import { MobileLayout } from '@/components/mobile/MobileLayout'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kognisia - Platform Pembelajaran AI',
  description: 'Platform pembelajaran adaptif untuk siswa Indonesia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <MobileLayout>
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <Navigation />
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden">
              <MobileNav />
            </div>
            
            <main className="pb-20 md:pb-0">
              {children}
            </main>
            
            {/* Mobile Bottom Navigation */}
            <div className="md:hidden">
              <MobileBottomNav />
            </div>
          </MobileLayout>
          <AchievementNotification />
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
