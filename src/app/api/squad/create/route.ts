import { NextRequest, NextResponse } from 'next/server'
import { createSquad } from '@/lib/squad-api'
import { isValidSquadName } from '@/lib/squad-types'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    let userId: string | null = null
    // Try SSR cookies session first
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
    const { data: ssrSession } = await ssr.auth.getUser()
    userId = ssrSession?.user?.id || null

    // Fallback to Authorization header Bearer token
    if (!userId) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      const token = authHeader.substring(7)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: tokenUser } = await supabase.auth.getUser(token)
      userId = tokenUser?.user?.id || null
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Get current user
    const currentUserId = userId

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
    const squad = await createSquad(currentUserId, { name, max_members })

    return NextResponse.json({
      success: true,
      squad,
      invite_code: squad.invite_code
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to create squad'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
