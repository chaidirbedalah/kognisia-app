'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Squad } from '@/lib/squad-types'
import { Users, Crown, Copy, Check, Swords, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SquadCardProps {
  squad: Squad
  onSquadUpdated: () => void
}

export function SquadCard({ squad, onSquadUpdated }: SquadCardProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const copyInviteCode = () => {
    navigator.clipboard.writeText(squad.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeaveSquad = async () => {
    if (!confirm('Are you sure you want to leave this squad?')) {
      return
    }

    setLeaving(true)
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('No active session')
        return
      }

      const response = await fetch(`/api/squad/${squad.id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        onSquadUpdated()
      } else {
        const data = await response.json()
        alert(`Failed to leave squad: ${data.error}`)
      }
    } catch (error) {
      console.error('Error leaving squad:', error)
      alert('Failed to leave squad')
    } finally {
      setLeaving(false)
    }
  }

  const handleViewDetails = () => {
    console.log('Squad object:', squad)
    console.log('Squad ID:', squad.id)
    
    if (!squad.id) {
      alert('Squad ID is missing!')
      return
    }
    
    router.push(`/squad/${squad.id}`)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {squad.name}
              {squad.leader_id && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span>{squad.member_count || 0}/{squad.max_members} members</span>
              </div>
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-purple-50">
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Invite Code */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Invite Code</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-purple-600 tracking-wider">
              {squad.invite_code}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyInviteCode}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleViewDetails}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            <Swords className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button
            onClick={handleLeaveSquad}
            variant="outline"
            size="icon"
            disabled={leaving}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
