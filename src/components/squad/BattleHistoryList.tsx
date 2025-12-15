'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SquadBattleHistory } from '@/lib/squad-types'
import { Trophy, Calendar, Users } from 'lucide-react'
import { getDifficultyLabel } from '@/lib/squad-types'

interface BattleHistoryListProps {
  history: SquadBattleHistory[]
}

export function BattleHistoryList({ history }: BattleHistoryListProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Battle History
            </h3>
            <p className="text-gray-600">
              Start a Squad Battle to see your history here!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (rank === 2) return 'text-gray-600 bg-gray-50 border-gray-200'
    if (rank === 3) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="space-y-4">
      {history.map((battle) => (
        <Card key={battle.battle_id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {battle.squad_name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={
                      battle.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                      battle.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }
                  >
                    {getDifficultyLabel(battle.difficulty)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(battle.date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{battle.total_participants} participants</span>
                  </div>
                </div>
              </div>

              {/* Rank Badge */}
              <div className={`flex items-center justify-center w-16 h-16 rounded-full border-2 ${getRankColor(battle.rank)}`}>
                <span className="text-2xl font-bold">
                  {getRankIcon(battle.rank)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-600 mb-1">Score</p>
                <p className="text-2xl font-bold text-purple-600">{battle.score}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-green-600">{battle.accuracy.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
