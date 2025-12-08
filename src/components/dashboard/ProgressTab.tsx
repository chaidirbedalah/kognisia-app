import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressData } from '@/lib/dashboard-api'

interface ProgressTabProps {
  data: ProgressData[]
  loading?: boolean
}

export function ProgressTab({ data, loading }: ProgressTabProps) {
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
      <Card>
        <CardHeader>
          <CardTitle>Progress per Subtest</CardTitle>
          <CardDescription>Belum ada data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum ada data progress
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai latihan untuk melihat progress per subtest dan topik!
            </p>
            <button
              onClick={() => window.location.href = '/daily-challenge'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mulai Latihan
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Kuat':
        return 'border-green-500 text-green-700 bg-green-50'
      case 'Cukup':
        return 'border-yellow-500 text-yellow-700 bg-yellow-50'
      case 'Lemah':
        return 'border-red-500 text-red-700 bg-red-50'
      default:
        return 'border-gray-500 text-gray-700 bg-gray-50'
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600 bg-green-50'
    if (accuracy >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Subtest</p>
              <p className="text-3xl font-bold text-blue-600">{data.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Soal</p>
              <p className="text-3xl font-bold text-gray-900">
                {data.reduce((sum, d) => sum + d.totalQuestions, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Benar</p>
              <p className="text-3xl font-bold text-green-600">
                {data.reduce((sum, d) => sum + d.correctAnswers, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Akurasi</p>
              <p className={`text-3xl font-bold ${
                data.reduce((sum, d) => sum + d.correctAnswers, 0) /
                data.reduce((sum, d) => sum + d.totalQuestions, 0) >= 0.7
                  ? 'text-green-600'
                  : data.reduce((sum, d) => sum + d.correctAnswers, 0) /
                    data.reduce((sum, d) => sum + d.totalQuestions, 0) >= 0.5
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {Math.round(
                  (data.reduce((sum, d) => sum + d.correctAnswers, 0) /
                    data.reduce((sum, d) => sum + d.totalQuestions, 0)) *
                    100
                )}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress per Subtest */}
      <Card>
        <CardHeader>
          <CardTitle>Progress per Subtest 📚</CardTitle>
          <CardDescription>
            Performa kamu di setiap subtest UTBK
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((subtest, idx) => (
              <div
                key={idx}
                className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Subtest Header */}
                <div className={`p-4 flex justify-between items-center ${
                  subtest.accuracy >= 70 ? 'bg-green-50 border-b-2 border-green-200' :
                  subtest.accuracy >= 50 ? 'bg-yellow-50 border-b-2 border-yellow-200' :
                  'bg-red-50 border-b-2 border-red-200'
                }`}>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{subtest.subtest}</h3>
                    <p className="text-sm text-gray-600">
                      {subtest.correctAnswers}/{subtest.totalQuestions} benar
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`text-lg px-4 py-1 ${
                        subtest.accuracy >= 70
                          ? 'bg-green-500 hover:bg-green-600'
                          : subtest.accuracy >= 50
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {subtest.accuracy}%
                    </Badge>
                  </div>
                </div>

                {/* Topics Breakdown */}
                {subtest.topics.length > 0 && (
                  <div className="p-4 bg-white">
                    <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Progress per Topik:
                    </p>
                    <div className="space-y-2">
                      {subtest.topics.map((topic, tidx) => (
                        <div
                          key={tidx}
                          className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{topic.name}</p>
                            <p className="text-xs text-gray-600">
                              {topic.correctAnswers}/{topic.totalQuestions} benar
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-bold ${getAccuracyColor(topic.accuracy).split(' ')[0]}`}>
                                {topic.accuracy}%
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(topic.status)} border-2 font-semibold`}
                            >
                              {topic.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💡</span>
            <span>Rekomendasi Belajar</span>
          </CardTitle>
          <CardDescription>
            Fokus pada topik yang perlu ditingkatkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data
              .flatMap(subtest =>
                subtest.topics
                  .filter(topic => topic.status === 'Lemah')
                  .map(topic => ({ ...topic, subtest: subtest.subtest }))
              )
              .slice(0, 5)
              .map((topic, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-lg border-2 border-orange-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{topic.name}</p>
                      <p className="text-xs text-gray-600">{topic.subtest}</p>
                    </div>
                    <Badge className="bg-red-500 hover:bg-red-600">
                      {topic.accuracy}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Kamu sudah mengerjakan {topic.totalQuestions} soal dengan {topic.correctAnswers} benar.
                    Yuk tingkatkan dengan latihan lebih banyak!
                  </p>
                  <button
                    onClick={() => window.location.href = '/daily-challenge'}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Latihan Sekarang
                  </button>
                </div>
              ))}
            {data.flatMap(s => s.topics).filter(t => t.status === 'Lemah').length === 0 && (
              <div className="text-center py-6 text-gray-600">
                <p className="text-lg font-semibold mb-2">🎉 Hebat!</p>
                <p>Tidak ada topik yang lemah. Pertahankan performa kamu!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
