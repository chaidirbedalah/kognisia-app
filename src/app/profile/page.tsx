'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useStreakSystem } from '@/hooks/useStreakSystem'
import { useAchievements } from '@/hooks/useAchievements'
import { Trophy, Flame, Award, TrendingUp, LogOut } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

interface UserStats {
  total_battles: number
  total_achievements: number
  total_points: number
  total_streaks: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { stats: streakStats, loading: streakLoading } = useStreakSystem()
  const { achievements, stats: achievementStats, loading: achievementLoading } = useAchievements()
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user as UserProfile)
      
      // Fetch user stats
      await fetchUserStats(user.id)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async (userId: string) => {
    try {
      // Get battle count
      const { count: battleCount } = await supabase
        .from('squad_battles')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)

      // Get achievement stats
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)

      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('points')
        .in('id', achievements?.map(a => a.achievement_id) || [])

      const totalPoints = allAchievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0

      setUserStats({
        total_battles: battleCount || 0,
        total_achievements: achievements?.length || 0,
        total_points: totalPoints,
        total_streaks: streakStats?.streak.longest_streak || 0
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || streakLoading || achievementLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Profil Saya
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Achievements</p>
              <p className="text-3xl font-bold text-gray-900">
                {achievementStats?.unlocked_count || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                dari {achievementStats?.total_achievements || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Total Points</p>
              <p className="text-3xl font-bold text-gray-900">
                {achievementStats?.total_points || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                dari achievements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900">
                {streakStats?.streak.current_streak || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                hari berturut-turut
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Squad Battles</p>
              <p className="text-3xl font-bold text-gray-900">
                {userStats?.total_battles || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                battles created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badges */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievement Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements && achievements.filter(a => a.unlocked).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {achievements
                  .filter(a => a.unlocked)
                  .map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      title={achievement.description}
                    >
                      <div className="text-4xl mb-2">{achievement.icon_emoji}</div>
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2">
                        {achievement.name}
                      </p>
                      <Badge className="mt-2 text-xs">
                        {achievement.points}pts
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Belum ada achievements. Mulai dengan Squad Battle atau Daily Challenge!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streak Info */}
        {streakStats && (
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Current Streak</p>
                  <p className="text-4xl font-bold text-orange-600">
                    {streakStats.streak.current_streak}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">hari</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Longest Streak</p>
                  <p className="text-4xl font-bold text-yellow-600">
                    {streakStats.streak.longest_streak}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">hari</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Status</p>
                  <Badge
                    className={
                      streakStats.streak.status === 'active'
                        ? 'bg-green-500 hover:bg-green-600'
                        : streakStats.streak.status === 'at_risk'
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }
                  >
                    {streakStats.streak.status === 'active'
                      ? '🔥 Active'
                      : streakStats.streak.status === 'at_risk'
                      ? '⚠️ At Risk'
                      : '❌ Broken'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/achievements')}
          >
            Lihat Semua Achievements
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

