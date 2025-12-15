import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import type { ActivityType } from '@/lib/streak-types'

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { activity_type, activity_id, activity_date } = body

    // Validate activity_type
    const validTypes: ActivityType[] = ['daily_challenge', 'squad_battle', 'mini_tryout', 'full_tryout']
    if (!activity_type || !validTypes.includes(activity_type)) {
      return NextResponse.json(
        { error: 'Valid activity_type is required' },
        { status: 400 }
      )
    }

    // Use provided date or today
    const date = activity_date || new Date().toISOString().split('T')[0]

    // Record activity (will be unique per user/date/type)
    const { data: streak, error: streakError } = await supabase
      .from('daily_streaks')
      .insert({
        user_id: user.id,
        activity_date: date,
        activity_type,
        activity_id: activity_id || null
      })
      .select()
      .single()

    if (streakError) {
      // If duplicate, that's okay - activity already recorded
      if (streakError.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Activity already recorded for today'
        })
      }
      throw streakError
    }

    // Get updated stats (trigger will auto-update)
    const { data: stats, error: statsError } = await supabase
      .from('streak_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (statsError) throw statsError

    return NextResponse.json({
      success: true,
      streak,
      stats
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to record activity'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
