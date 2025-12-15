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
    const { achievement_code } = body

    if (!achievement_code) {
      return NextResponse.json(
        { error: 'Achievement code is required' },
        { status: 400 }
      )
    }

    // Get achievement by code
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('*')
      .eq('code', achievement_code)
      .single()

    if (achievementError || !achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      )
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievement.id)
      .single()

    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Achievement already unlocked',
        achievement
      })
    }

    // Unlock achievement
    const { data: userAchievement, error: unlockError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievement.id
      })
      .select()
      .single()

    if (unlockError) throw unlockError

    // Create notification
    await supabase
      .from('achievement_notifications')
      .insert({
        user_id: user.id,
        achievement_id: achievement.id
      })

    return NextResponse.json({
      success: true,
      message: 'Achievement unlocked!',
      achievement: {
        ...achievement,
        unlocked: true,
        unlockedAt: userAchievement.unlocked_at
      }
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to unlock achievement'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
