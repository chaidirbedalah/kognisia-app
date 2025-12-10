'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SquadBattleLeaderboard } from '@/lib/squad-types'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BattleLeaderboardProps {
  battleId: string
}

export function BattleLeaderboard({ battleId }: BattleLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<SquadBattleLeaderboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`battle-${battleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'squad_battle_participants',
          filter: `battle_id=eq.${battleId}`
        },
        () => {
          loadLeaderboard()
        }
      )
      .subscribe()

    // Refresh every 5 seconds
    const interval = setInterval(loadLeaderboard, 5000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
    }
  }, [battleId])

  async function loadLeaderboard() {
    try {
      const response = await fetch(`/api/squad/battle/${battleId}/leaderboard`)
      const data = await response.json()

      if (response.ok) {
        setLeaderboard(data.leaderboard)
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-gray-500 font-semibold">{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200'
      case 2:
        return 'bg-gray-50 border-gray-200'
      case 3:
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!leaderboard || leaderboard.participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No participants yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Live Leaderboard
        </CardTitle>
        <p className="text-xs text-gray-500">
          {leaderboard.total_participants} peserta
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.participants.map((participant) => (
            <div
              key={participant.id}
              className={`p-3 rounded-lg border-2 transition-all ${getRankColor(participant.rank || 0)} ${
                participant.is_current_user ? 'ring-2 ring-purple-400' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 flex justify-center">
                    {getRankIcon(participant.rank || 0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {participant.user_name || 'Unknown'}
                      {participant.is_current_user && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{participant.score}</p>
                  <p className="text-xs text-gray-500">
                    {participant.accuracy.toFixed(0)}%
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(participant.correct_answers / participant.total_questions) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {participant.correct_answers}/{participant.total_questions} benar
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
