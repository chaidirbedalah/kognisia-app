'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StartBattleDialog } from '@/components/squad/StartBattleDialog'
import { ScheduledBattlesList } from '@/components/squad/ScheduledBattlesList'
import type { Squad, SquadMember } from '@/lib/squad-types'
import { Users, Crown, Copy, Check, Swords, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

export default function SquadDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const squadId = params.id as string

  const [squad, setSquad] = useState<Squad | null>(null)
  const [members, setMembers] = useState<SquadMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [startBattleOpen, setStartBattleOpen] = useState(false)
  
  // Debug state changes
  useEffect(() => {
    console.log('startBattleOpen changed:', startBattleOpen)
  }, [startBattleOpen])

  const loadSquadDetails = useCallback(async () => {
    if (!squadId) {
      setError('Invalid squad ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`/api/squad/${squadId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load squad details')
      }

      setSquad(data.squad)
      setMembers(data.members)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load squad details')
    } finally {
      setLoading(false)
    }
  }, [squadId])

  useEffect(() => {
    if (squadId) {
      const t = setTimeout(() => {
        loadSquadDetails()
      }, 0)
      return () => clearTimeout(t)
    }
  }, [squadId, loadSquadDetails])

  const copyInviteCode = () => {
    if (squad) {
      navigator.clipboard.writeText(squad.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleBattleCreated = () => {
    // Reload squad details to refresh battles list
    loadSquadDetails()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/squad')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Squads
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-7 w-48 rounded mb-2" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded" />
            <Skeleton className="h-9 w-32 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 rounded mb-2" />
                <Skeleton className="h-3 w-24 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="h-6 w-56">
              <Skeleton className="h-6 w-56 rounded" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="h-6 w-6 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-40 rounded mb-2" />
                        <Skeleton className="h-3 w-24 rounded" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-6 w-20 rounded mb-1" />
                      <Skeleton className="h-3 w-12 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || (!loading && !squad)) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Squad not found'}
            <br />
            <span className="text-xs">Squad ID: {squadId || 'undefined'}</span>
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/squad')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Squads
        </Button>
      </div>
    )
  }

  const isLeader = members.find(m => m.role === 'leader')?.is_current_user

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/squad')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Squads
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">{squad?.name}</h1>
              {isLeader && (
                <Badge className="bg-yellow-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Leader
                </Badge>
              )}
            </div>
            <p className="text-gray-600">
              {members.length}/{squad?.max_members || 0} members
            </p>
          </div>

          {isLeader && (
            <Button
              onClick={() => {
                console.log('Schedule Battle clicked, opening dialog')
                setStartBattleOpen(true)
              }}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={false}
            >
              <Swords className="h-4 w-4 mr-2" />
              Schedule Battle
            </Button>
          )}
        </div>
      </div>

      {/* Scheduled Battles */}
      <div className="mb-6">
        <ScheduledBattlesList squadId={squadId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Invite Code Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Invite Code</CardTitle>
            <CardDescription>Share with friends to join</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600 tracking-wider mb-3">
                {squad?.invite_code}
              </p>
              <Button
                onClick={copyInviteCode}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Squad Members ({members.length})
            </CardTitle>
            <CardDescription>
              Leader can create a battle and share the details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">
                        {member.user_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user_name || 'Unknown'}
                        {member.is_current_user && (
                          <span className="text-sm text-gray-500 ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(member.joined_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.role === 'leader' && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        <Crown className="h-3 w-3 mr-1" />
                        Leader
                      </Badge>
                    )}
                    {member.is_active && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
                    )}
                  </div>
                </div>
              ))}

              {squad && members.length < squad.max_members && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    {squad.max_members - members.length} slot{squad.max_members - members.length > 1 ? 's' : ''} available
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Share the invite code to add more members
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Start a Battle</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-semibold text-purple-600">1.</span>
                <span>Make sure you have at least 2 members in the squad</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-purple-600">2.</span>
                <span>Squad leader clicks &quot;Start Battle&quot; button</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-purple-600">3.</span>
                <span>Select difficulty and start competing!</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-purple-600">4.</span>
                <span>All members answer the same 10 questions</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-purple-600">5.</span>
                <span>See live leaderboard and compete for #1!</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Battle Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>10 questions per battle</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>15 minutes time limit</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>Same questions for all members</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>Ranking based on score & speed</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>Live leaderboard updates in real-time</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Create Battle Dialog */}
      <StartBattleDialog
        open={startBattleOpen}
        onOpenChange={setStartBattleOpen}
        onBattleStarted={handleBattleCreated}
      />
    </div>
  )
}
