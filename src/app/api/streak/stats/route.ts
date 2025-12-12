import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get streak data
    const { data: streak, error: streakError } = await supabase
      .from('daily_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (streakError && streakError.code !== 'PGRST116') {
      throw streakError
    }

    // Get today's activities
    const today = new Date().toISOString().split('T')[0]
    const { data: todayActivities, error: activitiesError } = await supabase
      .from('streak_activities')
      .select('activity_type')
      .eq('user_id', user.id)
      .eq('activity_date', today)

    if (activitiesError) throw activitiesError

    // Get streak rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('streak_rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('streak_milestone', { ascending: true })

    if (rewardsError) throw rewardsError

    // Check if streak is active today
    const isActiveToday = todayActivities && todayActivities.length > 0

    // Check if streak will break tomorrow
    let streakStatus = 'active'
    if (streak) {
      const lastDate = new Date(streak.last_activity_date)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff > 1) {
        streakStatus = 'broken'
      } else if (daysDiff === 1 && !isActiveToday) {
        streakStatus = 'at_risk'
      }
    }

    return NextResponse.json({
      success: true,
      streak: {
        current_streak: streak?.current_streak || 0,
        longest_streak: streak?.longest_streak || 0,
        last_activity_date: streak?.last_activity_date || null,
        status: streakStatus,
        is_active_today: isActiveToday
      },
      today_activities: todayActivities?.map(a => a.activity_type) || [],
      rewards: rewards || [],
      next_milestone: getNextMilestone(streak?.current_streak || 0)
    })

  } catch (error: any) {
    console.error('Error fetching streak stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch streak stats' },
      { status: 500 }
    )
  }
}

function getNextMilestone(currentStreak: number): number {
  const milestones = [7, 14, 30, 60, 100, 365]
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return milestone
    }
  }
  return 365
}

