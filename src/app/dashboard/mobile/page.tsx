'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { MobileLayout, MobileContainer, MobileGrid } from '@/components/mobile/MobileLayout'
import MobileCard, { MobileCardHeader, MobileCardContent } from '@/components/mobile/MobileCard'
import MobileButton from '@/components/mobile/MobileButton'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useStreakSystem } from '@/hooks/useStreakSystem'
import AIRecommendations from '@/components/ai/AIRecommendationsMobile'
import { 
  fetchUserStats, 
  fetchDailyChallengeData, 
  type UserStats,
  type DailyChallengeData
} from '@/lib/dashboard-api'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Zap,
  BookOpen,
  Sword,
  Star,
  Coins
} from 'lucide-react'
import { toast } from 'sonner'

interface MobileQuickStats {
  totalCoins: number
  currentStreak: number
  totalQuestions: number
  overallAccuracy: number
}

export default function MobileDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<MobileQuickStats | null>(null)
  const [dailyData, setDailyData] = useState<DailyChallengeData[]>([])
  const [startingDC, setStartingDC] = useState(false)
  
  const { isMobile } = useMobileDetection()
  const { stats: streakStats, loading: streakLoading } = useStreakSystem()

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Check user role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (userData?.role === 'teacher') {
          window.location.href = '/teacher'
          return
        }
        
        // Fetch essential data only for mobile
        await loadMobileData(user.id)
      }
    } catch (error) {
      console.error('Error in checkUser:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMobileData = async (userId: string) => {
    try {
      const [userStats, dailyData] = await Promise.all([
        fetchUserStats(userId),
        fetchDailyChallengeData(userId)
      ])
      
      // Get economy summary
      const { data: { session } } = await supabase.auth.getSession()
      let coins = 0
      if (session) {
        const res = await fetch('/api/economy/summary', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const json = await res.json()
          coins = json.coins?.totalBronze || 0
        }
      }
      
      setStats({
        totalCoins: coins,
        currentStreak: userStats.currentStreak || 0,
        totalQuestions: userStats.totalQuestions || 0,
        overallAccuracy: userStats.overallAccuracy || 0
      })
      
      setDailyData(dailyData)
    } catch (error) {
      console.error('Error loading mobile data:', error)
    }
  }

  const handleStartDailyChallenge = async () => {
    if (startingDC) return
    setStartingDC(true)
    try {
      const res = await fetch('/api/daily-challenge/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'balanced' })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memulai Daily Challenge')
      }
      toast.success('Daily Challenge dimulai!')
      window.location.href = '/daily-challenge'
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal memulai Daily Challenge')
    } finally {
      setStartingDC(false)
    }
  }

  useEffect(() => {
    checkUser()
  }, [checkUser])

  if (loading) {
    return (
      <MobileLayout>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-2" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-xl p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (!user) {
    window.location.href = '/login'
    return null
  }

  const quickActions = [
    {
      title: 'Daily Challenge',
      description: '10 soal harian',
      icon: BookOpen,
      color: 'bg-blue-500',
      onPress: handleStartDailyChallenge,
      loading: startingDC
    },
    {
      title: 'Squad Battle',
      description: 'Kompetisi real-time',
      icon: Sword,
      color: 'bg-purple-500',
      onPress: () => window.location.href = '/squad'
    },
    {
      title: 'Mini Try Out',
      description: 'Latihan cepat',
      icon: Zap,
      color: 'bg-green-500',
      onPress: () => window.location.href = '/mini-tryout'
    },
    {
      title: 'Try Out UTBK',
      description: 'Simulasi lengkap',
      icon: Target,
      color: 'bg-orange-500',
      onPress: () => window.location.href = '/marathon'
    }
  ]

  return (
    <MobileLayout>
      <MobileContainer>
        {/* Welcome Header */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold mb-2">
            Halo! 👋
          </h1>
          <p className="text-muted-foreground">
            Siap belajar hari ini?
          </p>
        </div>

        {/* Streak Alert */}
        {!streakLoading && streakStats?.streak.status === 'at_risk' && (
          <MobileCard variant="outlined" className="border-orange-200 bg-orange-50 mb-4">
            <MobileCardHeader
              icon={<Trophy className="h-5 w-5 text-orange-600" />}
              title="Streak Berisiko!"
              subtitle="Selesaikan Daily Challenge untuk mempertahankan streak"
            />
            <MobileCardContent>
              <MobileButton 
                onClick={handleStartDailyChallenge}
                loading={startingDC}
                className="w-full bg-orange-600 hover:bg-orange-700"
                hapticFeedback
              >
                {startingDC ? 'Memulai...' : 'Mulai Sekarang'}
              </MobileButton>
            </MobileCardContent>
          </MobileCard>
        )}

        {/* Quick Stats */}
        <MobileGrid cols={2}>
          <MobileCard variant="elevated" className="text-center">
            <div className="flex flex-col items-center">
              <Coins className="h-8 w-8 text-amber-500 mb-2" />
              <div className="text-2xl font-bold">{stats?.totalCoins || 0}</div>
              <div className="text-sm text-muted-foreground">Coins</div>
            </div>
          </MobileCard>

          <MobileCard variant="elevated" className="text-center">
            <div className="flex flex-col items-center">
              <Trophy className="h-8 w-8 text-orange-500 mb-2" />
              <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </div>
          </MobileCard>

          <MobileCard variant="elevated" className="text-center">
            <div className="flex flex-col items-center">
              <Target className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{stats?.totalQuestions || 0}</div>
              <div className="text-sm text-muted-foreground">Soal</div>
            </div>
          </MobileCard>

          <MobileCard variant="elevated" className="text-center">
            <div className="flex flex-col items-center">
              <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-2xl font-bold">{stats?.overallAccuracy || 0}%</div>
              <div className="text-sm text-muted-foreground">Akurasi</div>
            </div>
          </MobileCard>
        </MobileGrid>

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Mulai Belajar</h2>
          <MobileGrid cols={2}>
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <MobileCard 
                  key={index}
                  variant="default" 
                  onPress={action.onPress}
                  className="text-center"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                  {'loading' in action && action.loading && (
                    <div className="mt-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    </div>
                  )}
                </MobileCard>
              )
            })}
          </MobileGrid>
        </div>

        {/* Recent Activity */}
        {dailyData.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
            <MobileCard variant="default">
              <MobileCardHeader
                icon={<Clock className="h-5 w-5 text-blue-500" />}
                title="Daily Challenge Terakhir"
                subtitle={`${dailyData[dailyData.length - 1]?.accuracy || 0}% akurasi`}
              />
              <MobileCardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Jawaban Benar</span>
                    <span className="font-medium">{dailyData[dailyData.length - 1]?.correctAnswers || 0}/10</span>
                  </div>

                </div>
              </MobileCardContent>
            </MobileCard>
          </div>
        )}

        {/* AI Recommendations Section */}
        <div className="mt-6">
          <AIRecommendations 
            userId={user.id}
            onApplyRecommendation={(recommendation) => {
              toast.success(`AI recommendation applied: ${recommendation.subtest}`)
            }}
          />
        </div>

        {/* Bottom Padding */}
        <div className="h-20" />
      </MobileContainer>
    </MobileLayout>
  )
}