import { NextRequest, NextResponse } from 'next/server'
import { joinSquad } from '@/lib/squad-api'
import { isValidInviteCode } from '@/lib/squad-types'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create Supabase client with auth header
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    const result = await joinSquad(user.id, { invite_code })

    return NextResponse.json({
      success: true,
      squad: result.squad,
      member: result.member
    })

  } catch (error: any) {
    console.error('Error joining squad:', error)
    
    // Handle specific errors
    if (error.message.includes('not found') || error.message.includes('invalid')) {
      return NextResponse.json(
        { error: 'Squad not found. Please check the invite code.' },
        { status: 404 }
      )
    }
    
    if (error.message.includes('full')) {
      return NextResponse.json(
        { error: 'This squad is full. Cannot join.' },
        { status: 400 }
      )
    }
    
    if (error.message.includes('already a member')) {
      return NextResponse.json(
        { error: 'You are already a member of this squad.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to join squad' },
      { status: 500 }
    )
  }
}
