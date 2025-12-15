import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let db_ok = false
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      db_ok = !error
    } catch {
      db_ok = false
    }

    return NextResponse.json({
      status: 'ok',
      app: 'kognisia-app',
      server_time: new Date().toISOString(),
      db_ok
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Health check failed'
    return NextResponse.json(
      { status: 'error', error: message },
      { status: 500 }
    )
  }
}

