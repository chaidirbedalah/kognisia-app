import { NextRequest, NextResponse } from 'next/server'
import { createSquad } from '@/lib/squad-api'
import { isValidSquadName } from '@/lib/squad-types'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.error('No authorization header found')
      return NextResponse.json(
        { error: 'Unauthorized - No auth header' },
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
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, max_members } = body

    // Validate squad name
    if (!name || !isValidSquadName(name)) {
      return NextResponse.json(
        { error: 'Squad name must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    // Validate max_members
    if (max_members && (max_members < 2 || max_members > 8)) {
      return NextResponse.json(
        { error: 'Max members must be between 2 and 8' },
        { status: 400 }
      )
    }

    // Create squad
    const squad = await createSquad(user.id, { name, max_members })

    return NextResponse.json({
      success: true,
      squad,
      invite_code: squad.invite_code
    })

  } catch (error: any) {
    console.error('Error creating squad:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create squad' },
      { status: 500 }
    )
  }
}
