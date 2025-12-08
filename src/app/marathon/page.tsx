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
  subtest_utbk: string
}

const SUBTESTS = [
  { code: 'PU', name: 'Penalaran Umum', duration: 20 },
  { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', duration: 15 },
  { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', duration: 25 },
  { code: 'PK', name: 'Pengetahuan Kuantitatif', duration: 20 },
  { code: 'LIT_INDO', name: 'Literasi Bahasa Indonesia', duration: 30 },
  { code: 'LIT_ING', name: 'Literasi Bahasa Inggris', duration: 30 },
  { code: 'PM', name: 'Penalaran Matematika', duration: 30 },
]

export default function MarathonPage() {
  const [started, setStarted] = useState(false)
  const [currentSubtest, setCurrentSubtest] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (started && timeLeft === 0) {
      handleNextSubtest()
    }
  }, [started, timeLeft])

  const loadQuestions = async () => {
    setLoading(true)
    const allQuestions: Question[] = []
    
    for (const subtest of SUBTESTS) {
      const { data } = await supabase
        .from('question_bank')
        .select('*')
        .eq('subtest_utbk', subtest.code)
        .limit(10)
      
      if (data) {
        allQuestions.push(...data)
      }
    }
    
    setQuestions(allQuestions)
    setLoading(false)
  }

  // This useEffect to check role
  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (userData?.role === 'teacher') {
        alert('Marathon Mode hanya untuk siswa!')
        window.location.href = '/teacher'
      }
    }
  }


  const handleStart = async () => {
    await loadQuestions()
    setStarted(true)
    setTimeLeft(SUBTESTS[0].duration * 60)
  }

  const handleAnswer = (answer: string) => {
    const questionId = questions[currentQuestion]?.id
    if (questionId) {
      setAnswers({ ...answers, [questionId]: answer })
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      
      // Check if moving to next subtest
      const nextQ = questions[currentQuestion + 1]
      const currentQ = questions[currentQuestion]
      if (nextQ.subtest_utbk !== currentQ.subtest_utbk) {
        const nextSubtestIndex = SUBTESTS.findIndex(s => s.code === nextQ.subtest_utbk)
        setCurrentSubtest(nextSubtestIndex)
        setTimeLeft(SUBTESTS[nextSubtestIndex].duration * 60)
      }
    } else {
      handleFinish()
    }
  }

  const handleNextSubtest = () => {
    if (currentSubtest < SUBTESTS.length - 1) {
      // Find first question of next subtest
      const nextSubtestCode = SUBTESTS[currentSubtest + 1].code
      const nextQuestionIndex = questions.findIndex(q => q.subtest_utbk === nextSubtestCode)
      
      if (nextQuestionIndex !== -1) {
        setCurrentQuestion(nextQuestionIndex)
        setCurrentSubtest(currentSubtest + 1)
        setTimeLeft(SUBTESTS[currentSubtest + 1].duration * 60)
      }
    } else {
      handleFinish()
    }
  }

  const handleFinish = async () => {
    let totalScore = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        totalScore += 10
      }
    })
    setScore(totalScore)
    setFinished(true)
    
    // Save to database
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const progressData = questions.map(q => ({
        student_id: user.id,
        question_id: q.id,
        selected_answer: answers[q.id] || 'skip',
        is_correct: answers[q.id] === q.correct_answer,
        score: answers[q.id] === q.correct_answer ? 10 : 0,
        time_spent_seconds: 60,
        hint_accessed: false,
        solution_accessed: false,
      }))
      
      await supabase.from('student_progress').insert(progressData)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading soal...</div>
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Marathon Mode Selesai! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {score}/{questions.length * 10}
            </div>
            <p className="text-gray-600 mb-6">
              Akurasi: {Math.round((score / (questions.length * 10)) * 100)}%
            </p>
              <Button onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                  const { data: userData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                  
                  if (userData?.role === 'teacher') {
                    window.location.href = '/teacher'
                  } else {
                    window.location.href = '/dashboard'
                  }
                }
              }}>
                Kembali ke Dashboard
              </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Marathon Mode - Simulasi UTBK 🏃</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Simulasi UTBK lengkap dengan 7 subtest dan 70 soal total.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">⚠️ Perhatian:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Total durasi: ~170 menit (2 jam 50 menit)</li>
                  <li>• Tidak bisa keluar di tengah jalan</li>
                  <li>• Timer per subtest, auto-advance</li>
                  <li>• Feedback hanya di akhir</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">7 Subtest:</h3>
                {SUBTESTS.map((subtest, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                    <span>{idx + 1}. {subtest.name}</span>
                    <span className="text-gray-600">{subtest.duration} menit</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button onClick={handleStart} className="w-full" size="lg">
              Mulai Marathon Mode
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  if (!currentQ) return null

  const options = [
    { label: 'A', text: currentQ.option_a },
    { label: 'B', text: currentQ.option_b },
    { label: 'C', text: currentQ.option_c },
    { label: 'D', text: currentQ.option_d },
    { label: 'E', text: currentQ.option_e },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="font-bold">{SUBTESTS[currentSubtest].name}</h2>
              <p className="text-sm text-gray-600">
                Soal {currentQuestion + 1} dari {questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-gray-600">Waktu tersisa</p>
            </div>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">{currentQ.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleAnswer(option.label)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQ.id] === option.label
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
        <div className="flex justify-between">
          <Button variant="outline" disabled>
            ← Sebelumnya
          </Button>
          <Button onClick={handleNext}>
            {currentQuestion === questions.length - 1 ? 'Selesai' : 'Selanjutnya →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
