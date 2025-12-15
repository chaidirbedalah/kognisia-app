import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface RealtimeAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  achievement: {
    name: string
    icon_emoji: string
    points: number
  }
}

export function useRealtimeAchievements() {
  const [achievements, setAchievements] = useState<RealtimeAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const subscribeToAchievements = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      // Subscribe to real-time updates
      const ch = supabase
        .channel('user_achievements')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            console.log('New achievement unlocked:', payload)
            // Fetch full achievement data
            fetchAchievementDetails(payload.new.achievement_id)
          }
        )
        .subscribe()

      setChannel(ch)
      setLoading(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    subscribeToAchievements()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [channel, subscribeToAchievements])


  const fetchAchievementDetails = async (achievementId: string) => {
    try {
      const { data: achievement } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single()

      if (achievement) {
        const newAchievement: RealtimeAchievement = {
          id: achievementId,
          user_id: '',
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
          achievement: {
            name: achievement.name,
            icon_emoji: achievement.icon_emoji,
            points: achievement.points
          }
        }

        setAchievements((prev) => [newAchievement, ...prev])
      }
    } catch (err) {
      console.error('Error fetching achievement details:', err)
    }
  }

  return {
    achievements,
    loading,
    error,
    isConnected: channel?.state === 'joined'
  }
}
