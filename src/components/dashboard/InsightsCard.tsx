import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SubtestInsight {
  subtest: string
  accuracy: number
  totalQuestions: number
}

interface InsightsCardProps {
  strongest: SubtestInsight | null
  weakest: SubtestInsight | null
  loading?: boolean
}

export function InsightsCard({ strongest, weakest, loading }: InsightsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insight Kamu 💡</CardTitle>
          <CardDescription>Memuat analisis performa...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-32"></div>
            <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!strongest || !weakest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insight Kamu 💡</CardTitle>
          <CardDescription>Belum ada data untuk analisis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Mulai latihan untuk melihat insight performa kamu!</p>
            <p className="text-sm">Kerjakan Daily Challenge atau Marathon untuk mendapatkan analisis mendalam.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPerformanceMessage = (accuracy: number): string => {
    if (accuracy >= 80) return 'Luar biasa! Pertahankan! 🎉'
    if (accuracy >= 70) return 'Bagus! Terus tingkatkan! 💪'
    if (accuracy >= 50) return 'Cukup baik, ayo semangat! 📚'
    return 'Yuk perbaiki dengan latihan! 🚀'
  }

  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Insight Kamu 💡
        </CardTitle>
        <CardDescription>
          Analisis performa berdasarkan subtest yang sudah dikerjakan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strongest Subtest */}
          <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Subtest Terkuat</p>
              <span className="text-3xl">🏆</span>
            </div>
            <p className="text-2xl font-bold text-green-700 mb-2">
              {strongest.subtest}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-green-600 hover:bg-green-700">
                {strongest.accuracy}% akurasi
              </Badge>
              <span className="text-xs text-gray-600">
                {strongest.totalQuestions} soal
              </span>
            </div>
            <p className="text-xs text-green-700 font-medium">
              {getPerformanceMessage(strongest.accuracy)}
            </p>
          </div>

          {/* Weakest Subtest */}
          <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Perlu Ditingkatkan</p>
              <span className="text-3xl">📈</span>
            </div>
            <p className="text-2xl font-bold text-orange-700 mb-2">
              {weakest.subtest}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-orange-600 hover:bg-orange-700">
                {weakest.accuracy}% akurasi
              </Badge>
              <span className="text-xs text-gray-600">
                {weakest.totalQuestions} soal
              </span>
            </div>
            <p className="text-xs text-orange-700 font-medium">
              {getPerformanceMessage(weakest.accuracy)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
