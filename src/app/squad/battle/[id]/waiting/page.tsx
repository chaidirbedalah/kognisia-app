'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Users, Swords, ArrowLeft, BookOpen, Target, Trophy, Wifi } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { toast } from 'sonner'

interface BattleInfo {
  id: string
  battle_type: 'subtest' | 'mini_tryout'
  subtest_code?: string
  subtest_name?: string
  question_count?: number
  difficulty: string
  scheduled_start_at: string
  status: string
  squad_id: string
  squad_name: string
}

export default function BattleWaitingRoomPage() {
  const router = useRouter()
  const params = useParams()
  const battleId = params.id as string

  const [battle, setBattle] = useState<BattleInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState('')
  const [participantCount, setParticipantCount] = useState(0)
  const [coins, setCoins] = useState<{ bronze: number; silver: number; gold: number; totalBronze: number } | null>(null)
  const prevParticipantRef = useRef(0)
  const [pulseParticipants, setPulseParticipants] = useState(false)

  const loadBattleInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`/api/squad/battle/${battleId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load battle info')
      }

      setBattle(data.battle)
      setParticipantCount(data.participant_count || 0)

      if (!data.is_participant) {
        const joinRes = await fetch('/api/battle/join', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ battle_id: battleId })
        })
        const joinJson = await joinRes.json()
        if (!joinRes.ok) {
          toast.error(joinJson.error || 'Gagal auto-join battle')
          throw new Error(joinJson.error || 'Failed to auto-join battle')
        }
        toast.success('Berhasil auto-join. Biaya Coins dipotong.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load battle info')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const res = await fetch('/api/economy/summary', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          if (res.ok) {
            const json = await res.json()
            setCoins(json.coins || null)
          }
        }
      } catch {}
    } finally {
      setLoading(false)
    }
  }, [battleId])

  const checkBattleStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/squad/battle/${battleId}/status`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      const data = await response.json()

      if (data.status === 'active') {
        router.push(`/squad/battle/${battleId}`)
      }
    } catch (error: unknown) {
      console.error('Error checking battle status:', error)
    }
  }, [battleId, router])
  useEffect(() => {
    if (battleId) {
      loadBattleInfo()
    }
  }, [battleId, loadBattleInfo])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    let mounted = true

    const setupRealtime = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        channel = supabase
          .channel(`battle-${battleId}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'squad_battles',
            filter: `id=eq.${battleId}`
          }, async () => {
            if (!mounted) return
            await checkBattleStatus()
          })
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'squad_battle_participants',
            filter: `battle_id=eq.${battleId}`
          }, async () => {
            if (!mounted) return
            await refreshParticipantCount()
          })
          .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'squad_battle_participants',
            filter: `battle_id=eq.${battleId}`
          }, async () => {
            if (!mounted) return
            await refreshParticipantCount()
          })
          .subscribe()
      } catch (e) {
        console.error('Error setting up realtime', e)
      }
    }

    const refreshParticipantCount = async () => {
      try {
        const { count } = await supabase
          .from('squad_battle_participants')
          .select('user_id', { count: 'exact', head: true })
          .eq('battle_id', battleId)
        setParticipantCount(count || 0)
      } catch {}
    }

    setupRealtime()
    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [battleId, checkBattleStatus])

  useEffect(() => {
    if (participantCount !== prevParticipantRef.current) {
      setPulseParticipants(true)
      const t = setTimeout(() => setPulseParticipants(false), 600)
      prevParticipantRef.current = participantCount
      return () => clearTimeout(t)
    }
  }, [participantCount])

  useEffect(() => {
    // Update countdown every second
    if (!battle || battle.status !== 'scheduled') return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const start = new Date(battle.scheduled_start_at).getTime()
      const diff = start - now

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m ${seconds}s`)
        } else if (minutes > 0) {
          setCountdown(`${minutes}m ${seconds}s`)
        } else {
          setCountdown(`${seconds}s`)
        }
      } else {
        setCountdown('Starting...')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [battle])

  

  

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading battle info...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !battle) {
    const insufficient = (error || '').toLowerCase().includes('coins tidak cukup')
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {insufficient ? 'Coins kamu tidak cukup untuk bergabung ke battle ini.' : (error || 'Battle not found')}
          </AlertDescription>
        </Alert>
        {insufficient && coins && (
          <div className="mt-3 text-sm text-gray-700">
            <p>Saldo saat ini: Gold {coins.gold} • Silver {coins.silver} • Bronze {coins.bronze} (Total {coins.totalBronze})</p>
          </div>
        )}
        <div className="flex gap-3 mt-4">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          {insufficient && (
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Lihat Dashboard
            </Button>
          )}
          {insufficient && (
            <>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/daily-challenge')}>
                Daily Challenge
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => router.push('/cohort')}>
                Buka Cohort
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Mudah'
      case 'medium': return 'Sedang'
      case 'hard': return 'Sulit'
      default: return difficulty
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push(`/squad/${battle.squad_id}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Squad
      </Button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
          <Swords className="h-10 w-10 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Battle Waiting Room</h1>
        <p className="text-gray-600">{battle.squad_name}</p>
      </div>

      {/* Countdown Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">
            {battle.status === 'scheduled' ? (
              <>
                <div className="mb-4">
                  <Clock className="h-16 w-16 text-purple-600 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm text-gray-600 mb-2">Battle starts in</p>
                  <p className="text-5xl font-bold text-purple-600 mb-4" aria-live="polite" aria-label="Countdown ke mulai">{countdown}</p>
                  <p className="text-gray-600">
                    {new Date(battle.scheduled_start_at).toLocaleString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Alert className="bg-orange-50 border-orange-200">
                  <AlertDescription className="text-orange-800">
                    ⚠️ Battle will auto-start at scheduled time. Stay on this page!
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <>
                <Swords className="h-16 w-16 text-green-600 mx-auto mb-3 animate-bounce" />
                <p className="text-2xl font-bold text-green-600 mb-2">Battle is Starting!</p>
                <p className="text-gray-600">Redirecting to battle...</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Link */}
      <div className="mb-6">
        <Link href={`/squad/battle/${battleId}/leaderboard`} aria-label="Lihat leaderboard live">
          <Button className="group w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Trophy className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
            View Live Leaderboard
            <span className="ml-auto inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded">
              <Wifi className="h-3 w-3" />
              Live
            </span>
          </Button>
        </Link>
      </div>

      {/* Battle Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Battle Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="font-medium">
                {battle.battle_type === 'subtest' ? 'Subtest' : 'Mini Try Out'}
              </span>
            </div>
            {battle.battle_type === 'subtest' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtest:</span>
                  <span className="font-medium">{battle.subtest_name || battle.subtest_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Questions:</span>
                  <span className="font-medium">{battle.question_count} soal</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Difficulty:</span>
              <Badge className={getDifficultyColor(battle.difficulty)}>
                {getDifficultyLabel(battle.difficulty)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className={`text-4xl font-bold text-purple-600 mb-2 transition-transform ${pulseParticipants ? 'scale-110' : ''}`} aria-live="polite">{participantCount}</p>
              <p className="text-sm text-gray-600">members ready</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Get Ready!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-purple-600">•</span>
              <span>Stay on this page until the battle starts</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600">•</span>
              <span>You will be automatically redirected when the battle begins</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600">•</span>
              <span>Make sure you have a stable internet connection</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600">•</span>
              <span>Late joiners will have less time to complete the battle</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
