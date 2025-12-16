import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
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
    
    // Get total students
    const { count: totalStudents } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')
      .eq('school_id', schoolId)
    
    // Get total teachers
    const { count: totalTeachers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'teacher')
      .eq('school_id', schoolId)
    
    // Get total classes
    const { count: totalClasses } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
    
    // Get active students (today)
    const { count: activeStudents } = await supabase
      .from('student_progress')
      .select('*', { count: 'exact', head: true })
      .eq('created_at::date', new Date().toISOString().split('T')[0])
      .in('user_id', (
        await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .eq('school_id', schoolId)
      ).data?.map(u => u.id) || [])
    
    // Get average accuracy
    const { data: accuracyData } = await supabase
      .from('student_progress')
      .select('accuracy')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .in('user_id', (
        await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .eq('school_id', schoolId)
      ).data?.map(u => u.id) || [])
    
    const averageAccuracy = accuracyData && accuracyData.length > 0
      ? accuracyData.reduce((sum, item) => sum + (item.accuracy || 0), 0) / accuracyData.length
      : 0
    
    // Get total assessments
    const { count: totalAssessments } = await supabase
      .from('student_progress')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .in('user_id', (
        await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .eq('school_id', schoolId)
      ).data?.map(u => u.id) || [])
    
    // Get completion rate (students who completed at least one assessment)
    const { data: completionData } = await supabase
      .from('student_progress')
      .select('user_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .in('user_id', (
        await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .eq('school_id', schoolId)
      ).data?.map(u => u.id) || [])
    
    const uniqueStudents = completionData ? [...new Set(completionData.map(item => item.user_id))].length : 0
    const completionRate = totalStudents > 0 ? (uniqueStudents / totalStudents) * 100 : 0
    
    // Get engagement rate (students active in last 7 days)
    const { data: engagementData } = await supabase
      .from('student_progress')
      .select('user_id')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .in('user_id', (
        await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .eq('school_id', schoolId)
      ).data?.map(u => u.id) || [])
    
    const engagedStudents = engagementData ? [...new Set(engagementData.map(item => item.user_id))].length : 0
    const engagementRate = totalStudents > 0 ? (engagedStudents / totalStudents) * 100 : 0
    
    const analytics = {
      totalStudents: totalStudents || 0,
      totalTeachers: totalTeachers || 0,
      totalClasses: totalClasses || 0,
      activeStudents: activeStudents || 0,
      averageAccuracy,
      totalAssessments: totalAssessments || 0,
      completionRate,
      engagementRate
    }
    
    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Error in analytics overview API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}