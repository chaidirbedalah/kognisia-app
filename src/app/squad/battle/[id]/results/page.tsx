'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { SquadBattle, SquadBattleLeaderboard } from '@/lib/squad-types'
import { Trophy, Medal, Award, Home, RotateCcw, Users } from 'lucide-react'

export default function BattleResultsPage() {
  const router = useRouter()
  const params = useParams()
  const battleId = params.id as string

  const [battle, setBattle] = useState<SquadBattle | null>(null)
  const [leaderboard, setLeaderboard] = useState<SquadBattleLeaderboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResults()
  }, [battleId])

  async function loadResults() {
    try {
      setLoading(true)
      setError('')

      // Load battle details
      const battleResponse = await fetch(`/api/squad/battle/${battleId}`)
      const battleData = await battleResponse.json()

      if (!battleResponse.ok) {
        throw new Error(battleData.error || 'Failed to load battle')
      }

      setBattle(battleData.battle)

      // Load final leaderboard
      const leaderboardResponse = await fetch(`/api/squad/battle/${battleId}/leaderboard`)
      const leaderboardData = await leaderboardResponse.json()

      if (!leaderboardResponse.ok) {
        throw new Error(leaderboardData.error || 'Failed to load leaderboard')
      }

      setLeaderboard(leaderboardData.leaderboard)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 3:
        return <Award className="h-8 w-8 text-orange-600" />
      default:
        return null
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-300'
      case 2:
        return 'bg-gray-50 border-gray-300'
      case 3:
        return 'bg-orange-50 border-orange-300'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      easy: 'Mudah',
      medium: 'Sedang',
      hard: 'Sulit'
    }
    return labels[difficulty] || difficulty
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !battle || !leaderboard) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Results not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/squad')} className="mt-4">
          Back to Squads
        </Button>
      </div>
    )
  }

  const currentUser = leaderboard.participants.find(p => p.is_current_user)
  const winner = leaderboard.participants[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Battle Selesai!</h1>
          <p className="text-gray-600">
            Tingkat Kesulitan: <Badge variant="outline">{getDifficultyLabel(battle.difficulty)}</Badge>
          </p>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300">
            <CardContent className="py-6">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  🎉 {winner.user_name || 'Unknown'} Menang! 🎉
                </h2>
                <p className="text-gray-600">
                  Skor: {winner.score} • Akurasi: {winner.accuracy.toFixed(0)}%
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current User Stats */}
        {currentUser && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Hasil Kamu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-purple-600">#{currentUser.rank}</p>
                  <p className="text-sm text-gray-600">Peringkat</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">{currentUser.score}</p>
                  <p className="text-sm text-gray-600">Skor</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">{currentUser.accuracy.toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">Akurasi</p>
                </div>
              </div>
              <div className="mt-4 bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  {currentUser.correct_answers} dari {currentUser.total_questions} soal benar
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Leaderboard */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leaderboard Final
            </CardTitle>
            <p className="text-sm text-gray-600">
              {leaderboard.total_participants} peserta
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`p-4 rounded-lg border-2 ${getRankColor(participant.rank || 0)} ${
                    participant.is_current_user ? 'ring-2 ring-purple-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 flex justify-center">
                        {getRankIcon(participant.rank || 0) || (
                          <span className="text-xl font-bold text-gray-500">
                            {participant.rank}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {participant.user_name || 'Unknown'}
                          {participant.is_current_user && (
                            <Badge variant="outline" className="ml-2">You</Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {participant.correct_answers}/{participant.total_questions} benar
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {participant.score}
                      </p>
                      <p className="text-sm text-gray-600">
                        {participant.accuracy.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/squad')}
          >
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Squad
          </Button>
          <Button
            onClick={() => router.push(`/squad/${battle.squad_id}`)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Battle Lagi
          </Button>
        </div>
      </div>
    </div>
  )
}
