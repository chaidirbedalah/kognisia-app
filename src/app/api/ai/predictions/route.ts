import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { adaptiveLearningEngine } from '@/lib/ml-engine'

export async function POST(request: NextRequest) {
  try {
    const { userId, subtest, difficulty } = await request.json()

    if (!userId || !subtest || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, subtest, difficulty' },
        { status: 400 }
      )
    }

    // Initialize adaptive learning engine
    await adaptiveLearningEngine.initialize(userId)

    // Get personalized recommendations
    const recommendations = await adaptiveLearningEngine.getRecommendations(userId)

    return NextResponse.json({
      success: true,
      data: {
        predictions: {
          subtest,
          recommendedDifficulty: recommendations.difficultyAdjustments[subtest] || difficulty,
          confidence: 0.85,
          insights: recommendations.insights
        },
        contentRecommendations: recommendations.contentRecommendations,
        learningPath: recommendations.learningPath,
        personalizedInsights: recommendations.insights
      }
    })
  } catch (error) {
    console.error('AI prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI predictions' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'userId parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Initialize adaptive learning engine
    await adaptiveLearningEngine.initialize(userId)

    // Get current recommendations
    const recommendations = await adaptiveLearningEngine.getRecommendations(userId)

    return NextResponse.json({
      success: true,
      data: recommendations
    })
  } catch (error) {
    console.error('AI recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI recommendations' },
      { status: 500 }
    )
  }
}