import { NextRequest, NextResponse } from 'next/server'
import { leaveSquad } from '@/lib/squad-api'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Leave Squad API Called ===')
  
  // Await params (Next.js 15+ requirement)
  const resolvedParams = await params
  console.log('Params:', resolvedParams)
  console.log('Squad ID from params:', resolvedParams.id)
  
  try {
    // Get authorization header
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
      hasError: !!authError 
    })
    
    if (authError || !user) {
      console.error('❌ Auth failed:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    const squadId = resolvedParams.id

    console.log('Squad ID validation:', {
      squadId,
      isUndefined: squadId === 'undefined',
      isEmpty: !squadId
    })

    if (!squadId || squadId === 'undefined') {
      console.error('❌ Invalid squad ID')
      throw new Error('Invalid squad ID')
    }

    console.log('📡 Calling leaveSquad...')
    console.log('Parameters:', { userId: user.id, squadId })

    // Leave squad
    await leaveSquad(user.id, squadId, supabase)

    console.log('✅ Successfully left squad')

    return NextResponse.json({
      success: true,
      message: 'Successfully left the squad'
    })

  } catch (error: any) {
    console.error('❌ ERROR in leave squad API:')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to leave squad',
        details: error.toString(),
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
