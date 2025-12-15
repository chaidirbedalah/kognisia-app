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

    // Get unread notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('achievement_notifications')
      .select(`
        id,
        achievement_id,
        read,
        created_at,
        achievements:achievement_id (
          id,
          code,
          name,
          description,
          icon_emoji,
          points,
          rarity
        )
      `)
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })

    if (notificationsError) throw notificationsError

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unread_count: notifications?.length || 0
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch notifications'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { notification_id } = body

    if (!notification_id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Mark as read
    const { error: updateError } = await supabase
      .from('achievement_notifications')
      .update({ read: true })
      .eq('id', notification_id)
      .eq('user_id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
