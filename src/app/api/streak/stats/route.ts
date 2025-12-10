import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateCalendar } from '@/lib/streak-types'

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get streak stats
    const { data: stats, error: statsError } = await supabase
      .from('streak_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If no stats yet, return default
    if (statsError && statsError.code === 'PGRST116') {
      return NextResponse.json({
        stats: {
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          total_active_days: 0,
          last_activity_date: null
        },
        recent_activities: [],
        calendar: generateCalendar([], 30)
      })
    }

    if (statsError) throw statsError

    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: activities, error: activitiesError } = await supabase
      .from('daily_streaks')
      .select('*')
      .eq('user_id', user.id)
      .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('activity_date', { ascending: false })

    if (activitiesError) throw activitiesError

    // Generate calendar
    const calendar = generateCalendar(activities || [], 30)

    return NextResponse.json({
      stats,
      recent_activities: activities || [],
      calendar
    })

  } catch (error: any) {
    console.error('Error fetching streak stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch streak stats' },
      { status: 500 }
    )
  }
}
