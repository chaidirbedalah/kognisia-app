'use client'

import { Lock } from 'lucide-react'

interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon_emoji: string
  category: string
  points: number
  rarity: string
  unlocked: boolean
  unlockedAt?: string
}

interface AchievementCardProps {
  achievement: Achievement
  onClick?: () => void
}

export function AchievementCard({ achievement, onClick }: AchievementCardProps) {
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

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Common'
      case 'uncommon':
        return 'Uncommon'
      case 'rare':
        return 'Rare'
      case 'epic':
        return 'Epic'
      case 'legendary':
        return 'Legendary'
      default:
        return rarity
    }
  }

  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
        achievement.unlocked
          ? 'hover:scale-105 shadow-lg'
          : 'opacity-60 hover:opacity-80'
      }`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(
          achievement.rarity
        )}`}
      />

      {/* Content */}
      <div className="relative p-4 text-white">
        {/* Icon */}
        <div className="text-5xl mb-3 text-center">
          {achievement.unlocked ? achievement.icon_emoji : '🔒'}
        </div>

        {/* Name */}
        <h3 className="font-bold text-center mb-1 text-sm">{achievement.name}</h3>

        {/* Description */}
        <p className="text-xs text-center opacity-90 mb-3 line-clamp-2">
          {achievement.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="bg-white/20 px-2 py-1 rounded">
            {getRarityLabel(achievement.rarity)}
          </span>
          <span className="font-bold">{achievement.points}pts</span>
        </div>

        {/* Unlocked date */}
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="mt-2 text-xs text-center opacity-75">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString('id-ID')}
          </div>
        )}

        {/* Lock icon for locked achievements */}
        {!achievement.unlocked && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-white/80" />
          </div>
        )}
      </div>
    </div>
  )
}
