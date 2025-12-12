'use client'

import { useParams, useRouter } from 'next/navigation'
import { BattleLeaderboard } from '@/components/squad/BattleLeaderboard'
import { ArrowLeft } from 'lucide-react'

export default function BattleLeaderboardPage() {
  const params = useParams()
  const router = useRouter()
  const battleId = params.id as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              🏆 Battle Leaderboard
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time rankings and performance metrics
            </p>
          </div>
        </div>

        {/* Leaderboard Component */}
        <BattleLeaderboard battleId={battleId} autoRefresh={true} refreshInterval={5000} />
      </div>
    </div>
  )
}
