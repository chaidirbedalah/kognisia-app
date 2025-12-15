'use client'

import { useEffect, useState, useCallback } from 'react'
import { AchievementCard } from './AchievementCard'
import { supabase } from '@/lib/supabase'

interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon_emoji: string
  category: string
  points: number
  rarity: string
  unlocked: boolean
  unlockedAt?: string
}

interface AchievementsStats {
  total_achievements: number
  unlocked_count: number
  locked_count: number
  total_points: number
  completion_percentage: number
}

interface AchievementsGridProps {
  category?: string
  showStats?: boolean
}

export function AchievementsGrid({
  category,
  showStats = true
}: AchievementsGridProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<AchievementsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/achievements/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch achievements')
      }

      const data = await response.json()
      
      let filtered = data.achievements
      if (category) {
        filtered = filtered.filter((a: Achievement) => a.category === category)
      }

      setAchievements(filtered)
      setStats(data.stats)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements')
      console.error('Error fetching achievements:', err)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600">Total</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total_achievements}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600">Unlocked</p>
            <p className="text-2xl font-bold text-green-900">{stats.unlocked_count}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600">Points</p>
            <p className="text-2xl font-bold text-purple-900">{stats.total_points}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-600">Progress</p>
            <p className="text-2xl font-bold text-orange-900">{stats.completion_percentage}%</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {stats && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Achievement Progress</span>
            <span className="text-sm text-gray-600">
              {stats.unlocked_count} / {stats.total_achievements}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.completion_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No achievements found
          </div>
        ) : (
          achievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">Rarity Levels:</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-400 to-gray-500"></div>
            <span>Common</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-green-500"></div>
            <span>Uncommon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-blue-500"></div>
            <span>Rare</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-400 to-purple-500"></div>
            <span>Epic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400 to-yellow-500"></div>
            <span>Legendary</span>
          </div>
        </div>
      </div>
    </div>
  )
}
