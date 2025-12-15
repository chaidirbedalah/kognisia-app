'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DailyChallengeModeSelectorComponent } from '@/components/daily-challenge/DailyChallengeModeSelectorComponent'
import { SubtestSelectorComponent } from '@/components/daily-challenge/SubtestSelectorComponent'
import { UTBK_2026_SUBTESTS } from '@/lib/utbk-constants'
import type { DailyChallengeMode, SubtestCode } from '@/lib/types'

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
}

type FlowStep = 'mode-selection' | 'subtest-selection' | 'questions'

export default function DailyChallengePage() {
  // Flow state
  const [flowStep, setFlowStep] = useState<FlowStep>('mode-selection')
  const [selectedMode, setSelectedMode] = useState<DailyChallengeMode | null>(null)
  const [selectedSubtest, setSelectedSubtest] = useState<SubtestCode | null>(null)
  
  // Question state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)

  // Handle mode selection
  const handleModeSelect = (mode: DailyChallengeMode) => {
    setSelectedMode(mode)
    
    if (mode === 'focus') {
      // Show subtest selector for Focus mode
      setFlowStep('subtest-selection')
    } else {
      // Balanced mode: directly fetch questions
      fetchQuestions(mode, null)
    }
  }

  // Handle subtest selection (for Focus mode)
  const handleSubtestSelect = (subtestCode: string) => {
    setSelectedSubtest(subtestCode as SubtestCode)
    fetchQuestions('focus', subtestCode as SubtestCode)
  }

  // Fetch questions from API
  const fetchQuestions = async (mode: DailyChallengeMode, subtestCode: SubtestCode | null) => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Kamu harus login dulu!')
        setLoading(false)
        return
      }

      const response = await fetch('/api/daily-challenge/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          subtestCode,
          userId: user.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const data = await response.json()
      setQuestions(data.questions)
      setFlowStep('questions')
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Gagal memuat soal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentIndex]
  const options = currentQuestion ? [
    { label: 'A', text: currentQuestion.option_a },
    { label: 'B', text: currentQuestion.option_b },
    { label: 'C', text: currentQuestion.option_c },
    { label: 'D', text: currentQuestion.option_d },
    { label: 'E', text: currentQuestion.option_e },
  ] : []

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setAnswers({ ...answers, [currentIndex]: answer })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(answers[currentIndex + 1] || null)
      setShowHint(false)
      setShowSolution(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(answers[currentIndex - 1] || null)
      setShowHint(false)
      setShowSolution(false)
    }
  }

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Kamu harus login dulu!')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/daily-challenge/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          mode: selectedMode,
          subtestCode: selectedSubtest,
          answers,
          questions: questions.map(q => ({
            id: q.id,
            correct_answer: q.correct_answer,
            subtest_code: q.subtest_code
          })),
          timeSpent: 0 // TODO: Track actual time
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answers')
      }

      const result = await response.json()
      
      // Redirect to results page with data
      const params = new URLSearchParams({
        mode: result.mode,
        score: result.totalScore.toString(),
        questions: result.totalQuestions.toString(),
        accuracy: result.accuracy.toString(),
      })
      
      if (result.subtestCode) {
        params.append('subtest', result.subtestCode)
      }
      
      if (result.subtestResults && result.subtestResults.length > 0) {
        params.append('results', encodeURIComponent(JSON.stringify(result.subtestResults)))
      }
      if (result.rewards?.coins && Number(result.rewards.coins) > 0) {
        params.append('coins', String(result.rewards.coins))
      }
      
      window.location.href = `/daily-challenge/results?${params.toString()}`
    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('Gagal menyimpan progress. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Get subtest name for display
  const getSubtestName = (code: SubtestCode) => {
    return UTBK_2026_SUBTESTS.find(s => s.code === code)?.name || code
  }

  // Render mode selection step
  if (flowStep === 'mode-selection') {
    return (
      <div data-testid="daily-mode-selection-step" className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Challenge 📚</h1>
            <p className="text-gray-600">Pilih mode latihan harianmu</p>
          </div>
          
          <DailyChallengeModeSelectorComponent
            onModeSelect={handleModeSelect}
          />
        </div>
      </div>
    )
  }

  // Render subtest selection step (for Focus mode)
  if (flowStep === 'subtest-selection') {
    return (
      <div data-testid="daily-subtest-selection-step" className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => setFlowStep('mode-selection')}
              className="mb-4"
            >
              ← Kembali
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pilih Subtest</h1>
            <p className="text-gray-600">Fokus latihan pada satu subtest (10 soal)</p>
          </div>
          
          <SubtestSelectorComponent
            onSelect={handleSubtestSelect}
          />
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div data-testid="daily-loading" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat soal...</p>
        </div>
      </div>
    )
  }

  // No questions available
  if (!currentQuestion) {
    return (
      <div data-testid="daily-no-questions" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tidak ada soal tersedia</p>
          <Button onClick={() => setFlowStep('mode-selection')}>
            Kembali ke Pilihan Mode
          </Button>
        </div>
      </div>
    )
  }

  // Render questions step
  return (
    <div data-testid="daily-question-step" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Daily Challenge 📚
              {selectedMode === 'focus' && selectedSubtest && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  - {getSubtestName(selectedSubtest)}
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              Soal {currentIndex + 1} dari {questions.length}
              {selectedMode === 'balanced' && ' (Mode: Balanced - Semua Subtest)'}
              {selectedMode === 'focus' && ' (Mode: Focus)'}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
            <Badge variant="outline">{getSubtestName(currentQuestion.subtest_code)}</Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
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

        {/* Hint & Solution Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            data-testid="hint-button"
            variant="outline" 
            onClick={() => setShowHint(!showHint)}
            disabled={showSolution}
          >
            {showHint ? 'Sembunyikan' : 'Lihat'} Petunjuk
          </Button>
          <Button 
            data-testid="solution-button"
            variant="outline" 
            onClick={() => setShowSolution(!showSolution)}
          >
            {showSolution ? 'Sembunyikan' : 'Lihat'} Jawaban
          </Button>
        </div>

        {/* Hint */}
        {showHint && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-900">💡 <strong>Petunjuk:</strong> {currentQuestion.hint_text}</p>
            </CardContent>
          </Card>
        )}

        {/* Solution */}
        {showSolution && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-sm text-green-900 mb-2">✅ <strong>Jawaban Benar:</strong> {currentQuestion.correct_answer}</p>
              <p className="text-sm text-green-900"><strong>Pembahasan:</strong> {currentQuestion.solution_steps}</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            data-testid="prev-button"
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← Sebelumnya
          </Button>
          
          {currentIndex === questions.length - 1 ? (
            <Button data-testid="submit-button" onClick={handleSubmit}>
              Selesai & Submit
            </Button>
          ) : (
            <Button data-testid="next-button" onClick={handleNext}>
              Selanjutnya →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
