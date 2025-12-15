import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

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
  const prevStatusRef = useRef<StreakData['status'] | null>(null)

  useEffect(() => {
    fetchStreakStats()
  }, [])

  const fetchStreakStats = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setStats(null)
        setError(null)
        return
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

      const newStatus = (data?.streak?.status ?? null) as StreakData['status'] | null
      const prevStatus = prevStatusRef.current
      prevStatusRef.current = newStatus

      if (prevStatus && newStatus && prevStatus !== newStatus) {
        if (prevStatus === 'at_risk' && newStatus === 'active') {
          toast.success('Streak terselamatkan untuk hari ini! 🔥')
        } else if (newStatus === 'broken') {
          toast.error('Streak putus. Coba lagi besok 💔')
        } else if (newStatus === 'at_risk') {
          toast.warning('Streak berisiko putus hari ini. Ayo selesaikan Daily Challenge! ⚠️')
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch streak stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    let isMounted = true

    const setupRealtime = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        channel = supabase
          .channel('streak-realtime')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'streak_activities',
            filter: `user_id=eq.${user.id}`
          }, async () => {
            if (!isMounted) return
            await fetchStreakStats()
          })
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'daily_streaks',
            filter: `user_id=eq.${user.id}`
          }, async () => {
            if (!isMounted) return
            await fetchStreakStats()
          })
          .subscribe()
      } catch (e) {
        console.error('Error setting up streak realtime:', e)
      }
    }

    setupRealtime()
    return () => {
      isMounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update streak')
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
