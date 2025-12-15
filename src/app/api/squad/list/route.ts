import { NextRequest, NextResponse } from 'next/server'
import { getUserSquads } from '@/lib/squad-api'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAnonClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
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

    // Get user's squads
    const squads = await getUserSquads(currentUserId!)

    return NextResponse.json({
      success: true,
      squads
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch squads'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
