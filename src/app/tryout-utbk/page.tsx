'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UTBK_2026_SUBTESTS } from '@/lib/utbk-constants'
import type { SubtestCode } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  option_e: string
  correct_answer: string
  hint_text: string
  solution_steps: string
  difficulty: string
  subtest_code: SubtestCode
  subtest_display_order: number
  recommended_minutes?: number
}

type SubtestBreakdown = {
  subtestCode: string
  subtestName: string
  subtestIcon: string
  questionCount: number
  recommendedMinutes: number
  questions: Question[]
}

export default function TryOutUTBKPage() {
  // State
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [subtestBreakdown, setSubtestBreakdown] = useState<SubtestBreakdown[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  
  // Timer state (Requirements 5.9, 5.10, 6.1)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [subtestStartTimes, setSubtestStartTimes] = useState<Record<string, number>>({})
  const [subtestElapsedTimes, setSubtestElapsedTimes] = useState<Record<string, number>>({})
  
  const TOTAL_DURATION_MINUTES = 195 // 3 hours 15 minutes
  const TOTAL_DURATION_SECONDS = TOTAL_DURATION_MINUTES * 60

  // Timer effect

  // Fetch questions
  const handleStart = async () => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Kamu harus login dulu!')
        setLoading(false)
        return
      }

      const response = await fetch('/api/tryout-utbk/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const data = await response.json()
      setQuestions(data.questions)
      setSubtestBreakdown(data.subtestBreakdown)
      setStarted(true)
      setStartTime(Date.now())
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Gagal memuat soal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setAnswers({ ...answers, [currentIndex]: answer })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(answers[currentIndex + 1] || null)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(answers[currentIndex - 1] || null)
    }
  }

  const handleJumpTo = (index: number) => {
    setCurrentIndex(index)
    setSelectedAnswer(answers[index] || null)
  }

  const handleSubmit = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Kamu harus login dulu!')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/tryout-utbk/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          answers,
          questions: questions.map(q => ({
            id: q.id,
            correct_answer: q.correct_answer,
            subtest_code: q.subtest_code,
            recommended_minutes: q.recommended_minutes
          })),
          totalTimeSeconds: elapsedSeconds,
          subtestTimes: subtestElapsedTimes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answers')
      }

      const result = await response.json()
      
      // Redirect to results page with data
      const params = new URLSearchParams({
        score: result.totalScore.toString(),
        questions: result.totalQuestions.toString(),
        accuracy: result.accuracy.toString(),
        time: result.totalTimeMinutes.toString(),
      })
      
      if (result.subtestResults && result.subtestResults.length > 0) {
        params.append('results', encodeURIComponent(JSON.stringify(result.subtestResults)))
      }
      
      if (result.strongest) {
        params.append('strongest', encodeURIComponent(JSON.stringify(result.strongest)))
      }
      
      if (result.weakest) {
        params.append('weakest', encodeURIComponent(JSON.stringify(result.weakest)))
      }
      
      window.location.href = `/tryout-utbk/results?${params.toString()}`
    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('Gagal menyimpan progress. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  } 
  , [answers, questions, elapsedSeconds, subtestElapsedTimes])
  
  useEffect(() => {
    if (!started || !startTime) return
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setElapsedSeconds(elapsed)
      const currentQuestion = questions[currentIndex]
      if (currentQuestion) {
        const subtestCode = currentQuestion.subtest_code
        if (!subtestStartTimes[subtestCode]) {
          setSubtestStartTimes(prev => ({ ...prev, [subtestCode]: now }))
        }
        const subtestStart = subtestStartTimes[subtestCode] || now
        const subtestElapsed = Math.floor((now - subtestStart) / 1000)
        setSubtestElapsedTimes(prev => ({ ...prev, [subtestCode]: subtestElapsed }))
      }
      if (elapsed >= TOTAL_DURATION_SECONDS) {
        handleSubmit()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [started, startTime, currentIndex, questions, subtestStartTimes, TOTAL_DURATION_SECONDS, handleSubmit])

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get current subtest info
  const getCurrentSubtest = () => {
    if (!questions[currentIndex]) return null
    const subtestCode = questions[currentIndex].subtest_code
    return subtestBreakdown.find(s => s.subtestCode === subtestCode)
  }

  // Get question number within current subtest
  const getQuestionNumberInSubtest = () => {
    if (!questions[currentIndex]) return 0
    const currentSubtestCode = questions[currentIndex].subtest_code
    const subtestQuestions = questions.filter(q => q.subtest_code === currentSubtestCode)
    const indexInSubtest = subtestQuestions.findIndex(q => q.id === questions[currentIndex].id)
    return indexInSubtest + 1
  }

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Try Out UTBK 📝</h1>
            <p className="text-gray-600">Simulasi lengkap UTBK 2026 dengan 160 soal</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informasi Try Out</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Soal</span>
                <span className="font-bold text-gray-900">160 soal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Waktu</span>
                <span className="font-bold text-gray-900">195 menit (3 jam 15 menit)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jumlah Subtest</span>
                <span className="font-bold text-gray-900">7 subtest</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Distribusi Subtest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {UTBK_2026_SUBTESTS.map((subtest) => (
                  <div key={subtest.code} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{subtest.icon}</span>
                      <span className="font-medium">{subtest.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{subtest.utbkQuestionCount} soal</div>
                      <div className="text-xs text-gray-600">{subtest.utbkDurationMinutes} menit</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={handleStart}
              disabled={loading}
              size="lg"
              className="px-8"
            >
              {loading ? 'Memuat...' : 'Mulai Try Out'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="mb-4 sticky top-4 z-10 shadow-lg">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded" />
                  <div>
                    <Skeleton className="h-4 w-40 rounded mb-1" />
                    <Skeleton className="h-3 w-56 rounded" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-24 rounded mb-1" />
                  <Skeleton className="h-6 w-28 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <Skeleton className="h-3 w-32 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <Skeleton className="h-2 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="h-6 w-3/4">
                  <Skeleton className="h-6 w-full rounded" />
                </CardTitle>
                <Badge variant="secondary" className="text-transparent">
                  <Skeleton className="h-5 w-20 rounded" />
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full p-4 rounded-lg border-2">
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-9 w-28 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded" />
              <Skeleton className="h-9 w-36 rounded" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="h-4 w-24">
                <Skeleton className="h-4 w-24 rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <Skeleton key={i} className="p-2 rounded text-sm font-medium" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const currentSubtest = getCurrentSubtest()
  const questionInSubtest = getQuestionNumberInSubtest()
  const remainingSeconds = TOTAL_DURATION_SECONDS - elapsedSeconds
  const isTimeWarning = remainingSeconds <= 600 // 10 minutes

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tidak ada soal tersedia</p>
          <Button onClick={() => window.location.reload()}>
            Muat Ulang
          </Button>
        </div>
      </div>
    )
  }

  const options = [
    { label: 'A', text: currentQuestion.option_a },
    { label: 'B', text: currentQuestion.option_b },
    { label: 'C', text: currentQuestion.option_c },
    { label: 'D', text: currentQuestion.option_d },
    { label: 'E', text: currentQuestion.option_e },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Timer and Progress Header (Requirements 5.9, 5.10, 6.1, 6.2, 6.3) */}
        <Card className="mb-4 sticky top-4 z-10 shadow-lg">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-3">
              {/* Current Subtest Info */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentSubtest?.subtestIcon}</span>
                <div>
                  <p className="font-semibold text-gray-900">{currentSubtest?.subtestName}</p>
                  <p className="text-sm text-gray-600">
                    Soal {questionInSubtest} dari {currentSubtest?.questionCount} 
                    <span className="mx-2">•</span>
                    Rekomendasi: {currentSubtest?.recommendedMinutes} menit
                  </p>
                </div>
              </div>

              {/* Timer */}
              <div className="text-right">
                <p className="text-sm text-gray-600">Sisa Waktu</p>
                <p className={`text-2xl font-bold ${isTimeWarning ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(remainingSeconds)}
                </p>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress Keseluruhan</span>
                <span>{currentIndex + 1} / {questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg flex-1">{currentQuestion.question_text}</CardTitle>
              <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleSelectAnswer(option.label)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === option.label
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-semibold">{option.label}.</span> {option.text}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← Sebelumnya
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentIndex(0)}>
              Ke Awal
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Selesai & Submit
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Selanjutnya →
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Navigasi Soal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleJumpTo(idx)}
                  className={`p-2 rounded text-sm font-medium transition-all ${
                    idx === currentIndex
                      ? 'bg-blue-600 text-white'
                      : answers[idx]
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
