'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Swords, Calendar, BookOpen, Target } from 'lucide-react'

interface ScheduledBattle {
  id: string
  battle_type: 'subtest' | 'mini_tryout'
  subtest_code?: string
  subtest_name?: string
  question_count?: number
  difficulty: 'easy' | 'medium' | 'hard'
  scheduled_start_at: string
  status: 'scheduled' | 'active' | 'completed'
  created_at: string
}

interface ScheduledBattlesListProps {
  squadId: string
}

export function ScheduledBattlesList({ squadId }: ScheduledBattlesListProps) {
  const router = useRouter()
  const [battles, setBattles] = useState<ScheduledBattle[]>([])
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadScheduledBattles()
    
    // Refresh every 30 seconds
    const interval = setInterval(loadScheduledBattles, 30000)
    return () => clearInterval(interval)
  }, [squadId])

  useEffect(() => {
    // Update countdown every second
    const interval = setInterval(() => {
      const newCountdown: { [key: string]: string } = {}
      
      battles.forEach(battle => {
        if (battle.status === 'scheduled') {
          const now = new Date().getTime()
          const start = new Date(battle.scheduled_start_at).getTime()
          const diff = start - now
          
          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            
            if (hours > 0) {
              newCountdown[battle.id] = `${hours}h ${minutes}m ${seconds}s`
            } else if (minutes > 0) {
              newCountdown[battle.id] = `${minutes}m ${seconds}s`
            } else {
              newCountdown[battle.id] = `${seconds}s`
            }
          } else {
            newCountdown[battle.id] = 'Starting...'
          }
        }
      })
      
      setCountdown(newCountdown)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [battles])

  async function loadScheduledBattles() {
    try {
      // Get session token
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession()
      
      if (!session) {
        console.error('No active session')
        return
      }

      const response = await fetch(`/api/squad/${squadId}/battles`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBattles(data.battles || [])
      }
    } catch (error) {
      console.error('Error loading battles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinBattle = (battleId: string, status: string) => {
    if (status === 'active') {
      // Battle is active, go directly to battle page
      router.push(`/squad/battle/${battleId}`)
    } else {
      // Battle is scheduled, go to waiting room
      router.push(`/squad/battle/${battleId}/waiting`)
    }
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading battles...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (battles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Scheduled Battles
          </CardTitle>
          <CardDescription>
            No battles scheduled yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Swords className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              Squad leader can create a battle to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Swords className="h-5 w-5" />
          Scheduled Battles
        </CardTitle>
        <CardDescription>
          {battles.filter(b => b.status === 'scheduled').length} upcoming battle(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {battles.map((battle) => (
            <div
              key={battle.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getDifficultyColor(battle.difficulty)}>
                      {getDifficultyLabel(battle.difficulty)}
                    </Badge>
                    {battle.status === 'scheduled' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Clock className="h-3 w-3 mr-1" />
                        Scheduled
                      </Badge>
                    )}
                    {battle.status === 'active' && (
                      <Badge className="bg-green-500">
                        <Swords className="h-3 w-3 mr-1" />
                        Active Now!
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">
                        {battle.battle_type === 'subtest' 
                          ? `${battle.subtest_name || battle.subtest_code} - ${battle.question_count} soal`
                          : 'Mini Try Out'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(battle.scheduled_start_at).toLocaleString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {battle.status === 'scheduled' && countdown[battle.id] && (
                      <div className="flex items-center gap-2 text-purple-600 font-semibold">
                        <Clock className="h-4 w-4" />
                        <span>Starts in: {countdown[battle.id]}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => handleJoinBattle(battle.id, battle.status)}
                  className={
                    battle.status === 'active'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }
                  size="sm"
                >
                  {battle.status === 'active' ? (
                    <>
                      <Swords className="h-4 w-4 mr-2" />
                      Join Now!
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Enter Room
                    </>
                  )}
                </Button>
              </div>
              
              {battle.status === 'scheduled' && (
                <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-3">
                  <p className="text-xs text-orange-800">
                    ⚠️ Battle will auto-start at scheduled time. Be there or beware!
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
