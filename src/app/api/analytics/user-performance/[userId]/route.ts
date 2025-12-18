import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params

    // Get user's performance history
    const { data: performanceData, error } = await supabase
      .from('user_performance')
      .select(`
        *,
        subtest_name,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Performance data error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch performance data' },
        { status: 500 }
      )
    }

    // Get user's content ratings for collaborative filtering
    const { data: ratings } = await supabase
      .from('user_content_ratings')
      .select('*')
      .eq('user_id', userId)

    // Get user's assessment attempts
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select(`
        *,
        assessment_type,
        difficulty_level,
        score,
        accuracy,
        time_spent,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Transform data for ML engine
    const transformedData = attempts?.map(attempt => ({
      userId: userId,
      subtest: attempt.assessment_type || 'General',
      accuracy: attempt.accuracy || 0,
      timeSpent: attempt.time_spent || 0,
      difficulty: attempt.difficulty_level || 1,
      attempts: 1, // Each record is one attempt
      timestamp: new Date(attempt.created_at).getTime()
    })) || []

    const transformedRatings = ratings?.map(rating => ({
      userId: userId,
      itemId: rating.content_id,
      rating: rating.rating,
      timestamp: new Date(rating.created_at).getTime()
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        performanceHistory: transformedData,
        ratings: transformedRatings,
        recentAttempts: attempts?.slice(0, 10) || [],
        stats: {
          totalAttempts: attempts?.length || 0,
          averageAccuracy: attempts?.reduce((sum, a) => sum + (a.accuracy || 0), 0) / (attempts?.length || 1),
          averageTimeSpent: attempts?.reduce((sum, a) => sum + (a.time_spent || 0), 0) / (attempts?.length || 1),
          strongestSubtest: getStrongestSubtest(attempts || []),
          weakestSubtest: getWeakestSubtest(attempts || [])
        }
      }
    })
  } catch (error) {
    console.error('User performance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getStrongestSubtest(attempts: any[]): string {
  const subtestPerformance = new Map<string, number[]>()
  
  attempts.forEach(attempt => {
    const subtest = attempt.assessment_type || 'General'
    if (!subtestPerformance.has(subtest)) {
      subtestPerformance.set(subtest, [])
    }
    subtestPerformance.get(subtest)!.push(attempt.accuracy || 0)
  })

  let strongestSubtest = 'General'
  let highestAvg = 0

  for (const [subtest, accuracies] of subtestPerformance) {
    const avg = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    if (avg > highestAvg) {
      highestAvg = avg
      strongestSubtest = subtest
    }
  }

  return strongestSubtest
}

function getWeakestSubtest(attempts: any[]): string {
  const subtestPerformance = new Map<string, number[]>()
  
  attempts.forEach(attempt => {
    const subtest = attempt.assessment_type || 'General'
    if (!subtestPerformance.has(subtest)) {
      subtestPerformance.set(subtest, [])
    }
    subtestPerformance.get(subtest)!.push(attempt.accuracy || 0)
  })

  let weakestSubtest = 'General'
  let lowestAvg = 100

  for (const [subtest, accuracies] of subtestPerformance) {
    const avg = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    if (avg < lowestAvg) {
      lowestAvg = avg
      weakestSubtest = subtest
    }
  }

  return weakestSubtest
}