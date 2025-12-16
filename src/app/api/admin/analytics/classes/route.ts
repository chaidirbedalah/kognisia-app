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
    
    const schoolId = userData?.school_id || ''
    
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
    
    // Get classes with performance data
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        grade,
        users!inner(name),
        student_progress(
          user_id,
          accuracy,
          created_at
        )
      `)
      .eq('school_id', schoolId)
      .eq('users.role', 'teacher')
      .gte('student_progress.created_at', startDate.toISOString())
      .lte('student_progress.created_at', endDate.toISOString())
    
    if (classesError) {
      console.error('Error fetching classes:', classesError)
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }
    
    // Process class performance data
    const classPerformance = classes.map(classItem => {
      const progressData = classItem.student_progress || []
      
      // Calculate average accuracy
      const accuracySum = progressData.reduce((sum, item) => sum + (item.accuracy || 0), 0)
      const averageAccuracy = progressData.length > 0 ? accuracySum / progressData.length : 0
      
      // Get student count for this class
      const studentCount = progressData.length > 0 
        ? [...new Set(progressData.map(item => item.user_id))].length 
        : 0
      
      // Calculate completion rate (students who completed at least one assessment)
      const uniqueStudents = [...new Set(progressData.map(item => item.user_id))]
      const completionRate = studentCount > 0 ? (uniqueStudents.length / studentCount) * 100 : 0
      
      // Get last activity date
      const lastActivity = progressData.length > 0 
        ? new Date(Math.max(...progressData.map(item => new Date(item.created_at).getTime())))
        : null
      
      return {
        id: classItem.id,
        name: classItem.name,
        grade: classItem.grade,
        teacher: (classItem.users as any)?.name || 'Unknown',
        studentCount,
        averageAccuracy,
        totalQuestions: progressData.length,
        completionRate,
        lastActivity: lastActivity ? lastActivity.toISOString() : null
      }
    })
    
    return NextResponse.json({ classes: classPerformance })
  } catch (error) {
    console.error('Error in class performance API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}