'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSeasonalAchievements } from '@/hooks/useSeasonalAchievements'
import { Trophy, Clock, Zap, TrendingUp } from 'lucide-react'

interface SeasonalLeaderboardEntry {
  rank: number
  user_id: string
  email: string
  total_points: number
  achievement_count: number
  is_current_user?: boolean
}

export default function SeasonalPage() {
  const router = useRouter()
  const { stats, loading } = useSeasonalAchievements()
  const [leaderboard, setLeaderboard] = useState<SeasonalLeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/seasonal/leaderboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }

      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLeaderboardLoading(false)
    }
  }

  if (loading || leaderboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seasonal challenges...</p>
        </div>
      </div>
    )
  }

  if (!stats?.season) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">Tidak ada seasonal challenge yang aktif saat ini.</p>
              <Button onClick={() => router.push('/dashboard')}>
                Kembali ke Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { season, achievements, leaderboard_stats } = stats

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-500'
      case 'uncommon':
        return 'from-green-400 to-green-500'
      case 'rare':
        return 'from-blue-400 to-blue-500'
      case 'epic':
        return 'from-purple-400 to-purple-500'
      case 'legendary':
        return 'from-yellow-400 to-yellow-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Season Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{season.icon_emoji}</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{season.name}</h1>
              <p className="text-gray-600">{season.description}</p>
            </div>
          </div>

          {/* Season Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{season.days_remaining}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Your Achievements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unlockedCount}/{achievements.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Your Points</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seasonal Achievements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Seasonal Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                    achievement.unlocked
                      ? 'hover:scale-105 shadow-lg'
                      : 'opacity-60 hover:opacity-80'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(
                      achievement.rarity
                    )}`}
                  />

                  <div className="relative p-4 text-white text-center">
                    <div className="text-4xl mb-2">{achievement.icon_emoji}</div>
                    <h3 className="font-bold text-sm mb-1">{achievement.name}</h3>
                    <p className="text-xs opacity-90 mb-2 line-clamp-2">
                      {achievement.description}
                    </p>
                    <Badge className="text-xs">{achievement.points}pts</Badge>
                    {achievement.unlocked && (
                      <div className="mt-2 text-xs">✓ Unlocked</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Seasonal Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data leaderboard
                </div>
              ) : (
                leaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`p-4 rounded-lg border-2 ${
                      entry.rank === 1
                        ? 'bg-yellow-50 border-yellow-300'
                        : entry.rank === 2
                        ? 'bg-gray-50 border-gray-300'
                        : entry.rank === 3
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-white border-gray-200'
                    } ${entry.is_current_user ? 'ring-2 ring-purple-400' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 text-center">
                          {entry.rank === 1 ? (
                            <Trophy className="h-6 w-6 text-yellow-500 mx-auto" />
                          ) : entry.rank === 2 ? (
                            <span className="text-xl">🥈</span>
                          ) : entry.rank === 3 ? (
                            <span className="text-xl">🥉</span>
                          ) : (
                            <span className="font-bold text-gray-500">#{entry.rank}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {entry.email.split('@')[0]}
                            {entry.is_current_user && (
                              <Badge variant="outline" className="ml-2">
                                You
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {entry.achievement_count} achievements
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">
                          {entry.total_points}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            ← Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

