import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { activity_type } = body

    if (!activity_type) {
      return NextResponse.json(
        { error: 'Activity type is required' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]

    // Check if user already has activity today
    const { data: existingActivity } = await supabase
      .from('streak_activities')
      .select('id')
      .eq('user_id', user.id)
      .eq('activity_type', activity_type)
      .eq('activity_date', today)
      .single()

    if (existingActivity) {
      return NextResponse.json({
        success: false,
        message: 'Activity already recorded today',
        streak: null
      })
    }

    // Record activity
    const { error: activityError } = await supabase
      .from('streak_activities')
      .insert({
        user_id: user.id,
        activity_type,
        activity_date: today
      })

    if (activityError) throw activityError

    // Get or create streak record
    const { data: existingStreak } = await supabase
      .from('daily_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let streak = existingStreak

    if (!streak) {
      const { data: newStreak, error: createError } = await supabase
        .from('daily_streaks')
        .insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today
        })
        .select()
        .single()

      if (createError) throw createError
      streak = newStreak
    } else {
      // Check if streak should continue or reset
      const lastDate = new Date(streak.last_activity_date)
      const todayDate = new Date(today)
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      let newCurrentStreak = streak.current_streak
      
      if (daysDiff === 1) {
        // Streak continues
        newCurrentStreak = streak.current_streak + 1
      } else if (daysDiff > 1) {
        // Streak broken, reset to 1
        newCurrentStreak = 1
      }
      // If daysDiff === 0, same day, don't update

      const newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak)

      const { data: updatedStreak, error: updateError } = await supabase
        .from('daily_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      streak = updatedStreak

      // Check for milestone rewards
      await checkStreakMilestones(supabase, user.id, newCurrentStreak)
    }

    return NextResponse.json({
      success: true,
      message: 'Streak updated successfully',
      streak: {
        current_streak: streak.current_streak,
        longest_streak: streak.longest_streak,
        last_activity_date: streak.last_activity_date
      }
    })

  } catch (error: any) {
    console.error('Error updating streak:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update streak' },
      { status: 500 }
    )
  }
}

async function checkStreakMilestones(supabase: any, userId: string, currentStreak: number) {
  const milestones = [7, 14, 30, 60, 100, 365]
  
  for (const milestone of milestones) {
    if (currentStreak === milestone) {
      // Check if reward already exists
      const { data: existingReward } = await supabase
        .from('streak_rewards')
        .select('id')
        .eq('user_id', userId)
        .eq('streak_milestone', milestone)
        .single()

      if (!existingReward) {
        // Create reward
        await supabase
          .from('streak_rewards')
          .insert({
            user_id: userId,
            streak_milestone: milestone,
            reward_type: 'badge',
            reward_value: `streak_${milestone}_days`
          })
      }
    }
  }
}

