'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Subtest } from '@/lib/utbk-constants'
import { useEffect, useState } from 'react'
import { fetchSubtests } from '@/lib/subtests-api'

interface SubtestSelectorProps {
  onSelect: (subtestCode: string) => void
  onBack?: () => void
}

export function SubtestSelectorComponent({ 
  onSelect,
  onBack 
}: SubtestSelectorProps) {
  const [subtests, setSubtests] = useState<Subtest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSubtests() {
      try {
        setLoading(true)
        const data = await fetchSubtests()
        setSubtests(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load subtests:', err)
        setError('Gagal memuat data subtes. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }

    loadSubtests()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat subtes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                {onBack && (
                  <Button onClick={onBack} variant="outline">
                    Kembali
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pilih Subtes 🎯
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilih satu subtes untuk latihan fokus 10 soal
          </p>
        </div>

        {/* Back Button */}
        {onBack && (
          <div className="mb-6 max-w-5xl mx-auto">
            <Button 
              onClick={onBack}
              variant="outline"
              className="gap-2"
            >
              ← Kembali ke Pilihan Mode
            </Button>
          </div>
        )}

        {/* Subtest Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subtests.map((subtest) => (
            <Card 
              key={subtest.code}
              className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-400 cursor-pointer group"
              onClick={() => onSelect(subtest.code)}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {subtest.icon}
                </div>
                <CardTitle className="text-xl mb-2 leading-tight">
                  {subtest.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {subtest.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Question Count Badge */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold mb-1">
                    10 Soal
                  </p>
                  <p className="text-xs opacity-90">
                    Latihan Fokus
                  </p>
                </div>

                {/* UTBK Info */}
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Soal UTBK:</span>
                    <span className="font-semibold">{subtest.utbkQuestionCount} soal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durasi UTBK:</span>
                    <span className="font-semibold">{subtest.utbkDurationMinutes} menit</span>
                  </div>
                </div>

                {/* Select Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-5 group-hover:shadow-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(subtest.code)
                  }}
                >
                  Pilih Subtes Ini
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">
                    Tips Mode Fokus:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • Pilih subtes yang ingin kamu tingkatkan atau perkuat
                    </li>
                    <li>
                      • Mode Fokus cocok untuk latihan mendalam pada area tertentu
                    </li>
                    <li>
                      • Kamu akan mendapat 10 soal acak dari subtes yang dipilih
                    </li>
                    <li>
                      • Tetap menghitung untuk streak Daily Challenge!
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
