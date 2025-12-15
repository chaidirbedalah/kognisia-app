import { createClient } from '@supabase/supabase-js'

type EconomyResult = {
  balance?: number
  awarded?: number
  spent?: number
  total_xp?: number
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function ensureWallet(userId: string): Promise<void> {
  const supabase = getServiceClient()
  await supabase.rpc('ensure_ticket_wallet', { p_user_id: userId })
}

export async function awardXP(
  userId: string,
  amount: number,
  source: string,
  difficulty?: 'easy' | 'medium' | 'hots',
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = getServiceClient()
  await supabase.from('xp_events').insert({
    user_id: userId,
    amount,
    source,
    difficulty: difficulty || null,
    metadata,
    created_at: new Date().toISOString()
  })
}

export async function awardTickets(
  userId: string,
  delta: number,
  reason: string,
  referenceId?: string,
  metadata: Record<string, unknown> = {},
  cap: number = 12
): Promise<EconomyResult> {
  const supabase = getServiceClient()
  await ensureWallet(userId)

  if (referenceId) {
    const { data: existing } = await supabase
      .from('ticket_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('reason', reason)
      .eq('reference_id', referenceId)
      .limit(1)
      .maybeSingle()
    if (existing) {
      const { data: wallet } = await supabase
        .from('ticket_wallet')
        .select('balance')
        .eq('user_id', userId)
        .single()
      return { balance: wallet?.balance ?? 0, awarded: 0 }
    }
  } else {
    const today = new Date().toISOString().split('T')[0]
    const { data: existingToday } = await supabase
      .from('ticket_transactions')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('reason', reason)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`)
      .limit(1)
      .maybeSingle()
    if (existingToday) {
      const { data: wallet } = await supabase
        .from('ticket_wallet')
        .select('balance')
        .eq('user_id', userId)
        .single()
      return { balance: wallet?.balance ?? 0, awarded: 0 }
    }
  }

  const { data: wallet } = await supabase
    .from('ticket_wallet')
    .select('balance')
    .eq('user_id', userId)
    .single()

  const current = wallet?.balance ?? 0
  const newBalance = Math.min(cap, current + delta)
  const effectiveDelta = newBalance - current

  if (effectiveDelta !== 0) {
    await supabase.from('ticket_transactions').insert({
      user_id: userId,
      delta: effectiveDelta,
      reason,
      reference_id: referenceId || null,
      metadata,
      created_at: new Date().toISOString()
    })
    await supabase
      .from('ticket_wallet')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  }

  return { balance: newBalance, awarded: effectiveDelta }
}

// Coins API built on top of ticket wallet where base unit = bronze coin
export function decomposeCoins(totalBronze: number) {
  const gold = Math.floor(totalBronze / 100)
  const remainderAfterGold = totalBronze % 100
  const silver = Math.floor(remainderAfterGold / 10)
  const bronze = remainderAfterGold % 10
  return { bronze, silver, gold, totalBronze }
}

export async function awardCoins(
  userId: string,
  bronzeDelta: number,
  reason: string,
  referenceId?: string,
  metadata: Record<string, unknown> = {}
): Promise<EconomyResult & { coins?: { bronze: number; silver: number; gold: number; totalBronze: number } }> {
  const res = await awardTickets(userId, bronzeDelta, reason, referenceId, metadata, Number.MAX_SAFE_INTEGER)
  const summary = await getEconomySummary(userId)
  const coins = decomposeCoins(summary.balance || 0)
  return { ...res, coins }
}

export async function spendCoins(
  userId: string,
  bronzeAmount: number,
  reason: string,
  referenceId?: string,
  metadata: Record<string, unknown> = {}
): Promise<EconomyResult & { coins?: { bronze: number; silver: number; gold: number; totalBronze: number } }> {
  const res = await spendTickets(userId, bronzeAmount, reason, referenceId, metadata)
  const summary = await getEconomySummary(userId)
  const coins = decomposeCoins(summary.balance || 0)
  return { ...res, coins }
}

export async function spendTickets(
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string,
  metadata: Record<string, unknown> = {}
): Promise<EconomyResult> {
  const supabase = getServiceClient()
  await ensureWallet(userId)

  const { data: wallet } = await supabase
    .from('ticket_wallet')
    .select('balance')
    .eq('user_id', userId)
    .single()

  const current = wallet?.balance ?? 0
  const spend = Math.min(amount, current)
  const newBalance = current - spend

  if (spend > 0) {
    await supabase.from('ticket_transactions').insert({
      user_id: userId,
      delta: -spend,
      reason,
      reference_id: referenceId || null,
      metadata,
      created_at: new Date().toISOString()
    })
    await supabase
      .from('ticket_wallet')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  }

  return { balance: newBalance, spent: spend }
}

export async function getEconomySummary(userId: string): Promise<EconomyResult> {
  const supabase = getServiceClient()
  await ensureWallet(userId)

  const { data: wallet } = await supabase
    .from('ticket_wallet')
    .select('balance')
    .eq('user_id', userId)
    .single()

  let totalXP = 0
  const { data: xpAgg } = await supabase
    .from('xp_totals')
    .select('total_xp')
    .eq('user_id', userId)
    .single()
  if (xpAgg && typeof xpAgg.total_xp === 'number') {
    totalXP = xpAgg.total_xp
  } else {
    const { data: xpSum } = await supabase
      .from('xp_events')
      .select('amount')
      .eq('user_id', userId)
    totalXP = (xpSum || []).reduce((acc, row: { amount: number }) => acc + (row.amount || 0), 0)
  }

  return { balance: wallet?.balance ?? 0, total_xp: totalXP }
}
