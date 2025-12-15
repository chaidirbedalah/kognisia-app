import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { spendCoins } from '@/lib/economy'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { battle_id } = await request.json()
    if (!battle_id) {
      return NextResponse.json({ error: 'battle_id is required' }, { status: 400 })
    }
    const { data: battle, error: battleError } = await supabase
      .from('squad_battles')
      .select('id, total_questions, is_hots_mode, battle_type')
      .eq('id', battle_id)
      .single()
    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }
    const { data: existing } = await supabase
      .from('squad_battle_participants')
      .select('id')
      .eq('battle_id', battle_id)
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    const entryCost = battle.is_hots_mode ? 3 : 2
    try {
      const { data: wallet } = await supabase
        .from('ticket_wallet')
        .select('balance')
        .eq('user_id', user.id)
        .single()
      const balance = wallet?.balance ?? 0
      if (balance < entryCost) {
        return NextResponse.json({ error: 'Coins tidak cukup untuk bergabung' }, { status: 400 })
      }
      const { data: alreadyCharged } = await supabase
        .from('ticket_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('reason', 'battle_entry')
        .eq('reference_id', battle_id)
        .limit(1)
        .maybeSingle()
      if (!alreadyCharged) {
        await spendCoins(user.id, entryCost, 'battle_entry', battle_id, {
          battle_type: battle.battle_type,
          is_hots_mode: !!battle.is_hots_mode
        })
      }
    } catch {}
    if (!existing) {
      const { error: insertError } = await supabase
        .from('squad_battle_participants')
        .insert({
          battle_id,
          user_id: user.id,
          total_questions: battle.total_questions || 0
        })
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to join battle'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
