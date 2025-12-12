import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AchievementNotification } from '@/components/achievements/AchievementNotification'

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
    <html lang="id">
      <body className={inter.className}>
        {children}
        <AchievementNotification />
      </body>
    </html>
  )
}
