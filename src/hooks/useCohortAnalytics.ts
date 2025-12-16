'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface CohortMetrics {
  cohort_id: string
  cohort_name: string
  total_students: number
  active_students: number
  avg_accuracy: number
  avg_questions_attempted: number
  avg_time_spent: number
  engagement_rate: number
  improvement_rate: number
  struggling_students: number
  top_performers: number
  median_accuracy: number
  distribution: {
    excellent: number // >80%
    good: number      // 60-80%
    fair: number      // 40-60%
    poor: number      // <40%
  }
}

export interface CohortComparison {
  cohorts: CohortMetrics[]
  comparison_period: {
    start: string
    end: string
  }
  insights: {
    best_performing_cohort: string
    most_improved_cohort: string
    highest_engagement: string
    needs_attention: string
  }
}

export interface TopicDistribution {
  topic_name: string
  subtest_code: string
  total_questions: number
  correct_answers: number
  accuracy: number
  student_distribution: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
  struggling_students: string[]
  recommendations: string[]
}

export interface EngagementAnalytics {
  cohort_id: string
  daily_activity: {
    date: string
    active_students: number
    questions_answered: number
    time_spent: number
  }[]
  weekly_summary: {
    week: string
    total_activity: number
    avg_daily_engagement: number
    peak_activity_day: string
  }
  consistency_metrics: {
    streak_active_students: number
    daily_regular_students: number
    occasional_students: number
  }
}

export function useCohortAnalytics() {
  const { session } = useAuth()
  const [cohortComparison, setCohortComparison] = useState<CohortComparison | null>(null)
  const [topicDistribution, setTopicDistribution] = useState<TopicDistribution[]>([])
  const [engagementAnalytics, setEngagementAnalytics] = useState<EngagementAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCohortAnalytics = useCallback(async (classIds?: string[], dateRange?: { start: string; end: string }) => {
    if (!session?.access_token) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (classIds?.length) {
        params.set('class_ids', classIds.join(','))
      }
      if (dateRange) {
        params.set('start_date', dateRange.start)
        params.set('end_date', dateRange.end)
      }

      const response = await fetch(`/api/analytics/cohort?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch cohort analytics')
      }

      const data = await response.json()
      setCohortComparison(data.cohort_comparison)
      setTopicDistribution(data.topic_distribution)
      setEngagementAnalytics(data.engagement_analytics)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  const exportCohortReport = useCallback(async (format: 'csv' | 'pdf', options?: {
    classIds?: string[]
    dateRange?: { start: string; end: string }
    includeCharts?: boolean
  }) => {
    if (!session?.access_token) return

    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          type: 'cohort',
          format,
          ...options
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export report')
      }

      // Handle file download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cohort-report-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report')
    }
  }, [session?.access_token])

  const getCohortInsights = useCallback((cohorts: CohortMetrics[]) => {
    if (cohorts.length === 0) return null

    const bestPerforming = cohorts.reduce((best, current) => 
      current.avg_accuracy > best.avg_accuracy ? current : best
    )

    const mostImproved = cohorts.reduce((best, current) => 
      current.improvement_rate > best.improvement_rate ? current : best
    )

    const highestEngagement = cohorts.reduce((best, current) => 
      current.engagement_rate > best.engagement_rate ? current : best
    )

    const needsAttention = cohorts.find(c => c.struggling_students / c.total_students > 0.3)

    return {
      best_performing_cohort: bestPerforming.cohort_name,
      most_improved_cohort: mostImproved.cohort_name,
      highest_engagement: highestEngagement.cohort_name,
      needs_attention: needsAttention?.cohort_name || 'None'
    }
  }, [])

  useEffect(() => {
    if (session?.access_token) {
      fetchCohortAnalytics()
    }
  }, [session?.access_token, fetchCohortAnalytics])

  return {
    cohortComparison,
    topicDistribution,
    engagementAnalytics,
    loading,
    error,
    fetchCohortAnalytics,
    exportCohortReport,
    getCohortInsights
  }
}