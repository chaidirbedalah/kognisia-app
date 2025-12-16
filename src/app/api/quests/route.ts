import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Attempt to load quests from DB (optional tables). Fallback to sample.
    const weekly = await buildWeeklySample()
    const season = await buildSeasonSample()

    return NextResponse.json({ success: true, weekly, season })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch quests'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    if (body.action === 'complete_task' && body.task_id) {
      // In a real setup, increment progress in user_quests_tasks table
      // Here we no-op and return success
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update quest'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    if (body.action === 'claim' && body.quest_id) {
      // In a real setup, mark quest claimed and add points to user economy
      // Here we no-op and return success
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to claim quest'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function buildWeeklySample() {
  return [
    {
      id: 'weekly-1',
      type: 'weekly',
      title: 'Mingguan: Konsistensi Belajar',
      description: 'Selesaikan latihan harian dan battle',
      tasks: [
        { id: 't1', code: 'daily_5', title: 'Selesaikan 5 Daily Challenge', target: 5, progress: 3, reward_points: 50, completed: false },
        { id: 't2', code: 'battle_2', title: 'Ikut 2 Squad Battle', target: 2, progress: 2, reward_points: 30, completed: true },
        { id: 't3', code: 'tryout_1', title: 'Selesaikan 1 Mini Try Out', target: 1, progress: 0, reward_points: 40, completed: false }
      ],
      total_reward_points: 120,
      claimed: false
    },
    {
      id: 'weekly-2',
      type: 'weekly',
      title: 'Mingguan: Akurasi',
      description: 'Jaga akurasi dan coba challenge',
      tasks: [
        { id: 't4', code: 'accuracy_70', title: 'Pertahankan akurasi 70%+', target: 1, progress: 1, reward_points: 60, completed: true },
        { id: 't5', code: 'challenge_10', title: 'Selesaikan 10 soal challenge', target: 10, progress: 7, reward_points: 50, completed: false }
      ],
      total_reward_points: 110,
      claimed: false
    }
  ]
}

async function buildSeasonSample() {
  return {
    id: 'season-2025-1',
    type: 'season',
    title: 'Season Alpha 2025',
    description: 'Kumpulkan poin dan capai target season',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    tasks: [
      { id: 's1', code: 'points_1000', title: 'Kumpulkan 1000 poin', target: 1000, progress: 420, reward_points: 200, completed: false },
      { id: 's2', code: 'achievements_10', title: 'Unlock 10 achievements', target: 10, progress: 6, reward_points: 150, completed: false }
    ],
    total_reward_points: 400,
    claimed: false
  }
}

