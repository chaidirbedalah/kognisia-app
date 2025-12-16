'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { aiRecommendationEngine, AIRecommendation, AdaptiveDifficulty, PerformancePrediction } from '@/lib/ai/recommendationEngine'
import { UserStats, ProgressData, TryOutData } from '@/lib/dashboard-api'

interface AIRecommendationsProps {
  userStats: UserStats
  progressData: ProgressData[]
  tryOutData: TryOutData[]
  onApplyRecommendation?: (recommendation: AIRecommendation) => void
}

export function AIRecommendations({ 
  userStats, 
  progressData, 
  tryOutData, 
  onApplyRecommendation 
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<AdaptiveDifficulty | null>(null)
  const [performancePrediction, setPerformancePrediction] = useState<PerformancePrediction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateAIInsights()
  }, [userStats, progressData, tryOutData])

  const generateAIInsights = async () => {
    setLoading(true)
    
    try {
      // Generate AI recommendations
      const aiRecommendations = aiRecommendationEngine.generateRecommendations(
        userStats,
        progressData,
        tryOutData
      )

      // Generate adaptive difficulty
      const adaptiveDiff = aiRecommendationEngine.generateAdaptiveDifficulty(
        userStats,
        progressData
      )

      // Generate performance prediction
      const prediction = aiRecommendationEngine.generatePerformancePrediction(
        'user-id-placeholder',
        userStats,
        progressData,
        tryOutData
      )

      setRecommendations(aiRecommendations)
      setAdaptiveDifficulty(adaptiveDiff)
      setPerformancePrediction(prediction)
    } catch (error) {
      console.error('Error generating AI insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-100 text-green-800'
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'learning_path': return '🎯'
      case 'difficulty_adjustment': return '⚡'
      case 'content_focus': return '🎯'
      case 'study_schedule': return '📅'
      default: return '🤖'
    }
  }

  const getDifficultyColor = (level: number) => {
    if (level >= 7) return 'text-red-600'
    if (level >= 5) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg font-medium">Generating AI Insights...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🤖 AI Learning Assistant</h2>
        <p className="text-blue-100">Personalized recommendations powered by AI to optimize your learning journey</p>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎯 AI Recommendations</span>
              <Badge variant="secondary">{recommendations.length} suggestions</Badge>
            </CardTitle>
            <CardDescription>
              Personalized insights based on your learning patterns and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(rec.type)}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                      <p className="text-gray-600 text-sm">{rec.description}</p>
                    </div>
                  </div>
                  <Badge className={getConfidenceColor(rec.confidence)}>
                    {rec.confidence}% confidence
                  </Badge>
                </div>
                
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Reasoning:</strong> {rec.reasoning}
                  </p>
                </div>

                {onApplyRecommendation && (
                  <Button 
                    onClick={() => onApplyRecommendation(rec)}
                    className="w-full"
                    variant="outline"
                  >
                    Apply Recommendation
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Adaptive Difficulty */}
      {adaptiveDifficulty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚡ Adaptive Difficulty</span>
              <Badge variant="secondary">Real-time</Badge>
            </CardTitle>
            <CardDescription>
              AI-powered difficulty adjustment based on your performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Current Level</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getDifficultyColor(adaptiveDifficulty.currentLevel)}`}>
                    {adaptiveDifficulty.currentLevel}
                  </span>
                  <span className="text-gray-500">/10</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recommended Level</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getDifficultyColor(adaptiveDifficulty.recommendedLevel)}`}>
                    {adaptiveDifficulty.recommendedLevel}
                  </span>
                  <span className="text-gray-500">/10</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded p-3">
              <p className="text-sm text-blue-700">
                <strong>Adjustment Reason:</strong> {adaptiveDifficulty.adjustmentReason}
              </p>
            </div>

            {/* Subject-wise Difficulty */}
            <div className="space-y-2">
              <h4 className="font-medium">Subject Performance</h4>
              {Object.entries(adaptiveDifficulty.subjects).map(([subject, data]) => (
                <div key={subject} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium capitalize">{subject}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Current</div>
                      <div className={`font-bold ${getDifficultyColor(data.currentDifficulty)}`}>
                        {data.currentDifficulty}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Recommended</div>
                      <div className={`font-bold ${getDifficultyColor(data.recommendedDifficulty)}`}>
                        {data.recommendedDifficulty}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Performance</div>
                      <div className="font-bold text-blue-600">
                        {Math.round(data.performance)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Prediction */}
      {performancePrediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📈 Performance Prediction</span>
              <Badge variant="secondary">AI Forecast</Badge>
            </CardTitle>
            <CardDescription>
              Predictive analytics for your learning outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {performancePrediction.predictions.nextWeekScore}
                </div>
                <div className="text-sm text-gray-600">Next Week Score</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {performancePrediction.predictions.nextMonthScore}
                </div>
                <div className="text-sm text-gray-600">Next Month Score</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {performancePrediction.predictions.utbkPrediction}
                </div>
                <div className="text-sm text-gray-600">UTBK Prediction</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Prediction Confidence</h4>
                <Progress value={performancePrediction.predictions.confidence} className="w-full" />
                <div className="text-sm text-gray-600 text-center">
                  {performancePrediction.predictions.confidence}% confidence
                </div>
              </div>

              <div className="bg-yellow-50 rounded p-3">
                <h4 className="font-medium mb-2 text-yellow-800">Key Factors</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Study Time: {Math.round(performancePrediction.factors.studyTime / 60)}h</div>
                  <div>Accuracy: {Math.round(performancePrediction.factors.accuracy)}%</div>
                  <div>Consistency: {Math.round(performancePrediction.factors.consistency * 100)}%</div>
                  <div>Difficulty: {performancePrediction.factors.difficulty}/10</div>
                </div>
              </div>

              {performancePrediction.recommendations.length > 0 && (
                <div className="bg-blue-50 rounded p-3">
                  <h4 className="font-medium mb-2 text-blue-800">AI Recommendations</h4>
                  <ul className="space-y-1 text-sm">
                    {performancePrediction.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>💡</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={generateAIInsights} variant="outline" className="gap-2">
          🔄 Refresh AI Insights
        </Button>
      </div>
    </div>
  )
}