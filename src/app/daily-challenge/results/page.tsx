'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UTBK_2026_SUBTESTS } from '@/lib/utbk-constants'
import type { DailyChallengeMode, SubtestCode } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { checkAndUnlockAchievements } from '@/lib/achievement-checker'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'

interface SubtestResult {
  subtestCode: SubtestCode
  subtestName: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
}

function DailyChallengeResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [mode] = useState<DailyChallengeMode | null>(() => searchParams.get('mode') as DailyChallengeMode)
  const [subtestCode] = useState<SubtestCode | null>(() => searchParams.get('subtest') as SubtestCode)
  const [totalScore] = useState<number>(() => parseInt(searchParams.get('score') || '0'))
  const [totalQuestions] = useState<number>(() => parseInt(searchParams.get('questions') || '0'))
  const [accuracy] = useState<number>(() => parseInt(searchParams.get('accuracy') || '0'))
  const [coins] = useState<number>(() => parseInt(searchParams.get('coins') || '0'))
  const [subtestResults] = useState<SubtestResult[]>(() => {
    const resultsParam = searchParams.get('results')
    if (!resultsParam) return []
    try {
      return JSON.parse(decodeURIComponent(resultsParam))
    } catch {
      return []
    }
  })

  const checkAchievements = useCallback(async (finalAccuracy: number, totalQuestions: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const battleResult = {
          score: totalScore,
          accuracy: finalAccuracy,
          rank: 1,
          correctAnswers: Math.round(totalQuestions * finalAccuracy / 100),
          totalQuestions: totalQuestions,
          timeTakenSeconds: 0,
          isHots: false
        }
        await checkAndUnlockAchievements(session.user.id, battleResult, session)
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }, [totalScore])
  
  useEffect(() => {
    checkAchievements(accuracy, totalQuestions)
  }, [accuracy, totalQuestions, checkAchievements])
  
  useEffect(() => {
    if (coins && coins > 0) {
      toast.success(`Kamu mendapatkan +${coins} Coin`)
    }
  }, [coins])

  const getSubtestName = (code: SubtestCode) => {
    return UTBK_2026_SUBTESTS.find(s => s.code === code)?.name || code
  }

  const getSubtestIcon = (code: SubtestCode) => {
    return UTBK_2026_SUBTESTS.find(s => s.code === code)?.icon || '📚'
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Kognisia</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/daily-challenge">Daily Challenge</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Hasil</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Daily Challenge Selesai!
          </h1>
          <p className="text-muted-foreground">
            {mode === 'balanced' ? 'Mode: Balanced (Semua Subtest)' : `Mode: Focus (${subtestCode ? getSubtestName(subtestCode) : ''})`}
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-xl">Skor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {totalScore}/{totalQuestions * 10}
              </div>
              <div className="text-2xl font-semibold mb-4">
                <span className={`${
                  accuracy >= 70 ? 'text-green-600' :
                  accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {accuracy}% Akurasi
                </span>
              </div>
              <p className="text-muted-foreground">
                {totalQuestions - Math.round(totalQuestions * accuracy / 100)} soal salah dari {totalQuestions} soal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Per-Subtest Breakdown for Balanced Mode */}
        {mode === 'balanced' && subtestResults.length > 0 && (
          <Card className="mb-6 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Breakdown Per Subtest 📊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subtestResults.map((result) => (
                  <div key={result.subtestCode} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getSubtestIcon(result.subtestCode)}</span>
                        <div>
                          <p className="font-semibold text-foreground">{result.subtestName}</p>
                          <p className="text-sm text-muted-foreground">
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
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          result.accuracy >= 70 ? 'bg-green-500' :
                          result.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Single Subtest Performance for Focus Mode */}
        {mode === 'focus' && subtestCode && (
          <Card className="mb-6 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{getSubtestIcon(subtestCode)}</span>
                <span>Performa {getSubtestName(subtestCode)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Soal Benar</span>
                  <span className="font-bold text-foreground">
                    {Math.round(totalQuestions * accuracy / 100)}/{totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Akurasi</span>
                  <span className={`font-bold ${
                    accuracy >= 70 ? 'text-green-600' :
                    accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {accuracy}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      accuracy >= 70 ? 'bg-green-500' :
                      accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insight Card */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-semibold text-foreground mb-1">Insight:</p>
                <p className="text-muted-foreground">
                  {accuracy >= 80
                    ? 'Luar biasa! Kamu menguasai materi dengan sangat baik. Pertahankan!'
                    : accuracy >= 70
                    ? 'Bagus! Kamu sudah cukup menguasai materi. Terus tingkatkan!'
                    : accuracy >= 50
                    ? 'Cukup baik! Masih ada ruang untuk improvement. Terus berlatih!'
                    : 'Jangan menyerah! Gunakan hint dan solusi untuk belajar, lalu coba lagi.'}
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
            onClick={() => router.push('/daily-challenge')}
          >
            Latihan Lagi
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DailyChallengeResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DailyChallengeResultsContent />
    </Suspense>
  )
}
