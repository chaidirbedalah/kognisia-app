'use client'

import { useStreakSystem } from '@/hooks/useStreakSystem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Trophy, Target } from 'lucide-react'

export function StreakDisplay() {
  const { stats, loading } = useStreakSystem()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading streak...</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const { streak, rewards, next_milestone } = stats
  const daysUntilMilestone = next_milestone - streak.current_streak

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'at_risk':
        return 'text-orange-600'
      case 'broken':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'active':
        return 'Streak aktif! Jaga terus!'
      case 'at_risk':
        return 'Streak akan putus jika tidak aktif hari ini'
      case 'broken':
        return 'Streak putus. Mulai dari awal!'
      default:
        return 'Mulai streak Anda'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Daily Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="text-5xl font-bold text-orange-600 mb-2">
            {streak.current_streak}
          </div>
          <p className="text-sm text-gray-600">Hari berturut-turut</p>
          <Badge className={`mt-2 ${getStatusColor(streak.status)}`}>
            {getStatusMessage(streak.status)}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Terpanjang</p>
            <p className="text-2xl font-bold text-gray-900">{streak.longest_streak}</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Milestone</p>
            <p className="text-2xl font-bold text-gray-900">{next_milestone}</p>
          </div>
        </div>

        {/* Progress to Next Milestone */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Menuju {next_milestone} hari</span>
            <span className="font-semibold text-gray-900">{daysUntilMilestone} hari lagi</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all"
              style={{ width: `${(streak.current_streak / next_milestone) * 100}%` }}
            />
          </div>
        </div>

        {/* Unlocked Rewards */}
        {rewards.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Rewards Terbuka</p>
            <div className="flex flex-wrap gap-2">
              {rewards.map((reward) => (
                <Badge
                  key={reward.id}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  🏆 {reward.streak_milestone} hari
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Milestone Rewards */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Milestone Rewards</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[7, 14, 30].map((milestone) => {
              const isUnlocked = rewards.some(r => r.streak_milestone === milestone)
              return (
                <div
                  key={milestone}
                  className={`p-2 rounded text-center ${
                    isUnlocked
                      ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  <div className="font-bold">{milestone}d</div>
                  <div className="text-xs">{isUnlocked ? '✓' : '🔒'}</div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

