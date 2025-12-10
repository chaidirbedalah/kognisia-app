'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateSquadDialog } from '@/components/squad/CreateSquadDialog'
import { StartBattleDialog } from '@/components/squad/StartBattleDialog'
import { JoinSquadDialog } from '@/components/squad/JoinSquadDialog'
import { SquadCard } from '@/components/squad/SquadCard'
import { BattleHistoryList } from '@/components/squad/BattleHistoryList'
import type { Squad, SquadBattleHistory } from '@/lib/squad-types'
import { Users, Trophy, Plus, UserPlus, Swords, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SquadPage() {
  const router = useRouter()
  const [squads, setSquads] = useState<Squad[]>([])
  const [history, setHistory] = useState<SquadBattleHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('No active session')
        return
      }

      const headers = {
        'Authorization': `Bearer ${session.access_token}`
      }
      
      // Load squads
      const squadsRes = await fetch('/api/squad/list', { headers })
      if (squadsRes.ok) {
        const squadsData = await squadsRes.json()
        setSquads(squadsData.squads || [])
      }

      // Load battle history
      const historyRes = await fetch('/api/squad/battle/history', { headers })
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setHistory(historyData.history || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSquadCreated = () => {
    // Don't close dialog here - let CreateSquadDialog handle it
    // Just reload data
    loadData()
  }

  const handleSquadJoined = () => {
    setJoinDialogOpen(false)
    loadData()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Squad Battle...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Back to Dashboard */}
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Swords className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900">Squad Battle</h1>
        </div>
        <p className="text-gray-600">
          Kompetisi real-time dengan teman. Buat squad, ajak teman, dan berkompetisi!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Squads</p>
                <p className="text-3xl font-bold text-purple-600">{squads.length}</p>
              </div>
              <Users className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Battles</p>
                <p className="text-3xl font-bold text-orange-600">{history.length}</p>
              </div>
              <Trophy className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Best Rank</p>
                <p className="text-3xl font-bold text-green-600">
                  {history.length > 0 ? `#${Math.min(...history.map(h => h.rank))}` : '-'}
                </p>
              </div>
              <Trophy className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="battles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="battles">Available Battles</TabsTrigger>
          <TabsTrigger value="history">Battle History</TabsTrigger>
        </TabsList>

        {/* Available Battles Tab */}
        <TabsContent value="battles" className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Battle
            </Button>
            <Button
              onClick={() => setJoinDialogOpen(true)}
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join Battle
            </Button>
          </div>

          {/* Battles List */}
          {squads.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Swords className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Ada Battle
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Buat battle baru atau join battle yang sudah ada untuk mulai berkompetisi!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => setCreateDialogOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Battle
                    </Button>
                    <Button
                      onClick={() => setJoinDialogOpen(true)}
                      variant="outline"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Battle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {squads.map((squad) => (
                <SquadCard
                  key={squad.id}
                  squad={squad}
                  onSquadUpdated={loadData}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Battle History Tab */}
        <TabsContent value="history">
          <BattleHistoryList history={history} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StartBattleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onBattleStarted={handleSquadCreated}
      />

      <JoinSquadDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        onSquadJoined={handleSquadJoined}
      />
    </div>
  )
}
