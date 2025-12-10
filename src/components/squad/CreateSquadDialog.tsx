'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface CreateSquadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSquadCreated: () => void
}

export function CreateSquadDialog({
  open,
  onOpenChange,
  onSquadCreated
}: CreateSquadDialogProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [maxMembers, setMaxMembers] = useState(8)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [squadId, setSquadId] = useState('')
  const [copied, setCopied] = useState(false)

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

      const response = await fetch('/api/squad/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ name, max_members: maxMembers })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create squad')
      }

      console.log('Squad created:', data)
      
      // Set invite code and squad ID
      if (data.invite_code && data.squad?.id) {
        setInviteCode(data.invite_code)
        setSquadId(data.squad.id)
        
        // Don't call onSquadCreated() here - it causes re-render
        // Will call it when user clicks "Go to Squad"
      } else {
        throw new Error('Invalid response: missing invite_code or squad.id')
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setMaxMembers(8)
    setError('')
    setInviteCode('')
    setCopied(false)
    onOpenChange(false)
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (inviteCode) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Squad Created! 🎉</DialogTitle>
            <DialogDescription>
              Share this invite code with your friends
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Invite Code</p>
              <p className="text-4xl font-bold text-purple-600 tracking-wider mb-4">
                {inviteCode}
              </p>
              <Button
                onClick={copyInviteCode}
                variant="outline"
                className="w-full"
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

            <Alert>
              <AlertDescription>
                Squad "{name}" has been created successfully. Share the invite code with your friends to let them join!
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button 
              onClick={() => {
                console.log('Navigating to squad:', squadId)
                if (!squadId) {
                  alert('Squad ID is missing!')
                  return
                }
                
                // Save squadId before closing (handleClose resets state)
                const targetSquadId = squadId
                
                // Navigate first, then cleanup
                router.push(`/squad/${targetSquadId}`)
                
                // Cleanup after navigation
                setTimeout(() => {
                  onSquadCreated() // Reload squad list
                  handleClose()
                }, 100)
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Go to Squad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Squad</DialogTitle>
          <DialogDescription>
            Create a squad and invite your friends to compete together
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
              <Label htmlFor="name">Squad Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Squad Juara"
                minLength={3}
                maxLength={30}
                required
              />
              <p className="text-xs text-gray-500">
                3-30 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <Input
                id="maxMembers"
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                min={2}
                max={8}
                required
              />
              <p className="text-xs text-gray-500">
                2-8 members
              </p>
            </div>
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
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Creating...' : 'Create Squad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
