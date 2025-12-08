'use client'

/**
 * Mini Try Out Results Page
 * 
 * Displays comprehensive results with per-subtest breakdown
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle2,
  XCircle,
  Home,
  RotateCcw
} from 'lucide-react'

interface SubtestResult {
  subtestCode: string
  subtestName: string
  correct: number
  total: number
  accuracy: number
}

interface Results {
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  totalTimeSeconds: number
  recommendedTimeSeconds: number
  subtestBreakdown: SubtestResult[]
  strongest: SubtestResult
  weakest: SubtestResult
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [results, setResults] = useState<Results | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, fetch results from API using sessionId
    // For now, get from sessionStorage (set by submit endpoint)
    const storedResults = sessionStorage.getItem(`mini-tryout-results-${sessionId}`)
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    }
    setIsLoading(false)
  }, [sessionId])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimingBadge = (actual: number, recommended: number) => {
    const diff = actual - recommended
    if (diff < -300) {
      return { text: 'Lebih Cepat', variant: 'default' as const, icon: TrendingUp }
    } else if (diff > 300) {
      return { text: 'Lebih Lambat', variant: 'destructive' as const, icon: TrendingDown }
    } else {
      return { text: 'Tepat Waktu', variant: 'secondary' as const, icon: CheckCircle2 }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat hasil...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Hasil Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">
              Maaf, kami tidak dapat menemukan hasil Mini Try Out kamu.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const timingBadge = getTimingBadge(results.totalTimeSeconds, results.recommendedTimeSeconds)
  const TimingIcon = timingBadge.icon

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Hasil Mini Try Out UTBK</h1>
          <p className="text-gray-600">Berikut adalah hasil lengkap Mini Try Out kamu</p>
        </div>

        {/* Overall Score Card (Requirement 8.1) */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-8">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {results.accuracy.toFixed(1)}%
              </div>
              <p className="text-xl text-gray-600 mb-4">Akurasi Keseluruhan</p>
              <div className="flex items-center justify-center gap-8 text-sm">
                <div>
                  <span className="text-2xl font-bold text-green-600">
                    {results.correctAnswers}
                  </span>
                  <span className="text-gray-600"> / {results.totalQuestions} benar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-lg font-semibold">
                    {formatTime(results.totalTimeSeconds)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timing Comparison (Requirement 8.5) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Perbandingan Waktu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Waktu Kamu</p>
                <p className="text-2xl font-bold">{formatTime(results.totalTimeSeconds)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Waktu Rekomendasi</p>
                <p className="text-2xl font-bold">{formatTime(results.recommendedTimeSeconds)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge variant={timingBadge.variant} className="text-base px-3 py-1">
                  <TimingIcon className="w-4 h-4 mr-1" />
                  {timingBadge.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strongest & Weakest Subtests (Requirements 8.3, 8.4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strongest */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                Subtes Terkuat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-xl font-bold mb-2">{results.strongest.subtestName}</p>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {results.strongest.accuracy.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  {results.strongest.correct} dari {results.strongest.total} soal benar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weakest */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <TrendingDown className="w-5 h-5" />
                Subtes Terlemah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-xl font-bold mb-2">{results.weakest.subtestName}</p>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {results.weakest.accuracy.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  {results.weakest.correct} dari {results.weakest.total} soal benar
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  💡 Fokuskan latihan di subtes ini
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Per-Subtest Breakdown (Requirement 8.2) */}
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Per Subtes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.subtestBreakdown.map((subtest) => (
                <div key={subtest.subtestCode} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{subtest.subtestName}</p>
                      <p className="text-sm text-gray-600">
                        {subtest.correct} / {subtest.total} benar
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {subtest.accuracy.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={subtest.accuracy} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons (Requirement 8.6) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Button>
          <Button
            onClick={() => router.push('/mini-tryout')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function MiniTryOutResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat hasil...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
