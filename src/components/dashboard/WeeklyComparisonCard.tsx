import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface WeeklyComparisonProps {
  thisWeek: {
    totalQuestions: number
    accuracy: number
  }
  lastWeek: {
    totalQuestions: number
    accuracy: number
  }
  improvement: number
  improvementPercentage: number
  loading?: boolean
}

export function WeeklyComparisonCard({ 
  thisWeek, 
  lastWeek, 
  improvement, 
  improvementPercentage,
  loading 
}: WeeklyComparisonProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minggu Ini vs Minggu Lalu 📊</CardTitle>
          <CardDescription>Memuat perbandingan...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-28"></div>
            <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-28"></div>
            <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-28"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (thisWeek.totalQuestions === 0 && lastWeek.totalQuestions === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minggu Ini vs Minggu Lalu 📊</CardTitle>
          <CardDescription>Belum ada data untuk perbandingan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Mulai latihan minggu ini untuk melihat progress kamu!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getImprovementIcon = () => {
    if (improvement > 0) return '📈'
    if (improvement < 0) return '📉'
    return '➡️'
  }

  const getImprovementMessage = () => {
    if (improvement > 0) return 'Meningkat! Pertahankan! 🎉'
    if (improvement < 0) return 'Ayo semangat lagi! 💪'
    return 'Konsisten! 👍'
  }

  const getImprovementColor = () => {
    if (improvement > 0) return 'text-green-600'
    if (improvement < 0) return 'text-orange-600'
    return 'text-gray-600'
  }

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Minggu Ini vs Minggu Lalu 📊
        </CardTitle>
        <CardDescription>
          Perbandingan performa 7 hari terakhir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* This Week */}
          <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-gray-700 mb-3">Minggu Ini</p>
            <p className="text-4xl font-bold text-blue-600 mb-2">{thisWeek.accuracy}%</p>
            <p className="text-xs text-gray-600">
              {thisWeek.totalQuestions} soal dikerjakan
            </p>
          </div>

          {/* Last Week */}
          <div className="text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-gray-700 mb-3">Minggu Lalu</p>
            <p className="text-4xl font-bold text-gray-600 mb-2">{lastWeek.accuracy}%</p>
            <p className="text-xs text-gray-600">
              {lastWeek.totalQuestions} soal dikerjakan
            </p>
          </div>

          {/* Change */}
          <div className="text-center p-5 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl border-2 border-purple-200 hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-gray-700 mb-3">Perubahan</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className={`text-4xl font-bold ${getImprovementColor()}`}>
                {improvement > 0 ? '+' : ''}{improvement}%
              </p>
              <span className="text-3xl">
                {getImprovementIcon()}
              </span>
            </div>
            <p className={`text-xs font-semibold ${getImprovementColor()}`}>
              {getImprovementMessage()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
