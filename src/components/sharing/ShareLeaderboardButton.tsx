'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface ShareLeaderboardButtonProps {
  rank: number
  totalPoints: number
  userName?: string
}

export function ShareLeaderboardButton({
  rank,
  totalPoints,
  userName = 'I'
}: ShareLeaderboardButtonProps) {
  const [copied, setCopied] = useState(false)

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return '🏆'
  }

  const shareText = `${getRankEmoji(rank)} ${userName}'m ranked #${rank} on the Kognisia Global Leaderboard! 
${totalPoints} achievement points earned! 
Can you beat my score? 🎯 Join Kognisia now!`

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/leaderboard`

  const handleWhatsApp = () => {
    const text = encodeURIComponent(shareText)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleTwitter = () => {
    const text = encodeURIComponent(shareText)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const handleFacebook = () => {
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsApp}
        title="Share on WhatsApp"
      >
        💬
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleTwitter}
        title="Share on Twitter/X"
      >
        𝕏
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleFacebook}
        title="Share on Facebook"
      >
        f
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyToClipboard}
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

