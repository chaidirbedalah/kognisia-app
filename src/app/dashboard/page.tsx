'use client'

import { useEffect, useState } from 'react'
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
import { 
  fetchUserStats, 
  fetchDailyChallengeData, 
  fetchTryOutUTBKData, 
  fetchMiniTryOutData,
  fetchTryOutData,
  fetchProgressBySubtest,
  type UserStats,
  type DailyChallengeData,
  type TryOutUTBKData,
  type TryOutData,
  type ProgressData
} from '@/lib/dashboard-api'
import { 
  calculate3LayerBreakdown, 
  findStrongestWeakest, 
  compareWeeklyProgress,
  formatTime,
  groupByAssessmentType
} from '@/lib/dashboard-calculations'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [dailyChallengeData, setDailyChallengeData] = useState<DailyChallengeData[]>([])
  const [tryOutUTBKData, setTryOutUTBKData] = useState<TryOutUTBKData[]>([])
  const [miniTryOutData, setMiniTryOutData] = useState<TryOutData[]>([])
  const [tryOutData, setTryOutData] = useState<TryOutData[]>([])
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'marathon' | 'minitryout' | 'tryout' | 'progress'>('overview')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
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
      }
    } catch (error) {
      console.error('Error in checkUser:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardDataWithRetry = async (userId: string, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const [stats, dailyData, tryOutUTBKDataResult, miniTryOutDataResult, tryOutDataResult, progressDataResult] = await Promise.all([
          fetchUserStats(userId),
          fetchDailyChallengeData(userId),
          fetchTryOutUTBKData(userId),
          fetchMiniTryOutData(userId),
          fetchTryOutData(userId),
          fetchProgressBySubtest(userId)
        ])
        
        setUserStats(stats)
        setDailyChallengeData(dailyData)
        setTryOutUTBKData(tryOutUTBKDataResult)
        setMiniTryOutData(miniTryOutDataResult)
        setTryOutData(tryOutDataResult)
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Kognisia</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/profile'}
            >
              Profil
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang! 👋
          </h2>
          <p className="text-gray-600">
            Siap belajar hari ini? Yuk mulai Daily Challenge!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'daily'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily Challenge
            </button>
            <button
              onClick={() => setActiveTab('minitryout')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'minitryout'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mini Try Out
            </button>
            <button
              onClick={() => setActiveTab('marathon')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'marathon'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Try Out UTBK
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'progress'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Progress
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Streak Harian"
                value={userStats?.currentStreak || 0}
                icon="🔥"
                description={`Terpanjang: ${userStats?.longestStreak || 0} hari`}
                loading={loading}
                variant={userStats && userStats.currentStreak > 0 ? 'warning' : 'default'}
              />
              <StatsCard
                title="Daily Challenge"
                value={userStats?.totalDailyChallenges || 0}
                icon="📚"
                description={dcAccuracy > 0 ? `Akurasi: ${dcAccuracy}%` : 'Belum ada data'}
                loading={loading}
                variant="primary"
                onClick={() => setActiveTab('daily')}
              />
              <StatsCard
                title="Squad Battle"
                value={userStats?.totalSquadBattles || 0}
                icon="⚔️"
                description="Kompetisi real-time"
                loading={loading}
                variant="primary"
                onClick={() => window.location.href = '/squad'}
              />
              <StatsCard
                title="Mini Try Out"
                value={miniTryOutData.length}
                icon="⚡"
                description={miniTryOutAccuracy > 0 ? `Akurasi: ${miniTryOutAccuracy}%` : 'Belum ada data'}
                loading={loading}
                variant="primary"
                onClick={() => setActiveTab('minitryout')}
              />
              <StatsCard
                title="Try Out UTBK"
                value={userStats?.totalTryOutUTBK || 0}
                icon="📝"
                description={tryOutUTBKAccuracy > 0 ? `Akurasi: ${tryOutUTBKAccuracy}%` : 'Belum ada data'}
                loading={loading}
                variant="primary"
                onClick={() => setActiveTab('marathon')}
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
              />
              <StatsCard
                title="Waktu Rata-rata"
                value={userStats?.avgTimePerQuestion ? formatTime(userStats.avgTimePerQuestion) : '-'}
                icon="⏱️"
                description="Per soal"
                loading={loading}
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

            {/* Weekly Comparison */}
            {weeklyComparison && weeklyComparison.thisWeek.totalQuestions > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Minggu Ini vs Minggu Lalu 📊</CardTitle>
                  <CardDescription>
                    Perbandingan performa 7 hari terakhir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">Minggu Ini</p>
                      <p className="text-3xl font-bold text-blue-600">{weeklyComparison.thisWeek.accuracy}%</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {weeklyComparison.thisWeek.totalQuestions} soal dikerjakan
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">Minggu Lalu</p>
                      <p className="text-3xl font-bold text-gray-600">{weeklyComparison.lastWeek.accuracy}%</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {weeklyComparison.lastWeek.totalQuestions} soal dikerjakan
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">Perubahan</p>
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
                        weeklyComparison.improvement < 0 ? 'text-orange-600' : 'text-gray-600'
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
                    className="w-full bg-amber-600 hover:bg-amber-700"
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
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => window.location.href = '/leaderboard'}
                  >
                    Lihat Leaderboard
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
      </main>
    </div>
  )
}
