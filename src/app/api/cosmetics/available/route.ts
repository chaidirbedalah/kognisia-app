import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all cosmetics
    const { data: allCosmetics, error: cosmeticsError } = await supabase
      .from('cosmetics')
      .select('*')
      .order('type', { ascending: true })
      .order('rarity', { ascending: false })

    if (cosmeticsError) throw cosmeticsError

    // Get user's unlocked cosmetics
    const { data: userCosmetics, error: userCosmeticsError } = await supabase
      .from('user_cosmetics')
      .select('cosmetic_id')
      .eq('user_id', user.id)

    if (userCosmeticsError) throw userCosmeticsError

    const unlockedIds = new Set(userCosmetics?.map(c => c.cosmetic_id) || [])

    type Cosmetic = { id: string; type: string } & Record<string, unknown>
    const items = (allCosmetics ?? []) as unknown as Cosmetic[]
    const cosmeticsWithStatus = items.map((cosmetic) => ({
      ...cosmetic,
      unlocked: unlockedIds.has(cosmetic.id)
    }))

    const grouped: Record<string, Cosmetic[]> = cosmeticsWithStatus.reduce(
      (acc, cosmetic) => {
        if (!acc[cosmetic.type]) {
          acc[cosmetic.type] = []
        }
        acc[cosmetic.type].push(cosmetic)
        return acc
      },
      {} as Record<string, Cosmetic[]>
    )

    return NextResponse.json({
      success: true,
      cosmetics: cosmeticsWithStatus,
      grouped,
      unlocked_count: unlockedIds.size,
      total_count: allCosmetics?.length || 0
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch cosmetics'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
