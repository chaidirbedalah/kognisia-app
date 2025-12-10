'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'

interface JoinSquadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSquadJoined: () => void
}

export function JoinSquadDialog({
  open,
  onOpenChange,
  onSquadJoined
}: JoinSquadDialogProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/squad/join', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ invite_code: inviteCode.toUpperCase() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join squad')
      }

      onSquadJoined()
      handleClose()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setInviteCode('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Squad</DialogTitle>
          <DialogDescription>
            Enter the 6-digit invite code to join a squad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code *</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="text-center text-2xl font-bold tracking-wider"
                required
              />
              <p className="text-xs text-gray-500 text-center">
                6-digit alphanumeric code
              </p>
            </div>

            <Alert>
              <AlertDescription>
                Ask your friend for the invite code. You can find it in their squad details.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || inviteCode.length !== 6}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Joining...' : 'Join Squad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
