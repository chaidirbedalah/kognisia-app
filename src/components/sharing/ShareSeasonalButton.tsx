'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ShareSeasonalButtonProps {
  seasonName: string
  seasonIcon: string
  achievementCount: number
  totalPoints: number
  userName?: string
}

export function ShareSeasonalButton({
  seasonName,
  seasonIcon,
  achievementCount,
  totalPoints,
  userName = 'I'
}: ShareSeasonalButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `${seasonIcon} ${userName}'m crushing the ${seasonName} challenge on Kognisia! 
${achievementCount} seasonal achievements unlocked! 
${totalPoints} points earned! 🎯
Join the seasonal challenge now! 🚀`

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/seasonal`

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleWhatsApp}>
          <span className="mr-2">💬</span>
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitter}>
          <span className="mr-2">𝕏</span>
          Twitter/X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebook}>
          <span className="mr-2">f</span>
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyToClipboard}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Text
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

