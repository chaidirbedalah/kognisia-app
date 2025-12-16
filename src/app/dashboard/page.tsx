'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { InsightsCard } from '@/components/dashboard/InsightsCard'
import { DailyChallengeTab } from '@/components/dashboard/DailyChallengeTab'
import { MarathonTab } from '@/components/dashboard/MarathonTab'
import { TryOutTab } from '@/components/dashboard/TryOutTab'
import { ProgressTab } from '@/components/dashboard/ProgressTab'
import { StreakCard } from '@/components/streak/StreakCard'
import { Badge } from '@/components/ui/badge'
import { useStreakSystem } from '@/hooks/useStreakSystem'
import { AlertTriangle, Loader2, Wifi, TrendingUp, Trophy, Target } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useRealtimeLeaderboard } from '@/hooks/useRealtimeLeaderboard'
import QuestSection from '@/components/quests/QuestSection'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AIRecommendations } from '@/components/ai/AIRecommendations'
import { toast } from 'sonner'
import { 
  fetchUserStats, 
  fetchDailyChallengeData, 
  fetchTryOutUTBKData, 
  fetchMiniTryOutData,
  fetchProgressBySubtest,
  type UserStats,
  type DailyChallengeData,
  type TryOutUTBKData,
  type TryOutData,
  type ProgressData
} from '@/lib/dashboard-api'
import type { User } from '@supabase/supabase-js'
import { 
  calculate3LayerBreakdown, 
  findStrongestWeakest, 
  compareWeeklyProgress,
  formatTime,
  groupByAssessmentType
} from '@/lib/dashboard-calculations'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [dailyChallengeData, setDailyChallengeData] = useState<DailyChallengeData[]>([])
  const [tryOutUTBKData, setTryOutUTBKData] = useState<TryOutUTBKData[]>([])
  const [miniTryOutData, setMiniTryOutData] = useState<TryOutData[]>([])
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'marathon' | 'minitryout' | 'tryout' | 'progress' | 'ai-insights'>('overview')
  const [coins, setCoins] = useState<{ bronze: number; silver: number; gold: number; totalBronze: number } | null>(null)
  const [totalXP, setTotalXP] = useState<number>(0)
  const [coinHistory, setCoinHistory] = useState<Array<{ delta: number; reason: string; reference_id?: string | null; created_at: string }>>([])
  const [historySort, setHistorySort] = useState<'date_desc' | 'amount_desc'>('date_desc')
  const [historyReasonFilter, setHistoryReasonFilter] = useState<string>('')
  const [historyReasonCategory, setHistoryReasonCategory] = useState<string>('all')

  const { stats: streakStats, loading: streakLoading } = useStreakSystem()
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [startingDC, setStartingDC] = useState(false)

  const { leaderboard, loading: lbLoading, isConnected } = useRealtimeLeaderboard()
  const { 
    pointsTimeline, 
    achievementTimeline, 
    trends,
    loading: analyticsLoading 
  } = useAnalytics()
  
  const topLeaderboard = leaderboard.slice(0, 8).map((e) => ({ name: (e.email || '').split('@')[0] || 'user', points: e.total_points }))
  const dailyTrend = dailyChallengeData.slice(-14).map((d) => ({ date: new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), accuracy: d.accuracy }))
  
  // Format timeline data untuk chart
  const formattedPointsTimeline = pointsTimeline.slice(-30).map((p) => ({
    date: new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    cumulativePoints: p.cumulativePoints,
    points: p.cumulativePoints
  }))
  
  const formattedAchievementTimeline = achievementTimeline.slice(-14).map((a) => ({
    date: new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    achievement: a.achievement.name,
    points: a.points,
    icon: a.achievement.icon
  }))

  const reasonLabelMap: Record<string, string> = {
    daily_challenge_reward: 'Daily Challenge',
    cohort_entry: 'Masuk Cohort',
    cohort_completion: 'Selesai Cohort',
    battle_entry: 'Masuk Battle'
  }
  const toTitle = (s: string) => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const getReasonLabel = (reason: string) => reasonLabelMap[reason] || toTitle(reason)
  const getBadgeClass = (reason: string, delta: number) => {
    if (delta > 0) {
      if (reason === 'daily_challenge_reward' || reason === 'cohort_completion') return 'text-green-600 border-green-600'
      return 'text-blue-600 border-blue-600'
    } else {
      if (reason === 'battle_entry') return 'text-orange-600 border-orange-600'
      if (reason === 'cohort_entry') return 'text-amber-600 border-amber-600'
      return 'text-red-600 border-red-600'
    }
  }

  useEffect(() => {
    if (!streakStats || streakStats.streak.status !== 'at_risk') {
      setTimeLeft('')
      return
    }
    const interval = setInterval(() => {
      const now = new Date()
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const ms = end.getTime() - now.getTime()
      if (ms <= 0) {
        setTimeLeft('0d')
        return
      }
      const hours = Math.floor(ms / (1000 * 60 * 60))
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((ms % (1000 * 60)) / 1000)
      const h = hours > 0 ? `${hours}j ` : ''
      const m = minutes > 0 ? `${minutes}m ` : ''
      const s = `${seconds}d`
      setTimeLeft(`${h}${m}${s}`.trim())
    }, 1000)
    return () => clearInterval(interval)
  }, [streakStats])

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
      toast.success(`Daily Challenge siap: ${data.totalQuestions} soal`)
      setActiveTab('daily')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal memulai Daily Challenge')
    } finally {
      setStartingDC(false)
    }
  }

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Check user role from database
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        // Redirect teacher to teacher portal
        if (userData?.role === 'teacher') {
          window.location.href = '/teacher'
          return
        }
        
        // Fetch all dashboard data with retry logic
        await loadDashboardDataWithRetry(user.id)

        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            const res = await fetch('/api/economy/summary', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            })
            if (res.ok) {
              const json = await res.json()
              setCoins(json.coins || { bronze: 0, silver: 0, gold: 0, totalBronze: 0 })
              setTotalXP(json.xp || 0)
            }
            const hist = await fetch('/api/economy/history', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            })
            if (hist.ok) {
              const hjson = await hist.json()
              setCoinHistory(hjson.transactions || [])
            }
          }
        } catch (e) {
          console.error('Error fetching economy summary:', e)
        }
      }
    } catch (error) {
      console.error('Error in checkUser:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    checkUser()
  }, [checkUser])

  const loadDashboardDataWithRetry = async (userId: string, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const [stats, dailyData, tryOutUTBKDataResult, miniTryOutDataResult, progressDataResult] = await Promise.all([
          fetchUserStats(userId),
          fetchDailyChallengeData(userId),
          fetchTryOutUTBKData(userId),
          fetchMiniTryOutData(userId),
          fetchProgressBySubtest(userId)
        ])
        
        setUserStats(stats)
        setDailyChallengeData(dailyData)
        setTryOutUTBKData(tryOutUTBKDataResult)
        setMiniTryOutData(miniTryOutDataResult)
        setProgressData(progressDataResult)
        return // Success, exit retry loop
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error)
        
        if (attempt === retries) {
          // Last attempt failed, show error state
          console.error('Failed to load dashboard data after retries')
          // TODO: Show error toast or message to user
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
  }


  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="backdrop-blur-md bg-white/70 dark:bg-neutral-900/60 border-b border-transparent px-4 py-4 animate-pulse">
            <div className="h-6 w-32 bg-muted rounded" />
          </div>
          <div className="space-y-2 px-4">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg p-6 animate-pulse h-32" />
            ))}
          </div>
          <div className="bg-muted rounded-lg p-6 animate-pulse h-40 mx-4" />
        </div>
      </div>
    )
  }

  if (!user) {
    window.location.href = '/login'
    return null
  }

  // Calculate additional metrics
  const strongestWeakest = progressData.length > 0 ? findStrongestWeakest(progressData) : null
  const weeklyComparison = dailyChallengeData.length > 0 ? compareWeeklyProgress(dailyChallengeData) : null
  const assessmentBreakdown = groupByAssessmentType(dailyChallengeData, tryOutUTBKData, miniTryOutData)
  
  // Calculate overall 3-layer breakdown
  const totalDirect = dailyChallengeData.reduce((sum, d) => sum + d.directAnswers, 0)
  const totalHint = dailyChallengeData.reduce((sum, d) => sum + d.hintUsed, 0)
  const totalSolution = dailyChallengeData.reduce((sum, d) => sum + d.solutionViewed, 0)
  const layerBreakdown = calculate3LayerBreakdown(totalDirect, totalHint, totalSolution)
  
  // Calculate accuracies
  const dcAccuracy = assessmentBreakdown.dailyChallenge.accuracy
  const tryOutUTBKAccuracy = assessmentBreakdown.tryOutUTBK.accuracy
  const miniTryOutAccuracy = assessmentBreakdown.tryOut.accuracy

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/70 dark:bg-neutral-900/60 border-b border-transparent">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Kognisia</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            {coins && (
              <span className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-800 transition-transform hover:scale-[1.03]">
                🪙 {coins.totalBronze} (G{coins.gold} S{coins.silver} B{coins.bronze})
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/profile'}
            >
              Profil
            </Button>
            <Button data-testid="logout-button" variant="outline" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!streakLoading && streakStats?.streak.status === 'at_risk' && (
          <div className="mb-6 p-4 bg-orange-100 border-l-4 border-orange-500 rounded" role="alert" aria-live="polite">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-orange-700">
                  Streak Anda berisiko putus hari ini. Selesaikan Daily Challenge untuk mempertahankannya.
                </p>
                {timeLeft && (
                  <p className="text-xs text-orange-600 mt-1">
                    Sisa waktu hari ini: {timeLeft}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                className="ml-4 bg-orange-600 hover:bg-orange-700"
                onClick={handleStartDailyChallenge}
                disabled={startingDC}
              >
                {startingDC ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memulai...
                  </span>
                ) : (
                  'Mulai Daily Challenge'
                )}
              </Button>
            </div>
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Selamat Datang! 👋
          </h2>
          <p className="text-muted-foreground">
            Siap belajar hari ini? Yuk mulai Daily Challenge!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b">
          <div className="flex gap-4 overflow-x-auto">
            <button
              data-testid="tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              data-testid="tab-daily-challenge"
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'daily'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily Challenge
            </button>
            <button
              data-testid="tab-mini-tryout"
              onClick={() => setActiveTab('minitryout')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'minitryout'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mini Try Out
            </button>
            <button
              data-testid="tab-tryout-utbk"
              onClick={() => setActiveTab('marathon')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'marathon'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Try Out UTBK
            </button>
            <button
              data-testid="tab-progress"
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'progress'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Progress
            </button>
            <button
              data-testid="tab-ai-insights"
              onClick={() => setActiveTab('ai-insights')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'ai-insights'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🤖 AI Insights
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Coins"
                value={coins ? coins.totalBronze : 0}
                icon="🪙"
                description={coins ? `Gold ${coins.gold} • Silver ${coins.silver} • Bronze ${coins.bronze}` : 'Bronze-based'}
                loading={loading}
                variant={coins && coins.totalBronze >= 20 ? 'success' : coins && coins.totalBronze >= 10 ? 'warning' : 'default'}
                dataTestId="stat-coins"
              />
              <StatsCard
                title="Total XP"
                value={totalXP}
                icon="⭐"
                description="Prestige & Level"
                loading={loading}
                variant="primary"
                dataTestId="stat-total-xp"
              />
              <StatsCard
                title="Streak Harian"
                value={userStats?.currentStreak || 0}
                icon="🔥"
                description={`Terpanjang: ${userStats?.longestStreak || 0} hari`}
                loading={loading}
                variant={userStats && userStats.currentStreak > 0 ? 'warning' : 'default'}
                dataTestId="stat-streak"
              />
              <StatsCard
                title="Daily Challenge"
                value={userStats?.totalDailyChallenges || 0}
                icon="📚"
                description={dcAccuracy > 0 ? `Akurasi: ${dcAccuracy}%` : 'Belum ada data'}
                loading={loading}
                variant="primary"
                onClick={() => setActiveTab('daily')}
                dataTestId="stat-daily-challenge"
              />
              <StatsCard
                title="Squad Battle"
                value={userStats?.totalSquadBattles || 0}
                icon="⚔️"
                description="Kompetisi real-time"
                loading={loading}
                variant="primary"
                onClick={() => window.location.href = '/squad'}
                dataTestId="stat-squad-battle"
              />
              <StatsCard
                title="Mini Try Out"
                value={miniTryOutData.length}
                icon="⚡"
                description={miniTryOutAccuracy > 0 ? `Akurasi: ${miniTryOutAccuracy}%` : 'Belum ada data'}
                loading={loading}
                variant="primary"
                onClick={() => setActiveTab('minitryout')}
                dataTestId="stat-mini-tryout"
              />
              <StatsCard
                title="Try Out UTBK"
                value={userStats?.totalTryOutUTBK || 0}
                icon="📝"
                description={tryOutUTBKAccuracy > 0 ? `Akurasi: ${tryOutUTBKAccuracy}%` : 'Belum ada data'}
                loading={loading}
                variant="primary"
                onClick={() => setActiveTab('marathon')}
                dataTestId="stat-tryout-utbk"
              />
              <StatsCard
                title="Total Soal"
                value={userStats?.totalQuestions || 0}
                icon="📊"
                description={`Akurasi: ${userStats?.overallAccuracy || 0}%`}
                loading={loading}
                variant={
                  userStats && userStats.overallAccuracy >= 70 ? 'success' :
                  userStats && userStats.overallAccuracy >= 50 ? 'warning' : 'default'
                }
                dataTestId="stat-total-questions"
              />
              <StatsCard
                title="Jawab Langsung"
                value={`${layerBreakdown.directPercentage}%`}
                icon="🎯"
                description={`${layerBreakdown.directCount} dari ${layerBreakdown.total} soal`}
                loading={loading}
                variant={
                  layerBreakdown.directPercentage >= 60 ? 'success' :
                  layerBreakdown.directPercentage >= 40 ? 'warning' : 'default'
                }
                dataTestId="stat-direct-answers"
              />
              <StatsCard
                title="Waktu Rata-rata"
                value={userStats?.avgTimePerQuestion ? formatTime(userStats.avgTimePerQuestion) : '-'}
                icon="⏱️"
                description="Per soal"
                loading={loading}
                dataTestId="stat-avg-time"
              />
            </div>

            {/* Insights Section */}
            <InsightsCard
              strongest={strongestWeakest ? {
                subtest: strongestWeakest.strongest.subtest,
                accuracy: strongestWeakest.strongest.accuracy,
                totalQuestions: strongestWeakest.strongest.totalQuestions
              } : null}
              weakest={strongestWeakest ? {
                subtest: strongestWeakest.weakest.subtest,
                accuracy: strongestWeakest.weakest.accuracy,
                totalQuestions: strongestWeakest.weakest.totalQuestions
              } : null}
              loading={loading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Harian</CardTitle>
                  <CardDescription>Trend akurasi 14 hari terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyTrend.length > 0 ? (
                    <ChartContainer config={{ accuracy: { label: 'Akurasi', color: '#2563eb' } }} className="aspect-[2/1]">
                      <LineChart data={dailyTrend} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="accuracy" stroke="var(--color-accuracy)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="text-sm text-gray-600">Belum ada data</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leaderboard Realtime</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>Top 8 berdasarkan points</span>
                    <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-700 px-2 py-1 rounded">
                      <Wifi className="h-3 w-3" />
                      {isConnected ? 'Live' : 'Connecting'}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lbLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Memuat...</div>
                  ) : topLeaderboard.length > 0 ? (
                    <ChartContainer config={{ points: { label: 'Points', color: '#10b981' } }} className="aspect-[2/1]">
                      <BarChart data={topLeaderboard} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="points" fill="var(--color-points)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="text-sm text-gray-600">Belum ada data</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quest Section */}
            <QuestSection />

            {/* Analytics Timeline Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Points Timeline
                  </CardTitle>
                  <CardDescription>Akumulasi points 30 hari terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Memuat...</div>
                  ) : formattedPointsTimeline.length > 0 ? (
                    <ChartContainer config={{ cumulativePoints: { label: 'Points', color: '#3b82f6' }, points: { label: 'Points', color: '#3b82f6' } }} className="aspect-[2/1]">
                      <LineChart data={formattedPointsTimeline} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="cumulativePoints" stroke="var(--color-cumulativePoints)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="text-sm text-gray-600">Belum ada data points</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Achievement Timeline
                  </CardTitle>
                  <CardDescription>Achievement terbaru 14 hari terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Memuat...</div>
                  ) : formattedAchievementTimeline.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {formattedAchievementTimeline.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{achievement.achievement}</div>
                            <div className="text-xs text-gray-600">{achievement.date}</div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                            <Target className="h-3 w-3" />
                            +{achievement.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">Belum ada achievement terbaru</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coins History */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Coins</CardTitle>
                <CardDescription>10 transaksi terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <select
                    className="border rounded-md h-9 px-2 bg-white"
                    value={historySort}
                    onChange={(e) => setHistorySort(e.target.value as typeof historySort)}
                  >
                    <option value="date_desc">Terbaru</option>
                    <option value="amount_desc">Nominal terbesar</option>
                  </select>
                  <select
                    className="border rounded-md h-9 px-2 bg-white"
                    value={historyReasonCategory}
                    onChange={(e) => setHistoryReasonCategory(e.target.value)}
                  >
                    <option value="all">Semua reason</option>
                    {Array.from(new Set(coinHistory.map(h => h.reason))).map((r) => (
                      <option key={r} value={r}>{getReasonLabel(r)}</option>
                    ))}
                  </select>
                  <input
                    className="border rounded-md h-9 px-2 bg-white w-full"
                    placeholder="Filter reason..."
                    value={historyReasonFilter}
                    onChange={(e) => setHistoryReasonFilter(e.target.value)}
                  />
                </div>
                {coinHistory.length === 0 ? (
                  <p className="text-sm text-gray-600">Belum ada transaksi</p>
                ) : (
                  <div className="space-y-2">
                    {coinHistory
                      .filter(t => historyReasonCategory === 'all' ? true : t.reason === historyReasonCategory)
                      .filter(t => historyReasonFilter ? t.reason.toLowerCase().includes(historyReasonFilter.toLowerCase()) : true)
                      .sort((a, b) => {
                        if (historySort === 'amount_desc') return Math.abs(b.delta) - Math.abs(a.delta)
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      })
                      .map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm border rounded-md px-3 py-2 bg-white">
                        <span className={t.delta >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {t.delta > 0 ? `+${t.delta}` : t.delta} Coin
                        </span>
                        <Badge variant="outline" className={getBadgeClass(t.reason, t.delta)}>
                          {getReasonLabel(t.reason)}
                        </Badge>
                        <span className="text-gray-500">{new Date(t.created_at).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Comparison */}
            {weeklyComparison && weeklyComparison.thisWeek.totalQuestions > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Minggu Ini vs Minggu Lalu 📊</CardTitle>
                <CardDescription>
                  Perbandingan performa 7 hari terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Minggu Ini</p>
                      <p className="text-3xl font-bold text-primary">{weeklyComparison.thisWeek.accuracy}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {weeklyComparison.thisWeek.totalQuestions} soal dikerjakan
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Minggu Lalu</p>
                      <p className="text-3xl font-bold text-foreground">{weeklyComparison.lastWeek.accuracy}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {weeklyComparison.lastWeek.totalQuestions} soal dikerjakan
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Perubahan</p>
                      <div className="flex items-center justify-center gap-2">
                        <p className={`text-3xl font-bold ${
                          weeklyComparison.improvement > 0 ? 'text-green-600' : 
                          weeklyComparison.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {weeklyComparison.improvement > 0 ? '+' : ''}{weeklyComparison.improvement}%
                        </p>
                        <span className="text-2xl">
                          {weeklyComparison.improvement > 0 ? '📈' : 
                           weeklyComparison.improvement < 0 ? '📉' : '➡️'}
                        </span>
                      </div>
                      <p className={`text-xs font-medium mt-1 ${
                        weeklyComparison.improvement > 0 ? 'text-green-600' : 
                        weeklyComparison.improvement < 0 ? 'text-orange-600' : 'text-muted-foreground'
                      }`}>
                        {weeklyComparison.improvement > 0 ? 'Meningkat! Pertahankan! 🎉' : 
                         weeklyComparison.improvement < 0 ? 'Ayo semangat lagi! 💪' : 'Konsisten! 👍'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Challenge 📚</CardTitle>
                  <CardDescription>
                    Latihan harian 10 soal - Jaga streak kamu!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => window.location.href = '/daily-challenge'}
                  >
                    Mulai Daily Challenge
                  </Button>
                </CardContent>
              </Card>

              {/* Streak Card */}
              <StreakCard />

              <Card>
                <CardHeader>
                  <CardTitle>Squad Battle ⚔️</CardTitle>
                  <CardDescription>
                    Kompetisi real-time dengan teman!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => window.location.href = '/squad'}
                  >
                    Mulai Squad Battle
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cohort 🪙</CardTitle>
                  <CardDescription>
                    Belajar terstruktur, biaya 1 Coin, reward 3 Coins
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => window.location.href = '/cohort'}
                  >
                    Buka Cohort
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mini Try Out ⚡</CardTitle>
                  <CardDescription>
                    Latihan cepat 70 soal (10 per subtest)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => window.location.href = '/mini-tryout'}
                  >
                    Mulai Mini Try Out
                  </Button>
                  <div className="mt-2">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        const sessionId = sessionStorage.getItem('mini-tryout-last-session-id')
                        if (sessionId) {
                          window.location.href = `/mini-tryout/results?sessionId=${sessionId}`
                        } else {
                          alert('Belum ada hasil Mini Try Out terbaru.')
                        }
                      }}
                    >
                      Lihat Hasil
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Try Out UTBK 📝</CardTitle>
                  <CardDescription>
                    Simulasi UTBK lengkap 160 soal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => window.location.href = '/marathon'}
                  >
                    Mulai Try Out UTBK
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievements 🏆</CardTitle>
                  <CardDescription>
                    Lihat pencapaian dan badges kamu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => window.location.href = '/achievements'}
                  >
                    Lihat Achievements
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leaderboard 🏅</CardTitle>
                  <CardDescription>
                    Lihat ranking global berdasarkan points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="group w-full bg-yellow-600 hover:bg-yellow-700 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => window.location.href = '/leaderboard'}
                  >
                    <span className="mr-2">Lihat Leaderboard</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded">
                      <Wifi className="h-3 w-3" />
                      Live
                    </span>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Challenge ❄️</CardTitle>
                  <CardDescription>
                    Tantangan musiman dengan achievement eksklusif
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => window.location.href = '/seasonal'}
                  >
                    Lihat Seasonal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Daily Challenge Tab */}
        {activeTab === 'daily' && (
          <DailyChallengeTab data={dailyChallengeData} loading={loading} />
        )}

        {/* Mini Try Out Tab */}
        {activeTab === 'minitryout' && (
          <TryOutTab data={miniTryOutData} loading={loading} />
        )}

        {/* Try Out UTBK Tab */}
        {activeTab === 'marathon' && (
          <MarathonTab data={tryOutUTBKData} loading={loading} />
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <ProgressTab data={progressData} loading={loading} />
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai-insights' && userStats && (
          <AIRecommendations 
            userStats={userStats}
            progressData={progressData}
            tryOutData={miniTryOutData}
            onApplyRecommendation={(recommendation) => {
              toast.success(`Applied AI recommendation: ${recommendation.title}`)
              // Handle recommendation application logic here
            }}
          />
        )}
      </main>
    </div>
  )
}
