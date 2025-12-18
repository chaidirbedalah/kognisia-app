'use client'

import { useState, useEffect } from 'react'
import MobileCard, { MobileCardHeader, MobileCardContent } from '@/components/mobile/MobileCard'
import MobileButton from '@/components/mobile/MobileButton'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { Brain, TrendingUp, Target, Zap, BookOpen, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface AIRecommendation {
  subtest: string
  recommendedDifficulty: number
  confidence: number
  insights: string[]
  riskFactors?: string[]
  improvementSuggestions?: string[]
}

interface ContentRecommendation {
  itemId: string
  score: number
  confidence: number
  reason: string
}

interface AIRecommendationsProps {
  userId: string
  currentSubtest?: string
  onApplyRecommendation?: (recommendation: AIRecommendation) => void
}

export function AIRecommendations({ 
  userId, 
  currentSubtest = 'Penalaran Umum',
  onApplyRecommendation 
}: AIRecommendationsProps) {
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<{
    difficultyAdjustments: Record<string, number>
    contentRecommendations: ContentRecommendation[]
    learningPath: string[]
    insights: string[]
  } | null>(null)
  const [expandedSection, setExpandedSection] = useState<'insights' | 'recommendations' | 'learning-path'>('insights')

  const { isMobile } = useMobileDetection()

  useEffect(() => {
    fetchAIRecommendations()
  }, [userId, currentSubtest])

  const fetchAIRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ai/predictions?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch AI recommendations')
      }
    } catch (error) {
      console.error('AI recommendations error:', error)
      toast.error('Gagal memuat rekomendasi AI')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyRecommendation = (subtest: string, difficulty: number) => {
    if (onApplyRecommendation) {
      onApplyRecommendation({
        subtest,
        recommendedDifficulty: difficulty,
        confidence: 0.85,
        insights: recommendations?.insights || []
      })
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600 bg-green-50'
    if (difficulty <= 3) return 'text-yellow-600 bg-yellow-50'
    if (difficulty <= 4) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 1.5) return 'Sangat Mudah'
    if (difficulty <= 2.5) return 'Mudah'
    if (difficulty <= 3.5) return 'Sedang'
    if (difficulty <= 4.5) return 'Sulit'
    return 'Sangat Sulit'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-2" />
          <div className="h-4 bg-muted rounded w-64 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <MobileCard>
        <MobileCardHeader
          icon={<Brain className="h-5 w-5 text-blue-500" />}
          title="AI Recommendations"
          subtitle="Gagal memuat rekomendasi"
        />
        <MobileCardContent>
          <MobileButton onClick={fetchAIRecommendations} className="w-full">
            Coba Lagi
          </MobileButton>
        </MobileCardContent>
      </MobileCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <MobileCard variant="elevated">
        <MobileCardHeader
          icon={<Brain className="h-6 w-6 text-blue-500" />}
          title="🤖 AI Insights"
          subtitle="Rekomendasi personal berdasarkan performa Anda"
        />
        <MobileCardContent>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setExpandedSection('insights')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                expandedSection === 'insights'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setExpandedSection('recommendations')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                expandedSection === 'recommendations'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Rekomendasi
            </button>
            <button
              onClick={() => setExpandedSection('learning-path')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                expandedSection === 'learning-path'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Learning Path
            </button>
          </div>

          {/* Insights Section */}
          {expandedSection === 'insights' && (
            <div className="space-y-3">
              {recommendations.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{insight}</p>
                </div>
              ))}
            </div>
          )}

          {/* Difficulty Recommendations */}
          {expandedSection === 'recommendations' && (
            <div className="space-y-3">
              {Object.entries(recommendations.difficultyAdjustments).map(([subtest, difficulty]) => (
                <div key={subtest} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{subtest}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                      {getDifficultyLabel(difficulty)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Target className="h-3 w-3" />
                    <span>Confidence: 85%</span>
                  </div>
                  <MobileButton
                    size="sm"
                    onClick={() => handleApplyRecommendation(subtest, difficulty)}
                    className="w-full"
                    hapticFeedback
                  >
                    Terapkan Rekomendasi
                  </MobileButton>
                </div>
              ))}
            </div>
          )}

          {/* Learning Path */}
          {expandedSection === 'learning-path' && (
            <div className="space-y-3">
              {recommendations.learningPath.map((subtest, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-green-800">{subtest}</h4>
                    <p className="text-xs text-green-600">
                      {index === 0 ? 'Fokus utama' : index === 1 ? 'Prioritas kedua' : 'Berikutnya'}
                    </p>
                  </div>
                  <BookOpen className="h-4 w-4 text-green-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </MobileCardContent>
      </MobileCard>

      {/* Content Recommendations */}
      {recommendations.contentRecommendations.length > 0 && (
        <MobileCard>
          <MobileCardHeader
            icon={<Zap className="h-5 w-5 text-yellow-500" />}
            title="📚 Konten Rekomendasi"
            subtitle="Berdasarkan preferensi pengguna serupa"
          />
          <MobileCardContent>
            <div className="space-y-3">
              {recommendations.contentRecommendations.slice(0, 3).map((content, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{content.itemId}</h4>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      {Math.round(content.confidence * 100)}% match
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{content.reason}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-xs font-medium">{content.score.toFixed(1)}</span>
                    </div>
                    <MobileButton size="sm" variant="outline">
                      Mulai
                    </MobileButton>
                  </div>
                </div>
              ))}
            </div>
          </MobileCardContent>
        </MobileCard>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3">
        <MobileButton
          onClick={() => window.location.href = '/daily-challenge'}
          className="w-full"
          hapticFeedback
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Mulai dengan Rekomendasi AI</span>
          </div>
        </MobileButton>
        
        <MobileButton
          variant="outline"
          onClick={() => window.location.href = '/analytics'}
          className="w-full"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Lihat Analytics Lengkap</span>
          </div>
        </MobileButton>
      </div>
    </div>
  )
}

export default AIRecommendations