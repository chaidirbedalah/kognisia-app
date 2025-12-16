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
    
    // Get weekly engagement data
    const weeks = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate)
      const weekEnd = new Date(currentDate)
      weekEnd.setDate(weekEnd.getDate() + 7)
      
      // Get active users for this week
      const { data: activeUsersData } = await supabase
        .from('student_progress')
        .select('user_id')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())
        .in('user_id', (
          await supabase
            .from('users')
            .select('id')
            .eq('role', 'student')
            .eq('school_id', schoolId)
        ).data?.map(u => u.id) || [])
      
      const activeUsers = activeUsersData ? [...new Set(activeUsersData.map(item => item.user_id))].length : 0
      
      // Get total sessions for this week
      const { count: totalSessions } = await supabase
        .from('student_progress')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())
        .in('user_id', (
          await supabase
            .from('users')
            .select('id')
            .eq('role', 'student')
            .eq('school_id', schoolId)
        ).data?.map(u => u.id) || [])
      
      // Calculate average session time (simplified - using completion rate as proxy)
      const { data: sessionData } = await supabase
        .from('student_progress')
        .select('created_at, completed_at')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())
        .in('user_id', (
          await supabase
            .from('users')
            .select('id')
            .eq('role', 'student')
            .eq('school_id', schoolId)
        ).data?.map(u => u.id) || [])
      
      const completedSessions = sessionData ? sessionData.filter(item => item.completed_at).length : 0
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
      
      // Calculate average session time (simplified - using fixed values)
      const averageSessionTime = 15 // minutes (simplified for demo)
      
      weeks.push({
        week: `Week ${Math.ceil((weekStart.getDate() / 7))}`,
        activeUsers,
        totalSessions: totalSessions || 0,
        averageSessionTime,
        completionRate
      })
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7)
    }
    
    return NextResponse.json({ weeks })
  } catch (error) {
    console.error('Error in engagement analytics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}