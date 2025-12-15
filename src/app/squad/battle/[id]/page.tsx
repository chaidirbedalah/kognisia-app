'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BattleQuestion } from '@/components/squad/BattleQuestion'
import { BattleLeaderboard } from '@/components/squad/BattleLeaderboard'
import type { SquadBattle, SquadBattleQuestion } from '@/lib/squad-types'
import { Clock, Trophy, ArrowLeft } from 'lucide-react'

export default function BattleSessionPage() {
  const router = useRouter()
  const params = useParams()
  const battleId = params.id as string

  const [battle, setBattle] = useState<SquadBattle | null>(null)
  const [questions, setQuestions] = useState<SquadBattleQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const loadBattleData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession()
      let response = await fetch(`/api/squad/battle/${battleId}`, {
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
      })
      let data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load battle')
      }

      if (!data.is_participant && session?.access_token) {
        const joinRes = await fetch('/api/battle/join', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ battle_id: battleId })
        })
        if (!joinRes.ok) {
          const jj = await joinRes.json().catch(() => ({}))
          // Redirect to waiting room on join failure (e.g., coins tidak cukup)
          if ((jj.error || '').toLowerCase().includes('coins')) {
            return router.push(`/squad/battle/${battleId}/waiting`)
          }
          throw new Error(jj.error || 'Failed to join battle')
        }
        // Re-fetch to refresh participant status and questions
        response = await fetch(`/api/squad/battle/${battleId}`, {
          headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
        })
        data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load battle')
        }
      }

      if (!data.is_participant) {
        return router.push(`/squad/battle/${battleId}/waiting`)
      }

      setBattle(data.battle)
      setQuestions(data.questions)

      if (data.battle.started_at && data.battle.time_limit_minutes) {
        const startTime = new Date(data.battle.started_at).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        const total = data.battle.time_limit_minutes * 60
        setTimeRemaining(Math.max(0, total - elapsed))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load battle')
    } finally {
      setLoading(false)
    }
  }, [battleId, router])
  
  useEffect(() => {
    loadBattleData()
  }, [loadBattleData])

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)

    try {
      for (let i = 0; i < questions.length; i++) {
        const answer = answers[i]
        if (answer) {
          await fetch(`/api/squad/battle/${battleId}/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question_id: questions[i].question_id,
              selected_answer: answer,
              time_spent_seconds: 0
            })
          })
        }
      }

      await fetch(`/api/squad/battle/${battleId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battle_id: battleId })
      })

      router.push(`/squad/battle/${battleId}/results`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit battle')
    } finally {
      setSubmitting(false)
    }
  }, [questions, answers, battleId, router])
  
  useEffect(() => {
    if (!battle || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [battle, timeRemaining, handleSubmit])

  

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [currentIndex]: answer })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  

  

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading battle...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !battle || !currentQuestion) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Battle not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/squad')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Squads
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-600" />
              Squad Battle
            </h1>
            <p className="text-gray-600">
              Soal {currentIndex + 1} dari {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="h-5 w-5" />
              <span className="font-bold text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
            >
              {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            {/* Progress Bar */}
            <div className="mb-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <BattleQuestion
              question={currentQuestion}
              selectedAnswer={answers[currentIndex] || null}
              onAnswerSelect={handleAnswerSelect}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                ← Sebelumnya
              </Button>
              
              <div className="flex gap-3">
                {currentIndex === questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {submitting ? 'Submitting...' : 'Selesai & Submit'}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Selanjutnya →
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Question Navigator */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">Navigasi Soal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`aspect-square rounded-lg border-2 font-semibold text-sm transition-all ${
                        index === currentIndex
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : answers[index]
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Terjawab: {answeredCount}/{questions.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            {showLeaderboard && (
              <BattleLeaderboard battleId={battleId} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
