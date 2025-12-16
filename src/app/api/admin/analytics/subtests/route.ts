import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    
    // Get current user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user has admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('id', user.id)
      .single()
    
    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const schoolId = userData.school_id
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '365d':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }
    
    // Get subtest performance data
    const { data: subtests, error: subtestsError } = await supabase
      .from('subtests')
      .select('*')
      .order('code')
    
    if (subtestsError) {
      console.error('Error fetching subtests:', subtestsError)
      return NextResponse.json({ error: 'Failed to fetch subtests' }, { status: 500 })
    }
    
    // Get student progress for each subtest
    const subtestPerformance = await Promise.all(
      subtests.map(async (subtest) => {
        const { data: progressData, error: progressError } = await supabase
          .from('student_progress')
          .select('accuracy, created_at')
          .eq('subtest_code', subtest.code)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .in('user_id', (
            await supabase
              .from('users')
              .select('id')
              .eq('role', 'student')
              .eq('school_id', schoolId)
          ).data?.map(u => u.id) || [])
        
        if (progressError) {
          console.error(`Error fetching progress for ${subtest.code}:`, progressError)
          return null
        }
        
        // Calculate average accuracy
        const accuracySum = progressData.reduce((sum, item) => sum + (item.accuracy || 0), 0)
        const averageAccuracy = progressData.length > 0 ? accuracySum / progressData.length : 0
        
        // Calculate improvement rate (compare with previous period)
        const previousStartDate = new Date(startDate)
        const previousEndDate = new Date(startDate)
        
        switch (timeRange) {
          case '7d':
            previousStartDate.setDate(startDate.getDate() - 7)
            break
          case '30d':
            previousStartDate.setDate(startDate.getDate() - 30)
            break
          case '90d':
            previousStartDate.setDate(startDate.getDate() - 90)
            break
          case '365d':
            previousStartDate.setFullYear(startDate.getFullYear() - 1)
            break
        }
        
        const { data: previousProgressData } = await supabase
          .from('student_progress')
          .select('accuracy')
          .eq('subtest_code', subtest.code)
          .gte('created_at', previousStartDate.toISOString())
          .lte('created_at', previousEndDate.toISOString())
          .in('user_id', (
            await supabase
              .from('users')
              .select('id')
              .eq('role', 'student')
              .eq('school_id', schoolId)
          ).data?.map(u => u.id) || [])
        
        const previousAccuracySum = previousProgressData?.reduce((sum, item) => sum + (item.accuracy || 0), 0) || 0
        const previousAverageAccuracy = previousProgressData && previousProgressData.length > 0 
          ? previousAccuracySum / previousProgressData.length 
          : 0
        
        const improvementRate = previousAverageAccuracy > 0 
          ? ((averageAccuracy - previousAverageAccuracy) / previousAverageAccuracy) * 100 
          : 0
        
        return {
          subtestCode: subtest.code,
          testName: subtest.name || '',
          averageAccuracy,
          totalAttempts: progressData?.length || 0,
          improvementRate
        }
      })
    )
    
    // Filter out null results
    const validSubtestPerformance = subtestPerformance.filter(item => item !== null)
    
    return NextResponse.json({ subtests: validSubtestPerformance })
  } catch (error) {
    console.error('Error in subtest performance API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}