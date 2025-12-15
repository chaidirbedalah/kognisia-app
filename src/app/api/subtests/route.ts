import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: subtests, error } = await supabase
      .from('subtests')
      .select('code, name, description')
      .order('display_order')

    if (error) throw error

    return NextResponse.json({ subtests })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch subtests'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
