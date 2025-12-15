import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { AchievementNotification } from '@/components/achievements/AchievementNotification'
import { Navigation } from '@/components/navigation/Navigation'
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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Navigation />
          <main className="pb-20 md:pb-0">
            {children}
          </main>
          <AchievementNotification />
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
