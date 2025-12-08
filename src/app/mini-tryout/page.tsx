'use client'

/**
 * Mini Try Out Page
 * 
 * 70 questions (10 from each of 7 subtests) with 90-minute timer
 * Requirements: 7.4, 7.5
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  AlertCircle
} from 'lucide-react'

interface Question {
  id: string
  subtest_code: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  option_e: string
  correct_answer: string
}

interface SubtestInfo {
  code: string
  name: string
  questionCount: number
  startIndex: number
}

export default function MiniTryOutPage() {
  const router = useRouter()
  
  // State
  const [questions, setQuestions] = useState<Question[]>([])
  const [subtests, setSubtests] = useState<SubtestInfo[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(90 * 60) // 90 minutes in seconds
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  // Load questions on mount
  useEffect(() => {
    loadQuestions()
  }, [])

  // Timer countdown (Requirement 7.5)
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit() // Auto-submit when time runs out
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/mini-tryout/start', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to load questions')
      }

      const data = await response.json()
      setQuestions(data.questions)
      setSubtests(data.subtests)
    } catch (error) {
      console.error('Error loading questions:', error)
      alert('Gagal memuat soal. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleQuestionNavigate = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    const unansweredCount = questions.length - Object.keys(answers).length
    if (unansweredCount > 0 && timeRemaining > 0) {
      const confirm = window.confirm(
        `Kamu masih punya ${unansweredCount} soal yang belum dijawab. Yakin mau submit?`
      )
      if (!confirm) return
    }

    setIsSubmitting(true)

    try {
      const endTime = Date.now()
      const totalTimeSeconds = Math.floor((endTime - startTime) / 1000)

      const response = await fetch('/api/mini-tryout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          answers,
          totalTimeSeconds,
          startTime,
          endTime
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit')
      }

      const data = await response.json()
      
      // Store results for results page
      sessionStorage.setItem(
        `mini-tryout-results-${data.sessionId}`,
        JSON.stringify(data.results)
      )
      
      router.push(`/mini-tryout/results?sessionId=${data.sessionId}`)
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Gagal submit jawaban. Silakan coba lagi.')
      setIsSubmitting(false)
    }
  }

  // Helper functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentSubtest = () => {
    return subtests.find(s => 
      currentQuestionIndex >= s.startIndex && 
      currentQuestionIndex < s.startIndex + s.questionCount
    )
  }

  const getQuestionStatus = (index: number) => {
    if (answers[index]) return 'answered'
    if (index === currentQuestionIndex) return 'current'
    return 'unanswered'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat soal...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentSubtest = getCurrentSubtest()
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold">Mini Try Out UTBK</h1>
                <p className="text-sm text-gray-600">
                  70 Soal • 90 Menit
                </p>
              </div>

              {/* Timer (Requirement 7.5) */}
              <div className={`flex items-center gap-2 ${timeRemaining < 600 ? 'text-red-600' : 'text-gray-700'}`}>
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-mono font-bold">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-semibold">{answeredCount}</span>
                  <span className="text-gray-600">/{questions.length} dijawab</span>
                </div>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>Soal {currentQuestionIndex + 1} dari {questions.length}</span>
                <span>{Math.round(progress)}% selesai</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              {/* Subtest Badge (Requirement 7.4) */}
              {currentSubtest && (
                <div className="mb-2">
                  <Badge variant="secondary" className="text-sm">
                    {currentSubtest.name}
                  </Badge>
                </div>
              )}
              <CardTitle className="text-lg">
                Soal {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Text */}
              <div className="prose max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {currentQuestion?.question_text}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {['A', 'B', 'C', 'D', 'E'].map((option) => {
                  const optionKey = `option_${option.toLowerCase()}` as keyof Question
                  const optionText = currentQuestion?.[optionKey] as string
                  const isSelected = answers[currentQuestionIndex] === option

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {option}
                        </span>
                        <span className="flex-1 pt-1">{optionText}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Sebelumnya
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Navigator */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Navigasi Soal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index)
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionNavigate(index)}
                      className={`aspect-square rounded-lg text-sm font-semibold transition-all ${
                        status === 'current'
                          ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                          : status === 'answered'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100"></div>
                  <span>Sudah dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-600"></div>
                  <span>Soal saat ini</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100"></div>
                  <span>Belum dijawab</span>
                </div>
              </div>

              {/* Warning if time low */}
              {timeRemaining < 600 && timeRemaining > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800">
                      Waktu hampir habis! Segera selesaikan soal yang tersisa.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
