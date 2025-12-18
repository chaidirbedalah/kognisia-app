'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { 
  Home, 
  Trophy, 
  Users, 
  User, 
  Settings, 
  Menu,
  X,
  BarChart3,
  Target,
  Sword
} from 'lucide-react'

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isMobile } = useMobileDetection()

  const navigation = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Tryout', href: '/tryout-utbk', icon: Target },
    { name: 'Battle', href: '/squad', icon: Sword },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Profil', href: '/profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  if (!isMobile) return null

  return (
    <>
      {/* Mobile Header */}
      <header className={cn(
        'sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-border'
      )}>
        <div className="flex items-center justify-between px-3 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-base">Kognisia</span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur">
          <div className="fixed inset-x-0 top-0 z-50 bg-background border-b border-border">
            <div className="flex items-center justify-between px-3 py-3">
              <Link 
                href="/" 
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">K</span>
                </div>
                <span className="font-semibold text-base">Kognisia</span>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="pt-20 px-3 pb-6">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      'active:scale-95 touch-action-manipulation',
                      active 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-current rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Settings Section */}
            <div className="mt-8 pt-6 border-t border-border">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-accent active:scale-95 touch-action-manipulation"
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Pengaturan</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

interface MobileBottomNavProps {
  className?: string
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname()
  const { isMobile } = useMobileDetection()

  const bottomNav = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Battle', href: '/squad', icon: Sword },
    { name: 'Ranking', href: '/leaderboard', icon: Trophy },
    { name: 'Profil', href: '/profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  if (!isMobile) return null

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      'border-t border-border'
    )}>
      <div className="pb-safe-bottom">
        <nav className="flex items-center justify-around py-2">
          {bottomNav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
                  'active:scale-95 touch-action-manipulation min-w-[44px] min-h-[44px]',
                  active 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default MobileNav