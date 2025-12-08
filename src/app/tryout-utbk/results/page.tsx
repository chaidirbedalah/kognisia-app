'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UTBK_2026_SUBTESTS } from '@/lib/utbk-constants'
import type { SubtestCode } from '@/lib/types'

interface SubtestResult {
  subtestCode: SubtestCode
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  actualMinutes: number
  recommendedMinutes: number
  timeDifference: number
  isFaster: boolean
  isSlower: boolean
}

export default function TryOutUTBKResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [totalScore, setTotalScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [totalTimeMinutes, setTotalTimeMinutes] = useState(0)
  const [subtestResults, setSubtestResults] = useState<SubtestResult[]>([])
  const [strongest, setStrongest] = useState<SubtestResult | null>(null)
  const [weakest, setWeakest] = useState<SubtestResult | null>(null)

  useEffect(() => {
    // Get results from URL params
    const scoreParam = searchParams.get('score')
    const questionsParam = searchParams.get('questions')
    const accuracyParam = searchParams.get('accuracy')
    const timeParam = searchParams.get('time')
    const resultsParam = searchParams.get('results')
    const strongestParam = searchParams.get('strongest')
    const weakestParam = searchParams.get('weakest')

    if (scoreParam) setTotalScore(parseInt(scoreParam))
    if (questionsParam) setTotalQuestions(parseInt(questionsParam))
    if (accuracyParam) setAccuracy(parseInt(accuracyParam))
    if (timeParam) setTotalTimeMinutes(parseInt(timeParam))
    
    if (resultsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(resultsParam))
        setSubtestResults(parsed)
      } catch (e) {
        console.error('Failed to parse results:', e)
      }
    }

    if (strongestParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(strongestParam))
        setStrongest(parsed)
      } catch (e) {
        console.error('Failed to parse strongest:', e)
      }
    }

    if (weakestParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(weakestParam))
        setWeakest(parsed)
      } catch (e) {
        console.error('Failed to parse weakest:', e)
      }
    }
  }, [searchParams])

  const getSubtestName = (code: SubtestCode) => {
    return UTBK_2026_SUBTESTS.find(s => s.code === code)?.name || code
  }

  const getSubtestIcon = (code: SubtestCode) => {
    return UTBK_2026_SUBTESTS.find(s => s.code === code)?.icon || '📚'
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}j ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Try Out UTBK Selesai!
          </h1>
          <p className="text-gray-600">
            Simulasi lengkap UTBK 2026 dengan 160 soal
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center">Skor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {totalScore}/{totalQuestions * 10}
              </div>
              <div className="text-2xl font-semibold mb-2">
                <span className={`${
                  accuracy >= 70 ? 'text-green-600' :
                  accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {accuracy}% Akurasi
                </span>
              </div>
              <p className="text-gray-600 mb-2">
                {Math.round(totalQuestions * accuracy / 100)} benar dari {totalQuestions} soal
              </p>
              <p className="text-sm text-gray-500">
                ⏱️ Waktu: {formatTime(totalTimeMinutes)} dari 195 menit
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Strongest & Weakest Subtests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Strongest */}
          {strongest && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>💪</span>
                  <span>Subtest Terkuat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getSubtestIcon(strongest.subtestCode)}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{getSubtestName(strongest.subtestCode)}</p>
                    <p className="text-sm text-gray-600">
                      {strongest.correctAnswers}/{strongest.totalQuestions} benar
                    </p>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    {strongest.accuracy}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weakest */}
          {weakest && (
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>📈</span>
                  <span>Perlu Ditingkatkan</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getSubtestIcon(weakest.subtestCode)}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{getSubtestName(weakest.subtestCode)}</p>
                    <p className="text-sm text-gray-600">
                      {weakest.correctAnswers}/{weakest.totalQuestions} benar
                    </p>
                  </div>
                  <Badge className="bg-orange-600 hover:bg-orange-700">
                    {weakest.accuracy}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Per-Subtest Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Breakdown Per Subtest 📊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subtestResults.map((result) => (
                <div key={result.subtestCode} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{getSubtestIcon(result.subtestCode)}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{getSubtestName(result.subtestCode)}</p>
                        <p className="text-sm text-gray-600">
                          {result.correctAnswers}/{result.totalQuestions} benar
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        result.accuracy >= 70
                          ? 'bg-green-500 hover:bg-green-600'
                          : result.accuracy >= 50
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }
                    >
                      {result.accuracy}%
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        result.accuracy >= 70 ? 'bg-green-500' :
                        result.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.accuracy}%` }}
                    />
                  </div>

                  {/* Timing Comparison */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Waktu:</span>
                      <span className="font-medium">{formatTime(result.actualMinutes)}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-gray-600">{formatTime(result.recommendedMinutes)} (rekomendasi)</span>
                    </div>
                    {result.isFaster && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ⚡ {Math.abs(result.timeDifference)}m lebih cepat
                      </Badge>
                    )}
                    {result.isSlower && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        🐢 {Math.abs(result.timeDifference)}m lebih lambat
                      </Badge>
                    )}
                    {!result.isFaster && !result.isSlower && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        ✓ Tepat waktu
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insight Card */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Insight:</p>
                <p className="text-gray-700">
                  {accuracy >= 70
                    ? 'Luar biasa! Kamu siap menghadapi UTBK. Pertahankan performa ini!'
                    : accuracy >= 50
                    ? 'Bagus! Fokus tingkatkan subtest yang lemah dengan latihan lebih banyak.'
                    : 'Terus berlatih! Gunakan Try Out ini sebagai pembelajaran untuk UTBK nanti.'}
                  {weakest && ` Prioritaskan latihan ${getSubtestName(weakest.subtestCode)} untuk hasil maksimal.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Lihat Dashboard
          </Button>
          <Button
            onClick={() => router.push('/tryout-utbk')}
          >
            Try Out Lagi
          </Button>
        </div>
      </div>
    </div>
  )
}
