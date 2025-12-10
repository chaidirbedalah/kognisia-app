import { NextRequest, NextResponse } from 'next/server'
import { getSquadDetails } from '@/lib/squad-api'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Squad Details API Called ===')
  
  // Await params (Next.js 15+ requirement)
  const resolvedParams = await params
  console.log('Params:', resolvedParams)
  console.log('Squad ID from params:', resolvedParams.id)
  
  try {
    // Get authorization header (client-side auth approach)
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.error('❌ No authorization header')
      return NextResponse.json(
        { error: 'Unauthorized - No auth header' },
        { status: 401 }
      )
    }

    console.log('✅ Auth header present')

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
    
    console.log('Auth check result:', { 
      userId: user?.id, 
      userEmail: user?.email,
      hasError: !!authError,
      errorMessage: authError?.message 
    })
    
    if (authError || !user) {
      console.error('❌ Auth failed:', authError)
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    const squadId = resolvedParams.id

    console.log('Squad ID validation:', {
      squadId,
      isUndefined: squadId === 'undefined',
      isEmpty: !squadId,
      length: squadId?.length
    })

    if (!squadId || squadId === 'undefined') {
      console.error('❌ Invalid squad ID')
      throw new Error('Invalid squad ID')
    }

    if (!user.id) {
      console.error('❌ Invalid user ID')
      throw new Error('Invalid user ID')
    }

    console.log('📡 Calling getSquadDetails...')
    console.log('Parameters:', { squadId, userId: user.id })

    // Get squad details (pass supabase client with auth)
    const result = await getSquadDetails(squadId, user.id, supabase)

    console.log('✅ Squad details fetched successfully')
    console.log('Squad:', result.squad?.name)
    console.log('Members count:', result.members?.length)

    return NextResponse.json({
      success: true,
      squad: result.squad,
      members: result.members
    })

  } catch (error: any) {
    console.error('❌ ERROR in squad details API:')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch squad details', 
        details: error.toString(),
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
