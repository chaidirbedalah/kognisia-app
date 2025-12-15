import { NextRequest, NextResponse } from 'next/server'
import { joinSquad } from '@/lib/squad-api'
import { isValidInviteCode } from '@/lib/squad-types'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAnonClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const ssr = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )
    const { data: { user }, error: authError } = await ssr.auth.getUser()
    let currentUserId = user?.id || null
    
    if (authError || !currentUserId) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const token = authHeader.substring(7)
      const anon = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: tokenData } = await anon.auth.getUser(token)
      if (!tokenData?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      currentUserId = tokenData.user.id
    }

    // Parse request body
    const body = await request.json()
    const { invite_code } = body

    // Validate invite code
    if (!invite_code || !isValidInviteCode(invite_code.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid invite code format. Must be 6 alphanumeric characters.' },
        { status: 400 }
      )
    }

    // Join squad
    const result = await joinSquad(currentUserId!, { invite_code })

    return NextResponse.json({
      success: true,
      squad: result.squad,
      member: result.member
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('not found') || message.includes('invalid')) {
      return NextResponse.json(
        { error: 'Squad not found. Please check the invite code.' },
        { status: 404 }
      )
    }
    
    if (message.includes('full')) {
      return NextResponse.json(
        { error: 'This squad is full. Cannot join.' },
        { status: 400 }
      )
    }
    
    if (message.includes('already a member')) {
      return NextResponse.json(
        { error: 'You are already a member of this squad.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: message || 'Failed to join squad' },
      { status: 500 }
    )
  }
}
