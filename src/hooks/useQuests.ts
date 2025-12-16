'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface QuestTask {
  id: string
  code: string
  title: string
  description?: string
  target: number
  progress: number
  reward_points: number
  completed: boolean
}

export interface Quest {
  id: string
  type: 'weekly' | 'season'
  title: string
  description?: string
  start_date?: string
  end_date?: string
  tasks: QuestTask[]
  total_reward_points: number
  claimed: boolean
}

export function useQuests() {
  const { session } = useAuth()
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([])
  const [seasonPass, setSeasonPass] = useState<Quest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuests = useCallback(async () => {
    if (!session?.access_token) return
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/quests', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch quests')
      const data = await res.json()

      setWeeklyQuests(data.weekly || [])
      setSeasonPass(data.season || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quests')
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  const completeTask = useCallback(async (taskId: string) => {
    if (!session?.access_token) return
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ action: 'complete_task', task_id: taskId })
    })
    if (res.ok) {
      fetchQuests()
    }
  }, [session?.access_token, fetchQuests])

  const claimQuest = useCallback(async (questId: string) => {
    if (!session?.access_token) return
    const res = await fetch('/api/quests', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ action: 'claim', quest_id: questId })
    })
    if (res.ok) {
      fetchQuests()
    }
  }, [session?.access_token, fetchQuests])

  useEffect(() => {
    if (session?.access_token) {
      fetchQuests()
    }
    const channel = supabase
      .channel('user_quests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_quests' }, () => fetchQuests())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [session?.access_token, fetchQuests])

  return {
    weeklyQuests,
    seasonPass,
    loading,
    error,
    completeTask,
    claimQuest,
    refetch: fetchQuests
  }
}

