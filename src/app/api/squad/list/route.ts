import { NextRequest, NextResponse } from 'next/server'
import { getUserSquads } from '@/lib/squad-api'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's squads
    const squads = await getUserSquads(user.id, supabase)

    return NextResponse.json({
      success: true,
      squads
    })

  } catch (error: any) {
    console.error('Error fetching squads:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch squads' },
      { status: 500 }
    )
  }
}
