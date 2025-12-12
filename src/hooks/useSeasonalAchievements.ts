import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Season {
  id: string
  name: string
  description: string
  theme: string
  icon_emoji: string
  start_date: string
  end_date: string
  is_active: boolean
  days_remaining: number
}

export interface SeasonalAchievement {
  id: string
  code: string
  name: string
  description: string
  icon_emoji: string
  points: number
  rarity: string
  unlocked: boolean
  unlockedAt?: string
}

export interface SeasonalStats {
  season: Season | null
  achievements: SeasonalAchievement[]
  leaderboard_rank: number | null
  leaderboard_stats: {
    rank: number
    total_points: number
    achievement_count: number
  } | null
}

export function useSeasonalAchievements() {
  const [stats, setStats] = useState<SeasonalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSeasonalStats()
  }, [])

  const fetchSeasonalStats = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/seasonal/current', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch seasonal stats')
      }

      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching seasonal stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    error,
    refetch: fetchSeasonalStats
  }
}

