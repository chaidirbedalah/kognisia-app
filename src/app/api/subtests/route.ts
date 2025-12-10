import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: subtests, error } = await supabase
      .from('subtests')
      .select('code, name, description')
      .order('display_order')

    if (error) throw error

    return NextResponse.json({ subtests })
  } catch (error: any) {
    console.error('Error fetching subtests:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subtests' },
      { status: 500 }
    )
  }
}
