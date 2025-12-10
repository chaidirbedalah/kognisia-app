'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Users, Swords, ArrowLeft, BookOpen, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

  useEffect(() => {
    if (battleId) {
      loadBattleInfo()
    }
  }, [battleId])

  useEffect(() => {
    // Check battle status every 5 seconds
    const interval = setInterval(() => {
      checkBattleStatus()
    }, 5000)

    return () => clearInterval(interval)
  }, [battleId])

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

  async function loadBattleInfo() {
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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function checkBattleStatus() {
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
        // Battle has started! Redirect to battle page
        router.push(`/squad/battle/${battleId}`)
      }
    } catch (error) {
      console.error('Error checking battle status:', error)
    }
  }

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
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Battle not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
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
                  <p className="text-5xl font-bold text-purple-600 mb-4">{countdown}</p>
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
              <p className="text-4xl font-bold text-purple-600 mb-2">{participantCount}</p>
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
