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

    // Combine with unlock status
    const cosmeticsWithStatus = (allCosmetics || []).map(cosmetic => ({
      ...cosmetic,
      unlocked: unlockedIds.has(cosmetic.id)
    }))

    // Group by type
    const grouped = cosmeticsWithStatus.reduce((acc: any, cosmetic) => {
      if (!acc[cosmetic.type]) {
        acc[cosmetic.type] = []
      }
      acc[cosmetic.type].push(cosmetic)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      cosmetics: cosmeticsWithStatus,
      grouped,
      unlocked_count: unlockedIds.size,
      total_count: allCosmetics?.length || 0
    })

  } catch (error: any) {
    console.error('Error fetching cosmetics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cosmetics' },
      { status: 500 }
    )
  }
}

