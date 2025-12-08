import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TryOutData } from '@/lib/dashboard-api'
import { calculate3LayerBreakdown, formatDateReadable } from '@/lib/dashboard-calculations'

interface TryOutTabProps {
  data: TryOutData[]
  loading?: boolean
}

export function TryOutTab({ data, loading }: TryOutTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Mini Try Out</CardTitle>
          <CardDescription>Belum ada riwayat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum ada Mini Try Out
            </h3>
            <p className="text-gray-600 mb-6">
              Mini Try Out adalah latihan cepat 70 soal (10 per subtest) untuk persiapan berkala!
            </p>
            <button
              onClick={() => window.location.href = '/mini-tryout'}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Mulai Mini Try Out
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate overall stats
  const totalTryOuts = data.length
  const totalQuestions = data.reduce((sum, t) => 
    sum + t.subtestScores.reduce((s, sub) => s + sub.total, 0), 0)
  const totalCorrect = data.reduce((sum, t) => sum + t.totalScore, 0)
  const avgAccuracy = Math.round((totalCorrect / totalQuestions) * 100)
  const avgScore = Math.round(totalCorrect / totalTryOuts)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Mini Try Out</p>
              <p className="text-3xl font-bold text-purple-600">{totalTryOuts}</p>
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
              <p className="text-sm text-gray-600 mb-1">Rata-rata Skor</p>
              <p className="text-3xl font-bold text-purple-600">{avgScore}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Akurasi</p>
              <p className={`text-3xl font-bold ${
                avgAccuracy >= 70 ? 'text-green-600' :
                avgAccuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {avgAccuracy}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mini Try Out History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Mini Try Out ⚡</CardTitle>
          <CardDescription>
            {data.length} mini try out sudah selesai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((tryout, idx) => {
              const breakdown = calculate3LayerBreakdown(
                tryout.directAnswers,
                tryout.hintUsed,
                tryout.solutionViewed
              )
              
              // Sort subtests by standard order
              const subtestOrder = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
              const sortedSubtests = [...tryout.subtestScores].sort((a, b) => {
                const indexA = subtestOrder.indexOf(a.subtest)
                const indexB = subtestOrder.indexOf(b.subtest)
                return indexA - indexB
              })

              return (
                <div
                  key={idx}
                  className="p-5 border-2 rounded-xl hover:shadow-lg transition-all bg-gradient-to-br from-white to-purple-50/30"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-lg text-gray-900">
                        {formatDateReadable(tryout.date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Skor: {tryout.totalScore} | Akurasi: {tryout.accuracy}%
                      </p>
                    </div>
                    <Badge
                      className={
                        tryout.accuracy >= 70
                          ? 'bg-green-500 hover:bg-green-600'
                          : tryout.accuracy >= 50
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }
                    >
                      {tryout.accuracy}%
                    </Badge>
                  </div>

                  {/* Subtest Breakdown */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Breakdown per Subtest:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {sortedSubtests.map((subtest, sidx) => (
                        <div
                          key={sidx}
                          className={`text-xs p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                            subtest.accuracy >= 70
                              ? 'bg-green-50 border-green-200'
                              : subtest.accuracy >= 50
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <p className="font-bold text-gray-900 mb-1">{subtest.subtest}</p>
                          <p className="text-gray-700 font-semibold">
                            {subtest.score}/{subtest.total}
                          </p>
                          <p className={`text-xs font-bold ${
                            subtest.accuracy >= 70 ? 'text-green-600' :
                            subtest.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {subtest.accuracy}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Layer Breakdown */}
                  <div className="flex gap-4 text-xs text-gray-600 pt-3 border-t">
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

      {/* Subtest Performance Summary */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performa per Subtest 📊</CardTitle>
            <CardDescription>
              Rata-rata akurasi di setiap subtest (Mini Try Out)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'].map(subtestName => {
                // Calculate average for this subtest across all mini try outs
                const subtestData = data
                  .flatMap(t => t.subtestScores)
                  .filter(s => s.subtest === subtestName)
                
                if (subtestData.length === 0) return null

                const totalQuestions = subtestData.reduce((sum, s) => sum + s.total, 0)
                const totalCorrect = subtestData.reduce((sum, s) => sum + s.score, 0)
                const avgAccuracy = Math.round((totalCorrect / totalQuestions) * 100)

                return (
                  <div key={subtestName} className="flex items-center gap-4">
                    <div className="w-24 font-semibold text-gray-900">{subtestName}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            avgAccuracy >= 70 ? 'bg-green-500' :
                            avgAccuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${avgAccuracy}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right font-bold text-gray-900">
                      {avgAccuracy}%
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
