'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SquadBattle } from '@/lib/squad-types'
import { getTimeUntilBattle, getDifficultyLabel, getDifficultyColor } from '@/lib/squad-types'
import { Clock, Swords, Users, AlertCircle } from 'lucide-react'

interface ScheduledBattleCardProps {
  battle: SquadBattle
}

export function ScheduledBattleCard({ battle }: ScheduledBattleCardProps) {
  const router = useRouter()
  const [timeUntil, setTimeUntil] = useState('')
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    if (!battle.scheduled_start_at) return

    const updateTime = () => {
      const now = new Date()
      const scheduled = new Date(battle.scheduled_start_at!)
      
      if (now >= scheduled) {
        setIsStarted(true)
        setTimeUntil('Battle Started!')
      } else {
        setTimeUntil(getTimeUntilBattle(battle.scheduled_start_at!))
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000) // Update every second

    return () => clearInterval(interval)
  }, [battle.scheduled_start_at])

  const handleJoinBattle = () => {
    router.push(`/squad/battle/${battle.id}`)
  }

  const difficultyColor = getDifficultyColor(battle.difficulty)
  const scheduledTime = battle.scheduled_start_at 
    ? new Date(battle.scheduled_start_at).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''

  return (
    <Card className={`${isStarted ? 'border-orange-500 border-2' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Swords className="h-5 w-5 text-purple-600" />
              {battle.squad_name || 'Squad Battle'}
            </CardTitle>
            <CardDescription className="mt-1">
              {battle.battle_type === 'subtest' 
                ? `${battle.subtest_name || 'Subtest'} - ${battle.question_count} soal`
                : 'Mini Try Out - All Subtests'
              }
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`
              ${difficultyColor === 'green' ? 'bg-green-50 text-green-700' : ''}
              ${difficultyColor === 'yellow' ? 'bg-yellow-50 text-yellow-700' : ''}
              ${difficultyColor === 'red' ? 'bg-red-50 text-red-700' : ''}
            `}
          >
            {getDifficultyLabel(battle.difficulty)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scheduled Time */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">
              {isStarted ? 'Battle Started!' : 'Scheduled Time'}
            </p>
          </div>
          <p className="text-lg font-bold text-purple-600">
            {scheduledTime}
          </p>
          <p className={`text-sm mt-1 ${isStarted ? 'text-orange-600 font-semibold' : 'text-purple-700'}`}>
            {timeUntil}
          </p>
        </div>

        {/* Warning */}
        {!isStarted && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Be there or beware!
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Battle will auto-start. Late joiners will have less time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{battle.participant_count || 0} joined</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{battle.time_limit_minutes} menit</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleJoinBattle}
          className={`w-full ${isStarted ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {isStarted ? (
            <>
              <Swords className="h-4 w-4 mr-2" />
              Join Battle Now!
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-2" />
              View Details
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
