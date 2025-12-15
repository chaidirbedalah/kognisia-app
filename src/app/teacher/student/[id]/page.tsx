'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'

type TopicProgress = {
  topic_name: string
  subject: string
  total_questions: number
  correct_answers: number
  accuracy: number
}

type RecentAnswer = {
  question_text: string
  selected_answer: string
  correct_answer: string
  is_correct: boolean
  topic_name: string
  answered_at: string
}

type StudentInfo = {
  id: string
  full_name: string
  email: string
}


export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([])
  const [recentAnswers, setRecentAnswers] = useState<RecentAnswer[]>([])
  const [loading, setLoading] = useState(true)

  const loadStudentDetail = useCallback(async () => {
    // Get student info
    const { data: studentData } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('id', studentId)
      .single()

    setStudent(studentData)

    // Get progress by topic
    const { data: progressData } = await supabase
      .from('student_progress')
      .select(`
        *,
        question_bank!inner(
          topic_id,
          topics!inner(name, subject)
        )
      `)
      .eq('student_id', studentId)

    if (progressData) {
      // Group by topic
      const topicMap = new Map<string, TopicProgress>()
      
      progressData.forEach((p) => {
        const qb = (p as Record<string, unknown>).question_bank as Record<string, unknown>
        const rawTopics = qb?.topics as unknown
        let topicName = ''
        let subject = ''
        if (Array.isArray(rawTopics) && rawTopics.length > 0) {
          const t0 = rawTopics[0] as Record<string, unknown>
          topicName = typeof t0.name === 'string' ? t0.name : ''
          subject = typeof t0.subject === 'string' ? t0.subject : ''
        } else if (rawTopics && typeof (rawTopics as Record<string, unknown>).name === 'string') {
          const t = rawTopics as Record<string, unknown>
          topicName = String(t.name)
          subject = typeof t.subject === 'string' ? String(t.subject) : ''
        }
        
        if (!topicMap.has(topicName)) {
          topicMap.set(topicName, {
            topic_name: topicName,
            subject: subject,
            total_questions: 0,
            correct_answers: 0,
            accuracy: 0
          })
        }
        
        const topic = topicMap.get(topicName)!
        topic.total_questions++
        const isCorrect = Boolean((p as Record<string, unknown>).is_correct)
        if (isCorrect) topic.correct_answers++
      })

      const topics = Array.from(topicMap.values()).map(t => ({
        ...t,
        accuracy: Math.round((t.correct_answers / t.total_questions) * 100)
      }))

      setTopicProgress(topics)

      // Get recent 10 answers
      const { data: recentData } = await supabase
        .from('student_progress')
        .select(`
          selected_answer,
          is_correct,
          created_at,
          question_bank!inner(
            question_text,
            correct_answer,
            topics!inner(name)
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentData) {
        const recent = (recentData as unknown[]).map((r) => {
          const obj = r as Record<string, unknown>
          const qb = obj.question_bank as Record<string, unknown>
          const topics = qb?.topics as unknown
          let topicName = ''
          if (Array.isArray(topics) && topics.length > 0) {
            const t0 = topics[0] as Record<string, unknown>
            topicName = typeof t0.name === 'string' ? t0.name : ''
          } else if (topics && typeof (topics as Record<string, unknown>).name === 'string') {
            topicName = String((topics as Record<string, unknown>).name)
          }
          return {
            question_text: String(qb?.question_text ?? ''),
            selected_answer: String(obj.selected_answer ?? ''),
            correct_answer: String(qb?.correct_answer ?? ''),
            is_correct: Boolean(obj.is_correct),
            topic_name: topicName,
            answered_at: new Date(String(obj.created_at)).toLocaleString('id-ID')
          } as RecentAnswer
        })
        setRecentAnswers(recent)
      }
    }

    setLoading(false)
  }, [studentId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStudentDetail()
    }, 0)
    return () => clearTimeout(timeout)
  }, [loadStudentDetail])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!student) {
    return <div className="min-h-screen flex items-center justify-center">Siswa tidak ditemukan</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              ← Kembali
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = '/teacher/classes')}
            >
              Manajemen Kelas
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/teacher">Kognisia Teacher</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/teacher">Siswa</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{student.full_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* Student Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {student.full_name}
          </h1>
          <p className="text-gray-600">{student.email}</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Soal Dikerjakan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {topicProgress.reduce((sum, t) => sum + t.total_questions, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Jawaban Benar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {topicProgress.reduce((sum, t) => sum + t.correct_answers, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Akurasi Keseluruhan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {topicProgress.length > 0
                  ? Math.round(
                      (topicProgress.reduce((sum, t) => sum + t.correct_answers, 0) /
                        topicProgress.reduce((sum, t) => sum + t.total_questions, 0)) *
                        100
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress by Topic */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progress per Topik</CardTitle>
            <CardDescription>
              Performa siswa di setiap topik pembelajaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topicProgress.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{topic.topic_name}</h3>
                    <p className="text-sm text-gray-600">{topic.subject}</p>
                  </div>
                  <div className="text-right mr-4">
                    <div className="text-2xl font-bold text-gray-900">{topic.accuracy}%</div>
                    <p className="text-xs text-gray-500">
                      {topic.correct_answers}/{topic.total_questions} benar
                    </p>
                  </div>
                  <Badge
                    className={
                      topic.accuracy >= 70
                        ? 'bg-green-500'
                        : topic.accuracy >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }
                  >
                    {topic.accuracy >= 70 ? 'Kuat' : topic.accuracy >= 50 ? 'Cukup' : 'Lemah'}
                  </Badge>
                </div>
              ))}

              {topicProgress.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data progress
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Answers */}
        <Card>
          <CardHeader>
            <CardTitle>10 Jawaban Terakhir</CardTitle>
            <CardDescription>
              Riwayat jawaban terbaru siswa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnswers.map((answer, idx) => (
                <div
                  key={idx}
                  className={`p-4 border rounded-lg ${
                    answer.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {answer.topic_name}
                    </Badge>
                    <span className="text-xs text-gray-500">{answer.answered_at}</span>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{answer.question_text}</p>
                  <div className="flex gap-4 text-xs">
                    <span className={answer.is_correct ? 'text-green-700' : 'text-red-700'}>
                      Jawaban: <strong>{answer.selected_answer}</strong>
                    </span>
                    {!answer.is_correct && (
                      <span className="text-green-700">
                        Benar: <strong>{answer.correct_answer}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
