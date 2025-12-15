import { useEffect, useState } from 'react'
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

interface UseAchievementsReturn {
  achievements: Achievement[]
  stats: AchievementsStats | null
  loading: boolean
  error: string | null
  unlockAchievement: (code: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useAchievements(): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<AchievementsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = async () => {
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
      setAchievements(data.achievements)
      setStats(data.stats)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements')
      console.error('Error fetching achievements:', err)
    } finally {
      setLoading(false)
    }
  }

  const unlockAchievement = async (code: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/achievements/unlock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ achievement_code: code })
      })

      if (!response.ok) {
        throw new Error('Failed to unlock achievement')
      }

      const data = await response.json()
      
      if (data.success) {
        // Refetch achievements to update state
        await fetchAchievements()
        return true
      }
      
      return false
    } catch (err: unknown) {
      console.error('Error unlocking achievement:', err)
      return false
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [])

  return {
    achievements,
    stats,
    loading,
    error,
    unlockAchievement,
    refetch: fetchAchievements
  }
}
