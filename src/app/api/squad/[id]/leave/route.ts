import { NextRequest, NextResponse } from 'next/server'
import { leaveSquad } from '@/lib/squad-api'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const squadId = resolvedParams.id

    if (!squadId || squadId === 'undefined') {
      throw new Error('Invalid squad ID')
    }

    // Leave squad
    await leaveSquad(user.id, squadId, supabase)

    return NextResponse.json({
      success: true,
      message: 'Successfully left the squad'
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to leave squad'
    const details =
      error instanceof Error ? error.toString() : String(error)
    return NextResponse.json({ error: message, details }, { status: 500 })
  }
}
