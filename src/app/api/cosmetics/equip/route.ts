import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { cosmetic_id, type } = body

    if (!cosmetic_id || !type) {
      return NextResponse.json(
        { error: 'Cosmetic ID and type are required' },
        { status: 400 }
      )
    }

    // Verify cosmetic exists and user has it
    const { data: cosmetic, error: cosmeticError } = await supabase
      .from('cosmetics')
      .select('*')
      .eq('id', cosmetic_id)
      .single()

    if (cosmeticError || !cosmetic) {
      return NextResponse.json(
        { error: 'Cosmetic not found' },
        { status: 404 }
      )
    }

    // Check if user has this cosmetic
    const { data: userCosmetic } = await supabase
      .from('user_cosmetics')
      .select('id')
      .eq('user_id', user.id)
      .eq('cosmetic_id', cosmetic_id)
      .single()

    if (!userCosmetic) {
      return NextResponse.json(
        { error: 'You do not have this cosmetic' },
        { status: 403 }
      )
    }

    // Get or create customization record
    const { data: customization } = await supabase
      .from('user_profile_customization')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const updateData: any = {}
    updateData[`active_${type}_id`] = cosmetic_id

    if (customization) {
      // Update existing
      const { data: updated, error: updateError } = await supabase
        .from('user_profile_customization')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        message: 'Cosmetic equipped successfully',
        customization: updated
      })
    } else {
      // Create new
      const { data: created, error: createError } = await supabase
        .from('user_profile_customization')
        .insert({
          user_id: user.id,
          ...updateData
        })
        .select()
        .single()

      if (createError) throw createError

      return NextResponse.json({
        success: true,
        message: 'Cosmetic equipped successfully',
        customization: created
      })
    }

  } catch (error: any) {
    console.error('Error equipping cosmetic:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to equip cosmetic' },
      { status: 500 }
    )
  }
}

