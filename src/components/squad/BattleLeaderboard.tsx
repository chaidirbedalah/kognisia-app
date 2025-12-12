'use client'

import { useEffect, useState } from 'react'
import { Trophy, Medal, Zap } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  user_id: string
  score: number
  correct_answers: number
  total_questions: number
  accuracy: number
  rank: number
  badge: string | null
  time_taken_seconds: number | null
  completed_at: string | null
  user: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  }
}

interface BattleLeaderboardProps {
  battleId: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function BattleLeaderboard({
  battleId,
  autoRefresh = true,
  refreshInterval = 5000
}: BattleLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/squad/battle/${battleId}/leaderboard`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }

      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
      setStats(data.stats)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()

    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [battleId, autoRefresh, refreshInterval])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin">⏳ Loading leaderboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Battle Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600">Participants</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total_participants}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-900">{stats.completed_participants}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600">Avg Score</p>
            <p className="text-2xl font-bold text-purple-900">{stats.average_score}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-600">Avg Accuracy</p>
            <p className="text-2xl font-bold text-orange-900">{Math.round(stats.average_accuracy * 100)}%</p>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Correct</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Accuracy</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Time</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No participants yet
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-gray-50 transition ${
                      index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-orange-50' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                        {index === 2 && <Medal className="h-5 w-5 text-orange-400" />}
                        <span className="font-bold text-lg">{entry.rank}</span>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {entry.user.avatar_url && (
                          <img
                            src={entry.user.avatar_url}
                            alt={entry.user.full_name}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{entry.user.full_name}</p>
                          <p className="text-xs text-gray-500">{entry.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-lg text-purple-600">{entry.score}</span>
                    </td>

                    {/* Correct Answers */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-green-600">
                        {entry.correct_answers}/{entry.total_questions}
                      </span>
                    </td>

                    {/* Accuracy */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${entry.accuracy * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {Math.round(entry.accuracy * 100)}%
                        </span>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 text-center">
                      {entry.time_taken_seconds ? (
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">
                            {Math.floor(entry.time_taken_seconds / 60)}m {entry.time_taken_seconds % 60}s
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {entry.completed_at ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          ✓ Completed
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          ⏳ In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-2">🏆 Badges:</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div>🥇 1st Place - Gold</div>
          <div>🥈 2nd Place - Silver</div>
          <div>🥉 3rd Place - Bronze</div>
        </div>
      </div>
    </div>
  )
}
