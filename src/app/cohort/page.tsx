'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type CoinsSummary = { bronze: number; silver: number; gold: number; totalBronze: number }
type EventChallenge = { id: string; challenge_code: string; description?: string; points?: number; difficulty?: string; icon?: string }
type CohortEvent = {
  id: string
  name: string
  description?: string
  icon?: string
  start_date?: string
  end_date?: string
  bonus_multiplier?: number
  status?: string
  event_challenges?: EventChallenge[]
  isJoined?: boolean
  userStats?: { total_points: number; challenges_completed: number }
  userProgress?: Record<string, { completed_at?: string; points_earned?: number }>
}

export default function CohortPage() {
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [coins, setCoins] = useState<CoinsSummary | null>(null)
  const [events, setEvents] = useState<CohortEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [completionPercent, setCompletionPercent] = useState<number>(80)
  const [cohortId, setCohortId] = useState<string | null>(null)
  const [loadingJoin, setLoadingJoin] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)

  const ensureCohortId = useCallback(() => {
    let id = localStorage.getItem('current-cohort-id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('current-cohort-id', id)
    }
    setCohortId(id)
    return id
  }, [])

  const loadSessionAndSummary = useCallback(async () => {
    try {
      setLoadingSummary(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setSessionToken(session.access_token)
      const res = await fetch('/api/economy/summary', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (res.ok) {
        const json = await res.json()
        setCoins(json.coins || { bronze: 0, silver: 0, gold: 0, totalBronze: 0 })
      }
      const evRes = await fetch('/api/events/active')
      if (evRes.ok) {
        const json = await evRes.json()
        const list = (json.events || []) as CohortEvent[]
        setEvents(list)
        if (list.length > 0) {
          setSelectedEventId(list[0].id)
        }
      }
    } catch {
    } finally {
      setLoadingSummary(false)
    }
  }, [])

  useEffect(() => {
    ensureCohortId()
    loadSessionAndSummary()
  }, [ensureCohortId, loadSessionAndSummary])

  const joinSelected = useCallback(async () => {
    if (!sessionToken) {
      toast.error('Silakan login terlebih dahulu')
      return
    }
    const id = selectedEventId || cohortId || ensureCohortId()
    try {
      setLoadingJoin(true)
      const res = await fetch('/api/cohort/join', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cohort_id: id })
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal bergabung cohort')
        return
      }
      if (selectedEventId) {
        const joinEv = await fetch('/api/events/join', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ eventId: selectedEventId })
        })
        const joinEvJson = await joinEv.json()
        if (!joinEv.ok && !(joinEvJson?.error || '').includes('Already joined')) {
          toast.error(joinEvJson.error || 'Gagal mendaftar event')
          return
        }
      }
      toast.success('Berhasil bergabung cohort. Biaya 1 Coin dipotong.')
      await loadSessionAndSummary()
    } catch {
      toast.error('Gagal bergabung cohort')
    } finally {
      setLoadingJoin(false)
    }
  }, [sessionToken, cohortId, selectedEventId, ensureCohortId, loadSessionAndSummary])

  const handleComplete = useCallback(async () => {
    if (!sessionToken) {
      toast.error('Silakan login terlebih dahulu')
      return
    }
    const id = selectedEventId || cohortId || ensureCohortId()
    try {
      setLoadingComplete(true)
      const res = await fetch('/api/cohort/complete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cohort_id: id, completion_percent: completionPercent })
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal menyelesaikan cohort')
        return
      }
      if (json.message && json.message.includes('below 80')) {
        toast.info('Completion < 80%. Tidak ada reward Coin.')
      } else {
        toast.success('+3 Coins untuk menyelesaikan cohort')
        await loadSessionAndSummary()
      }
    } catch {
      toast.error('Gagal menyelesaikan cohort')
    } finally {
      setLoadingComplete(false)
    }
  }, [sessionToken, cohortId, selectedEventId, ensureCohortId, completionPercent, loadSessionAndSummary])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Cohort</h1>
          <p className="text-gray-600">Belajar terstruktur dengan biaya 1 Coin dan reward 3 Coins saat selesai ≥80%</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Coins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Status Cohort</span>
                <Badge className={(events.find(e => e.id === selectedEventId)?.isJoined) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {(events.find(e => e.id === selectedEventId)?.isJoined) ? 'Sudah Bergabung' : 'Belum Bergabung'}
                </Badge>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Challenges Selesai</span>
                  <span className="font-medium">
                    {(events.find(e => e.id === selectedEventId)?.userStats?.challenges_completed) ?? 0}
                    /
                    {(events.find(e => e.id === selectedEventId)?.event_challenges?.length) ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Poin</span>
                  <span className="font-medium">
                    {(events.find(e => e.id === selectedEventId)?.userStats?.total_points) ?? 0}
                  </span>
                </div>
                <div>
                  {(() => {
                    const ev = events.find(e => e.id === selectedEventId)
                    const total = ev?.event_challenges?.length ?? 0
                    const done = ev?.userStats?.challenges_completed ?? 0
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    return (
                      <div>
                        <Progress value={pct} />
                        <p className="text-xs text-gray-500 mt-2">{pct}% progress</p>
                      </div>
                    )
                  })()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gold</span>
                  <span className="font-medium">{coins?.gold ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Silver</span>
                  <span className="font-medium">{coins?.silver ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bronze</span>
                  <span className="font-medium">{coins?.bronze ?? '-'}</span>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={joinSelected}
                disabled={(events.find(e => e.id === selectedEventId)?.isJoined) || loadingJoin || loadingSummary}
              >
                {loadingJoin ? 'Memproses...' : (events.find(e => e.id === selectedEventId)?.isJoined) ? 'Sudah Bergabung' : 'Gabung Cohort (Biaya 1 Coin)'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selesaikan Cohort</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="selected">Pilih Cohort</Label>
                  <select
                    id="selected"
                    className="w-full border rounded-md h-9 px-2 bg-white"
                    value={selectedEventId || ''}
                    onChange={(e) => setSelectedEventId(e.target.value || null)}
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.icon ? `${ev.icon} ` : ''}{ev.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="completion">Completion (%)</Label>
                  <Input
                    id="completion"
                    type="number"
                    min={0}
                    max={100}
                    value={completionPercent}
                    onChange={(e) => setCompletionPercent(parseInt(e.target.value || '0'))}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleComplete}
                  disabled={!(events.find(e => e.id === selectedEventId)?.isJoined) || loadingComplete}
                >
                  {loadingComplete ? 'Memproses...' : 'Selesaikan'}
                </Button>
                <p className="text-xs text-gray-500">
                  Reward +3 Coins hanya diberikan jika completion ≥ 80%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(ev => (
            <Card key={ev.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{ev.icon || '📚'}</span>
                  <span>{ev.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{ev.description || ''}</p>
                <div className="flex items-center justify-between">
                  <Badge className={ev.isJoined ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {ev.isJoined ? 'Sudah Bergabung' : 'Belum Bergabung'}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedEventId(ev.id)
                      if (!ev.isJoined) {
                        joinSelected()
                      }
                    }}
                    disabled={loadingJoin || ev.isJoined}
                  >
                    {ev.isJoined ? 'Bergabung' : 'Gabung (1 Coin)'}
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Challenges</span>
                    <span className="text-xs font-medium">
                      {ev.userStats?.challenges_completed ?? 0}/{ev.event_challenges?.length ?? 0}
                    </span>
                  </div>
                  {(() => {
                    const total = ev.event_challenges?.length ?? 0
                    const done = ev.userStats?.challenges_completed ?? 0
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    return <Progress value={pct} />
                  })()}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Total Poin</span>
                    <span className="text-xs font-medium">{ev.userStats?.total_points ?? 0}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Daftar Challenges</p>
                  <div className="space-y-2">
                    {(ev.event_challenges || []).map((ch) => {
                      const progress = ev.userProgress?.[ch.id]
                      const isDone = !!progress?.completed_at
                      return (
                        <div key={ch.id} className="flex items-center justify-between text-xs border rounded-md px-2 py-1 bg-white">
                          <div className="flex items-center gap-2">
                            <span>{ch.icon || '🏁'}</span>
                            <span className="font-medium">{ch.challenge_code}</span>
                            <span className="text-gray-500">{ch.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={isDone ? 'text-green-600' : 'text-gray-600'}>
                              {isDone ? 'Selesai' : 'Belum'}
                            </span>
                            <span className="text-gray-600">
                              {isDone && typeof progress?.points_earned === 'number'
                                ? `${progress.points_earned} pts`
                                : `${Math.floor(ch.points || 0)} pts`}
                            </span>
                            {isDone && progress?.completed_at && (
                              <span className="text-gray-500">
                                {new Date(progress.completed_at).toLocaleString('id-ID')}
                              </span>
                            )}
                            {!isDone && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (!sessionToken) {
                                    toast.error('Silakan login terlebih dahulu')
                                    return
                                  }
                                  try {
                                    const res = await fetch('/api/events/complete-challenge', {
                                      method: 'POST',
                                      headers: {
                                        Authorization: `Bearer ${sessionToken}`,
                                        'Content-Type': 'application/json'
                                      },
                                      body: JSON.stringify({ eventId: ev.id, challengeId: ch.id })
                                    })
                                    const json = await res.json()
                                    if (!res.ok) {
                                      toast.error(json.error || 'Gagal menandai selesai')
                                      return
                                    }
                                    toast.success('Challenge ditandai selesai')
                                    await loadSessionAndSummary()
                                  } catch {
                                    toast.error('Gagal menandai selesai')
                                  }
                                }}
                              >
                                Tandai Selesai
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
