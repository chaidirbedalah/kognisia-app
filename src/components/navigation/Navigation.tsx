'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Trophy, 
  Flame, 
  Users, 
  User, 
  Menu, 
  BarChart3,
  Zap,
  Sparkles,
  Calendar,
  Gauge,
  ChevronDown,
  Wifi,
  WifiOff,
  Sun,
  Moon
} from 'lucide-react'
import { RealtimeNotificationBadge } from '@/components/realtime/RealtimeNotificationBadge'
import { useRealtimeAchievements } from '@/hooks/useRealtimeAchievements'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  category?: 'main' | 'features' | 'analytics' | 'profile'
}

const navItems: NavItem[] = [
  // Main Navigation
  { label: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" />, category: 'main' },
  { label: 'Squad', href: '/squad', icon: <Users className="h-5 w-5" />, category: 'main' },
  { label: 'Daily Challenge', href: '/daily-challenge', icon: <Flame className="h-5 w-5" />, category: 'main' },
  
  // Features
  { label: 'Achievements', href: '/achievements', icon: <Trophy className="h-5 w-5" />, category: 'features' },
  { label: 'Leaderboard', href: '/leaderboard', icon: <BarChart3 className="h-5 w-5" />, category: 'features' },
  { label: 'Events', href: '/events', icon: <Zap className="h-5 w-5" />, category: 'features' },
  { label: 'Seasonal', href: '/seasonal', icon: <Calendar className="h-5 w-5" />, category: 'features' },
  { label: 'Cosmetics', href: '/cosmetics', icon: <Sparkles className="h-5 w-5" />, category: 'features' },
  
  // Analytics
  { label: 'Analytics', href: '/analytics', icon: <BarChart3 className="h-5 w-5" />, category: 'analytics' },
  { label: 'Performance', href: '/performance', icon: <Gauge className="h-5 w-5" />, category: 'analytics' },
  
  // Profile
  { label: 'Profile', href: '/profile', icon: <User className="h-5 w-5" />, category: 'profile' },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const { isConnected, achievements } = useRealtimeAchievements()
  const { theme, setTheme } = useTheme()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  // Main items for bottom nav (mobile)
  const mainItems = navItems.filter(item => item.category === 'main')
  
  // All items for menu
  const groupedItems = {
    main: navItems.filter(item => item.category === 'main'),
    features: navItems.filter(item => item.category === 'features'),
    analytics: navItems.filter(item => item.category === 'analytics'),
    profile: navItems.filter(item => item.category === 'profile'),
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/70 dark:bg-neutral-900/60 border-t border-transparent md:hidden z-40">
        <div className="flex justify-around items-center h-16">
          {mainItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive(item.href)
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs font-medium inline-flex items-center gap-1">
              More
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-600" />
              ) : (
                <WifiOff className="h-3 w-3 text-gray-500" />
              )}
              {achievements.length > 0 && (
                <span className="text-[10px] leading-none px-1.5 py-0.5 rounded bg-purple-600 text-white">
                  {achievements.length > 99 ? '99+' : achievements.length}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle Theme"
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-600 hover:text-gray-900"
          >
            <Sun className="h-5 w-5 dark:hidden" aria-hidden="true" />
            <Moon className="h-5 w-5 hidden dark:inline" aria-hidden="true" />
            <span className="text-xs font-medium dark:hidden">Light</span>
            <span className="text-xs font-medium hidden dark:inline">Dark</span>
          </button>
          
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      
      <div
        className={`fixed bottom-16 left-0 right-0 backdrop-blur-md bg-white/70 dark:bg-neutral-900/60 border-t border-transparent max-h-96 overflow-y-auto transition-all md:hidden z-40 ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="p-4 space-y-2">
          {/* Features Section */}
          <div>
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'features' ? null : 'features')}
              className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold"
            >
              <span>Features</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedCategory === 'features' ? 'rotate-180' : ''}`} />
            </button>
            {expandedCategory === 'features' && (
              <div className="ml-4 space-y-1 mt-2">
                {groupedItems.features.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-100 text-purple-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Section */}
          <div>
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'analytics' ? null : 'analytics')}
              className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold"
            >
              <span>Analytics</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedCategory === 'analytics' ? 'rotate-180' : ''}`} />
            </button>
            {expandedCategory === 'analytics' && (
              <div className="ml-4 space-y-1 mt-2">
                {groupedItems.analytics.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-100 text-purple-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="border-t pt-2 mt-2">
            {groupedItems.profile.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-purple-100 text-purple-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="border-t pt-2 mt-2">
            <button
              onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsOpen(false) }}
              aria-label="Toggle Theme"
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
            >
              <Sun className="h-5 w-5 dark:hidden" aria-hidden="true" />
              <Moon className="h-5 w-5 hidden dark:inline" aria-hidden="true" />
              <span className="dark:hidden">Light</span>
              <span className="hidden dark:inline">Dark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block sticky top-0 backdrop-blur-md bg-white/70 dark:bg-neutral-900/60 border-b border-transparent z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/dashboard" className="text-2xl font-bold text-purple-600 hover:text-purple-700">
              Kognisia
            </Link>

            {/* Main Navigation */}
            <div className="flex gap-1">
              {groupedItems.main.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-purple-100 text-purple-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Secondary Navigation */}
            <div className="flex gap-3 items-center">
              {/* Features Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Trophy className="h-5 w-5" />
                  <span>Features</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {groupedItems.features.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        isActive(item.href)
                          ? 'bg-purple-100 text-purple-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Analytics Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {groupedItems.analytics.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        isActive(item.href)
                          ? 'bg-purple-100 text-purple-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Profile */}
              {groupedItems.profile.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-purple-100 text-purple-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle Theme"
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
              >
                <Sun className="h-5 w-5 dark:hidden" aria-hidden="true" />
                <Moon className="h-5 w-5 hidden dark:inline" aria-hidden="true" />
                <span className="hidden lg:inline dark:hidden">Light</span>
                <span className="hidden lg:inline hidden dark:inline">Dark</span>
              </button>

              {/* Global Live Status */}
              <div className="pl-2">
                <RealtimeNotificationBadge />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
