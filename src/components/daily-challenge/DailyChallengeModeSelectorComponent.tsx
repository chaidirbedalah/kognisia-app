'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DailyChallengeMode } from '@/lib/types'

interface DailyChallengeModeOption {
  type: DailyChallengeMode
  title: string
  description: string
  icon: string
  questionCount: number
  details: string[]
}

interface DailyChallengeModeSelectorProps {
  onModeSelect: (mode: DailyChallengeMode) => void
}

const MODE_OPTIONS: DailyChallengeModeOption[] = [
  {
    type: 'balanced',
    title: 'Mode Seimbang',
    description: 'Latihan menyeluruh dari semua subtes',
    icon: '⚖️',
    questionCount: 21,
    details: [
      '3 soal dari setiap subtes',
      'Total 7 subtes UTBK 2026',
      'Cocok untuk latihan harian rutin',
      'Menjaga kemampuan di semua area'
    ]
  },
  {
    type: 'focus',
    title: 'Mode Fokus',
    description: 'Latihan intensif pada satu subtes pilihan',
    icon: '🎯',
    questionCount: 10,
    details: [
      '10 soal dari 1 subtes pilihan',
      'Pilih subtes yang ingin diperdalam',
      'Cocok untuk memperkuat area lemah',
      'Latihan lebih mendalam'
    ]
  }
]

export function DailyChallengeModeSelectorComponent({ 
  onModeSelect 
}: DailyChallengeModeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Daily Challenge 📚
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilih mode latihan yang sesuai dengan kebutuhan belajar kamu hari ini
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {MODE_OPTIONS.map((option) => (
            <Card 
              key={option.type}
              className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 cursor-pointer group"
              onClick={() => onModeSelect(option.type)}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {option.icon}
                </div>
                <CardTitle className="text-2xl mb-2">
                  {option.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {option.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Question Count Badge */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold mb-1">
                    {option.questionCount} Soal
                  </p>
                  <p className="text-sm opacity-90">
                    Durasi ±{Math.ceil(option.questionCount * 1.5)} menit
                  </p>
                </div>

                {/* Details List */}
                <div className="space-y-2">
                  {option.details.map((detail, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg group-hover:shadow-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    onModeSelect(option.type)
                  }}
                >
                  Pilih {option.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">
                    Tips Memilih Mode:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • <strong>Mode Seimbang:</strong> Ideal untuk menjaga konsistensi dan streak harian
                    </li>
                    <li>
                      • <strong>Mode Fokus:</strong> Gunakan saat ingin meningkatkan kemampuan di subtes tertentu
                    </li>
                    <li>
                      • Kedua mode tetap menghitung untuk streak Daily Challenge kamu!
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
