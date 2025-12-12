import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  status: 'active' | 'broken' | 'at_risk'
  is_active_today: boolean
}

export interface StreakReward {
  id: string
  streak_milestone: number
  reward_type: string
  reward_value: string
  unlocked_at: string
}

export interface StreakStats {
  streak: StreakData
  today_activities: string[]
  rewards: StreakReward[]
  next_milestone: number
}

export function useStreakSystem() {
  const [stats, setStats] = useState<StreakStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStreakStats()
  }, [])

  const fetchStreakStats = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/streak/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch streak stats')
      }

      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching streak stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStreak = async (activityType: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/streak/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activity_type: activityType })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update streak')
      }

      // Refresh stats
      await fetchStreakStats()
      return true
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating streak:', err)
      return false
    }
  }

  return {
    stats,
    loading,
    error,
    updateStreak,
    refetch: fetchStreakStats
  }
}

