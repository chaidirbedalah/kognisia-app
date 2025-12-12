import { useCallback } from 'react'

export interface ShareData {
  title: string
  text: string
  url?: string
}

export function useShareAchievement() {
  const shareToWhatsApp = useCallback((text: string) => {
    const encodedText = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encodedText}`, '_blank')
  }, [])

  const shareToTwitter = useCallback((text: string) => {
    const encodedText = encodeURIComponent(text)
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank')
  }, [])

  const shareToFacebook = useCallback((url: string) => {
    const encodedUrl = encodeURIComponent(url)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
  }, [])

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      return false
    }
  }, [])

  const shareNative = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }, [])

  return {
    shareToWhatsApp,
    shareToTwitter,
    shareToFacebook,
    copyToClipboard,
    shareNative,
    canShare: typeof navigator !== 'undefined' && !!navigator.share
  }
}

