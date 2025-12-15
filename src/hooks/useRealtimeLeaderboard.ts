import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface LeaderboardEntry {
  user_id: string
  email: string
  total_points: number
  achievement_count: number
  rank: number
}

export function useRealtimeLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      // Get all users with their achievement points
      const { data: users } = await supabase
        .from('auth.users')
        .select('id, email')

      if (!users) {
        setLeaderboard([])
        return
      }

      // Calculate points for each user
      const leaderboardData = await Promise.all(
        users.map(async (u) => {
          const { data: achievements } = await supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', u.id)

          const { data: allAchievements } = await supabase
            .from('achievements')
            .select('points')
            .in('id', achievements?.map(a => a.achievement_id) || [])

          const totalPoints = allAchievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0

          return {
            user_id: u.id,
            email: u.email,
            total_points: totalPoints,
            achievement_count: achievements?.length || 0,
            rank: 0
          }
        })
      )

      // Sort and assign ranks
      const sorted = leaderboardData
        .sort((a, b) => b.total_points - a.total_points)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))

      setLeaderboard(sorted)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
    }
  }, [])

  const subscribeToLeaderboard = useCallback(async () => {
    try {
      // Initial fetch
      await fetchLeaderboard()

      // Subscribe to real-time updates on user_achievements
      const ch = supabase
        .channel('leaderboard_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_achievements'
          },
          () => {
            // Refresh leaderboard when new achievement is unlocked
            fetchLeaderboard()
          }
        )
        .subscribe()

      setChannel(ch)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }, [fetchLeaderboard])

  useEffect(() => {
    subscribeToLeaderboard()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [channel, subscribeToLeaderboard])

  return {
    leaderboard,
    loading,
    error,
    isConnected: channel?.state === 'joined',
    refetch: fetchLeaderboard
  }
}
