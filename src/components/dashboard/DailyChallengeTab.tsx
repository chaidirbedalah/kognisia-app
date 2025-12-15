import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DailyChallengeData } from '@/lib/dashboard-api'
import { calculate3LayerBreakdown, formatDateReadable } from '@/lib/dashboard-calculations'

interface DailyChallengeTabProps {
  data: DailyChallengeData[]
  loading?: boolean
}

export function DailyChallengeTab({ data, loading }: DailyChallengeTabProps) {
  if (loading) {
    return (
      <div data-testid="daily-challenge-tab" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <Card data-testid="daily-challenge-empty">
        <CardHeader>
          <CardTitle>Riwayat Daily Challenge</CardTitle>
          <CardDescription>Belum ada riwayat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum ada Daily Challenge
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai Daily Challenge pertama kamu dan jaga streak!
            </p>
            <button
              onClick={() => window.location.href = '/daily-challenge'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mulai Sekarang
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate overall stats
  const totalDays = data.length
  const totalQuestions = data.reduce((sum, d) => sum + d.totalQuestions, 0)
  const totalCorrect = data.reduce((sum, d) => sum + d.correctAnswers, 0)
  const overallAccuracy = Math.round((totalCorrect / totalQuestions) * 100)
  
  const totalDirect = data.reduce((sum, d) => sum + d.directAnswers, 0)
  const totalHint = data.reduce((sum, d) => sum + d.hintUsed, 0)
  const totalSolution = data.reduce((sum, d) => sum + d.solutionViewed, 0)
  const layerBreakdown = calculate3LayerBreakdown(totalDirect, totalHint, totalSolution)

  return (
    <div data-testid="daily-challenge-tab" className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Hari</p>
              <p className="text-3xl font-bold text-blue-600">{totalDays}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Soal</p>
              <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Akurasi</p>
              <p className={`text-3xl font-bold ${
                overallAccuracy >= 70 ? 'text-green-600' :
                overallAccuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {overallAccuracy}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Jawab Langsung</p>
              <p className="text-3xl font-bold text-purple-600">{layerBreakdown.directPercentage}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layer Breakdown Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown 3-Layer System 🎯</CardTitle>
          <CardDescription>
            Cara kamu menjawab soal Daily Challenge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Direct Answer */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span className="font-medium">Jawab Langsung</span>
                </div>
                <span className="font-bold text-green-600">{layerBreakdown.directPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${layerBreakdown.directPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {layerBreakdown.directCount} soal (10 poin per soal)
              </p>
            </div>

            {/* With Hint */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  <span className="font-medium">Dengan Hint</span>
                </div>
                <span className="font-bold text-yellow-600">{layerBreakdown.hintPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${layerBreakdown.hintPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {layerBreakdown.hintCount} soal (7 poin per soal)
              </p>
            </div>

            {/* With Solution */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📖</span>
                  <span className="font-medium">Lihat Solusi</span>
                </div>
                <span className="font-bold text-blue-600">{layerBreakdown.solutionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${layerBreakdown.solutionPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {layerBreakdown.solutionCount} soal (4 poin per soal)
              </p>
            </div>
          </div>

          {/* Insight Message */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-900 mb-1">💡 Insight:</p>
            <p className="text-sm text-gray-700">
              {layerBreakdown.directPercentage >= 60
                ? 'Luar biasa! Kamu sering menjawab langsung tanpa bantuan. Pertahankan!'
                : layerBreakdown.directPercentage >= 40
                ? 'Bagus! Coba tingkatkan jawaban langsung dengan lebih banyak latihan.'
                : 'Terus berlatih! Gunakan hint dan solusi untuk belajar, lalu coba jawab langsung.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card data-testid="daily-challenge-history">
        <CardHeader>
          <CardTitle>Riwayat Daily Challenge 📅</CardTitle>
          <CardDescription>
            {data.length} hari sudah mengerjakan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.slice(0, 30).map((day, idx) => {
              const breakdown = calculate3LayerBreakdown(
                day.directAnswers,
                day.hintUsed,
                day.solutionViewed
              )
              
              // Determine mode based on question count (Requirement 9.4)
              const mode = day.totalQuestions === 21 ? 'balanced' : day.totalQuestions === 10 ? 'focus' : 'unknown'
              const modeLabel = mode === 'balanced' ? 'Balanced (7 Subtest)' : mode === 'focus' ? 'Focus (1 Subtest)' : `${day.totalQuestions} soal`
              
              return (
                <div
                  key={idx}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatDateReadable(day.date)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600">
                          {day.correctAnswers}/{day.totalQuestions} benar
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {modeLabel}
                        </Badge>
                      </div>
                    </div>
                    <Badge
                      className={
                        day.accuracy >= 70
                          ? 'bg-green-500 hover:bg-green-600'
                          : day.accuracy >= 50
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }
                    >
                      {day.accuracy}%
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <span>🎯</span>
                      <span>Langsung: {breakdown.directPercentage}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>💡</span>
                      <span>Hint: {breakdown.hintPercentage}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📖</span>
                      <span>Solusi: {breakdown.solutionPercentage}%</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
