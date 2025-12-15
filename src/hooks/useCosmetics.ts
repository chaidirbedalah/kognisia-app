import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Cosmetic {
  id: string
  code: string
  name: string
  description: string
  type: string
  icon_emoji: string
  rarity: string
  unlocked: boolean
}

export interface CosmeticsData {
  cosmetics: Cosmetic[]
  grouped: Record<string, Cosmetic[]>
  unlocked_count: number
  total_count: number
}

export function useCosmetics() {
  const [data, setData] = useState<CosmeticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCosmetics()
  }, [])

  const fetchCosmetics = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/cosmetics/available', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch cosmetics')
      }

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cosmetics')
      console.error('Error fetching cosmetics:', err)
    } finally {
      setLoading(false)
    }
  }

  const equipCosmetic = async (cosmeticId: string, type: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/cosmetics/equip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cosmetic_id: cosmeticId, type })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to equip cosmetic')
      }

      // Refresh cosmetics
      await fetchCosmetics()
      return true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to equip cosmetic')
      console.error('Error equipping cosmetic:', err)
      return false
    }
  }

  return {
    data,
    loading,
    error,
    equipCosmetic,
    refetch: fetchCosmetics
  }
}
