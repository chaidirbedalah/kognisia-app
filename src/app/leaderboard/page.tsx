'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  user_id: string
  email: string
  total_points: number
  achievement_count: number
  is_current_user?: boolean
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/leaderboard/global', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }

      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
      setCurrentUserRank(data.current_user_rank)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />
      default:
        return null
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-300'
      case 2:
        return 'bg-gray-50 border-gray-300'
      case 3:
        return 'bg-orange-50 border-orange-300'
      default:
        return 'bg-white border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">Global Leaderboard</h1>
          </div>
          <p className="text-gray-600">
            Ranking berdasarkan total achievement points
          </p>
        </div>

        {/* Current User Rank Card */}
        {currentUserRank && (
          <Card className="mb-8 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Peringkat Kamu</p>
                  <p className="text-3xl font-bold text-purple-600">#{currentUserRank}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Players</CardTitle>
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
                    className={`p-4 rounded-lg border-2 ${getRankColor(entry.rank)} ${
                      entry.is_current_user ? 'ring-2 ring-purple-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 flex justify-center">
                          {getRankIcon(entry.rank) || (
                            <span className="text-xl font-bold text-gray-500">
                              #{entry.rank}
                            </span>
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

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Tentang Leaderboard</p>
                <p className="text-sm text-gray-700">
                  Leaderboard ini menampilkan ranking berdasarkan total achievement points yang telah dikumpulkan. 
                  Semakin banyak achievements yang kamu unlock, semakin tinggi peringkatmu!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

