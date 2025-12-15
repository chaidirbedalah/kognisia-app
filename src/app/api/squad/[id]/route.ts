import { NextRequest, NextResponse } from 'next/server'
import { getSquadDetails } from '@/lib/squad-api'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAnonClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params (Next.js 15+ requirement)
  const resolvedParams = await params
  
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
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

    const squadId = resolvedParams.id

    if (!squadId || squadId === 'undefined') {
      throw new Error('Invalid squad ID')
    }

    // Get squad details (pass supabase client with auth)
    const result = await getSquadDetails(squadId, currentUserId!, supabase)

    return NextResponse.json({
      success: true,
      squad: result.squad,
      members: result.members
    })

  } catch {
    return NextResponse.json(
      { 
        error: 'Failed to fetch squad details' 
      },
      { status: 500 }
    )
  }
}
