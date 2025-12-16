'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ProgressData } from '@/lib/dashboard-api'
import { fetchProgressBySubtest } from '@/lib/dashboard-api'

export interface AdaptiveRecommendation {
  id: string
  type: 'subtest' | 'topic'
  subtest_code?: string
  topic_name?: string
  title: string
  description: string
  current_accuracy: number
  target_accuracy: number
  questions_needed: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_time_minutes: number
  priority_score: number
}

export interface AdaptiveSession {
  id: string
  title: string
  description: string
  type: 'remedial' | 'practice' | 'challenge'
  questions: AdaptiveQuestion[]
  total_questions: number
  estimated_duration_minutes: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface AdaptiveQuestion {
  id: string
  question_text: string
  subtest_code: string
  topic_name: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  question_type: string
}

export function useAdaptiveRecommendations() {
  const { session } = useAuth()
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([])
  const [sessions, setSessions] = useState<AdaptiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const analyzeProgressAndRecommend = useCallback(async () => {
    if (!session?.access_token) return

    try {
      setLoading(true)
      setError(null)

      // Get current user progress
      const progressData = await fetchProgressBySubtest(session.user.id)

      // Analyze weak areas and generate recommendations
      const weakTopics: AdaptiveRecommendation[] = []
      const weakSubtests: AdaptiveRecommendation[] = []

      progressData.forEach(subtest => {
        // Check subtest-level weakness
        if (subtest.accuracy < 60 && subtest.totalQuestions >= 5) {
          weakSubtests.push({
            id: `subtest-${subtest.subtest}`,
            type: 'subtest',
            subtest_code: subtest.subtest,
            title: `Latihan intensif ${subtest.subtest}`,
            description: `Fokus pada ${subtest.subtest} dengan akurasi ${subtest.accuracy}%`,
            current_accuracy: subtest.accuracy,
            target_accuracy: 70,
            questions_needed: Math.max(10, Math.ceil((70 - subtest.accuracy) * 0.5)),
            difficulty_level: subtest.accuracy < 40 ? 'beginner' : 'intermediate',
            estimated_time_minutes: Math.ceil(Math.max(10, Math.ceil((70 - subtest.accuracy) * 0.5)) * 1.5),
            priority_score: (100 - subtest.accuracy) * subtest.totalQuestions
          })
        }

        // Check topic-level weakness
        subtest.topics.forEach(topic => {
          if (topic.status === 'Lemah' && topic.totalQuestions >= 3) {
            weakTopics.push({
              id: `topic-${subtest.subtest}-${topic.name}`,
              type: 'topic',
              subtest_code: subtest.subtest,
              topic_name: topic.name,
              title: `Remedial: ${topic.name} (${subtest.subtest})`,
              description: `Perbaiki ${topic.name} dari akurasi ${topic.accuracy}% ke target 70%`,
              current_accuracy: topic.accuracy,
              target_accuracy: 70,
              questions_needed: Math.max(8, Math.ceil((70 - topic.accuracy) * 0.4)),
              difficulty_level: topic.accuracy < 30 ? 'beginner' : 'intermediate',
              estimated_time_minutes: Math.ceil(Math.max(8, Math.ceil((70 - topic.accuracy) * 0.4)) * 1.2),
              priority_score: (100 - topic.accuracy) * topic.totalQuestions * 1.5
            })
          }
        })
      })

      // Sort by priority score and take top 10
      const allRecommendations = [...weakSubtests, ...weakTopics]
        .sort((a, b) => b.priority_score - a.priority_score)
        .slice(0, 10)

      setRecommendations(allRecommendations)

      // Generate adaptive sessions
      const adaptiveSessions = await generateAdaptiveSessions(allRecommendations)
      setSessions(adaptiveSessions)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze progress')
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  const generateAdaptiveSessions = async (recs: AdaptiveRecommendation[]): Promise<AdaptiveSession[]> => {
    const sessions: AdaptiveSession[] = []

    // Group recommendations by type and create sessions
    const topicRecs = recs.filter(r => r.type === 'topic')
    const subtestRecs = recs.filter(r => r.type === 'subtest')

    // Remedial session for weak topics
    if (topicRecs.length > 0) {
      const topWeakTopics = topicRecs.slice(0, 3)
      const questionsNeeded = topWeakTopics.reduce((sum, r) => sum + r.questions_needed, 0)
      const avgAccuracy = Math.round(topWeakTopics.reduce((sum, r) => sum + r.current_accuracy, 0) / topWeakTopics.length)

      sessions.push({
        id: 'remedial-session',
        title: `Sesi Remedial - ${topWeakTopics.length} Topik Lemah`,
        description: `Fokus pada ${topWeakTopics.map(t => t.topic_name).join(', ')}`,
        type: 'remedial',
        questions: [],
        total_questions: questionsNeeded,
        estimated_duration_minutes: Math.ceil(questionsNeeded * 1.2),
        difficulty: avgAccuracy < 40 ? 'easy' : 'medium'
      })
    }

    // Practice session for weak subtests
    if (subtestRecs.length > 0) {
      const weakSubtest = subtestRecs[0]
      sessions.push({
        id: 'practice-session',
        title: `Latihan ${weakSubtest.subtest_code}`,
        description: `Tingkatkan akurasi dari ${weakSubtest.current_accuracy}% ke ${weakSubtest.target_accuracy}%`,
        type: 'practice',
        questions: [],
        total_questions: weakSubtest.questions_needed,
        estimated_duration_minutes: weakSubtest.estimated_time_minutes,
        difficulty: weakSubtest.difficulty_level === 'beginner' ? 'easy' : 'medium'
      })
    }

    // Challenge session for strong areas
    const strongRecs = recs.filter(r => r.current_accuracy >= 70 && r.current_accuracy < 85)
    if (strongRecs.length > 0) {
      const challengeRec = strongRecs[0]
      sessions.push({
        id: 'challenge-session',
        title: `Challenge: ${challengeRec.title}`,
        description: `Tantangan harder level untuk memperkuat ${challengeRec.subtest_code || challengeRec.topic_name}`,
        type: 'challenge',
        questions: [],
        total_questions: Math.min(10, challengeRec.questions_needed),
        estimated_duration_minutes: Math.ceil(Math.min(10, challengeRec.questions_needed) * 2),
        difficulty: 'hard'
      })
    }

    return sessions
  }

  const startSession = useCallback(async (sessionId: string) => {
    if (!session?.access_token) return

    try {
      // Call API to start adaptive session
      const response = await fetch('/api/adaptive/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        throw new Error('Failed to start session')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
      throw err
    }
  }, [session?.access_token])

  useEffect(() => {
    if (session?.access_token) {
      analyzeProgressAndRecommend()
    }
  }, [session?.access_token, analyzeProgressAndRecommend])

  return {
    recommendations,
    sessions,
    loading,
    error,
    startSession,
    refresh: analyzeProgressAndRecommend
  }
}