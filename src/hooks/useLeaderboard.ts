import { useEffect, useState, useCallback } from 'react'

interface LeaderboardEntry {
  id: string
  user_id: string
  score: number
  correct_answers: number
  total_questions: number
  accuracy: number
  rank: number
  badge: string | null
  time_taken_seconds: number | null
  completed_at: string | null
  user: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  }
}

interface LeaderboardStats {
  total_participants: number
  completed_participants: number
  average_score: number
  average_accuracy: number
}

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[]
  stats: LeaderboardStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useLeaderboard(
  battleId: string,
  autoRefresh: boolean = true,
  refreshInterval: number = 5000
): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`/api/squad/battle/${battleId}/leaderboard`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }

      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
      setStats(data.stats)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [battleId])

  useEffect(() => {
    fetchLeaderboard()

    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [battleId, autoRefresh, refreshInterval, fetchLeaderboard])

  return {
    leaderboard,
    stats,
    loading,
    error,
    refetch: fetchLeaderboard
  }
}
