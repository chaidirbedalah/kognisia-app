'use client'

import { useRouter } from 'next/navigation'
import { useCosmetics } from '@/hooks/useCosmetics'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Lock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function CosmeticsPage() {
  const router = useRouter()
  const { data, loading, equipCosmetic } = useCosmetics()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-64 rounded" />
            </div>
            <Skeleton className="h-4 w-96 rounded" />
          </div>
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-40 rounded mb-2" />
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-32 rounded mb-2" />
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mb-8">
            <Skeleton className="h-6 w-40 rounded mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden">
                  <Skeleton className="h-40 rounded" />
                </div>
              ))}
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-5 w-56 rounded mb-2" />
              <Skeleton className="h-4 w-full rounded" />
            </CardContent>
          </Card>
          <div className="mt-8 text-center">
            <Skeleton className="h-9 w-40 rounded mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-500'
      case 'uncommon':
        return 'from-green-400 to-green-500'
      case 'rare':
        return 'from-blue-400 to-blue-500'
      case 'epic':
        return 'from-purple-400 to-purple-500'
      case 'legendary':
        return 'from-yellow-400 to-yellow-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  const typeLabels: Record<string, string> = {
    badge: '🎖️ Badges',
    theme: '🎨 Themes',
    avatar_frame: '🖼️ Avatar Frames',
    title: '👑 Titles'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Cosmetics Shop</h1>
          </div>
          <p className="text-gray-600">
            Unlock and equip cosmetics to customize your profile
          </p>
        </div>

        {/* Stats */}
        {data && (
          <Card className="mb-8 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cosmetics Unlocked</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {data.unlocked_count}/{data.total_count}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Completion</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.round((data.unlocked_count / data.total_count) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cosmetics by Type */}
        {data?.grouped && Object.entries(data.grouped).map(([type, cosmetics]) => (
          <div key={type} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {typeLabels[type] || type}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(Array.isArray(cosmetics) ? cosmetics : []).map((cosmetic: {
                id: string
                unlocked: boolean
                icon_emoji: string
                name: string
                description: string
                rarity: string
              }) => (
                <div
                  key={cosmetic.id}
                  className={`relative rounded-lg overflow-hidden transition-all ${
                    cosmetic.unlocked
                      ? 'hover:scale-105 shadow-lg cursor-pointer'
                      : 'opacity-60'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(
                      cosmetic.rarity
                    )}`}
                  />

                  <div className="relative p-4 text-white text-center">
                    <div className="text-5xl mb-2">{cosmetic.icon_emoji}</div>
                    <h3 className="font-bold text-sm mb-1">{cosmetic.name}</h3>
                    <p className="text-xs opacity-90 mb-3 line-clamp-2">
                      {cosmetic.description}
                    </p>

                    <div className="space-y-2">
                      <Badge className="text-xs">
                        {cosmetic.rarity.charAt(0).toUpperCase() + cosmetic.rarity.slice(1)}
                      </Badge>

                      {cosmetic.unlocked ? (
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => equipCosmetic(cosmetic.id, type)}
                        >
                          Equip
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <Lock className="h-3 w-3" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">How to Unlock Cosmetics</p>
                <p className="text-sm text-gray-700">
                  Cosmetics are unlocked by completing achievements. Each achievement may unlock special cosmetics that you can equip to customize your profile!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/profile')}
          >
            ← Back to Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
