'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
}

export default function DailyChallengeePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .limit(10)
    
    if (data) {
      setQuestions(data)
    }
    setLoading(false)
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

    let totalScore = 0
    const progressData = []

    // Calculate score and prepare data
    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx]
      const userAnswer = answers[idx] || 'skip'
      const isCorrect = userAnswer === q.correct_answer
      const questionScore = isCorrect ? 10 : 0
      
      totalScore += questionScore

      progressData.push({
        student_id: user.id,
        question_id: q.id,
        selected_answer: userAnswer,
        is_correct: isCorrect,
        score: questionScore,
        time_spent_seconds: 60, // placeholder
        hint_accessed: false, // we'll track this later
        solution_accessed: false,
      })
    }

    // Save to database
    const { error } = await supabase
      .from('student_progress')
      .insert(progressData)

    if (error) {
      console.error('Error saving progress:', error)
      alert('Gagal menyimpan progress: ' + error.message)
    } else {
      alert(`🎉 Selesai! Skor kamu: ${totalScore}/${questions.length * 10}\n\nProgress sudah tersimpan!`)
      window.location.href = '/dashboard'
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading soal...</div>
  }

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">Tidak ada soal tersedia</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Challenge 📚</h1>
            <p className="text-gray-600">Soal {currentIndex + 1} dari {questions.length}</p>
          </div>
          <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
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
            variant="outline" 
            onClick={() => setShowHint(!showHint)}
            disabled={showSolution}
          >
            {showHint ? 'Sembunyikan' : 'Lihat'} Petunjuk
          </Button>
          <Button 
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
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← Sebelumnya
          </Button>
          
          {currentIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              Selesai & Submit
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Selanjutnya →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
