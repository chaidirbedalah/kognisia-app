'use client'

import { useState } from 'react'
import { AchievementsGrid } from '@/components/achievements/AchievementsGrid'
import { Trophy, Zap, Target, Star, Flame } from 'lucide-react'

const categories = [
  { id: 'all', name: 'All Achievements', icon: Trophy },
  { id: 'battle', name: 'Battle', icon: Zap },
  { id: 'performance', name: 'Performance', icon: Target },
  { id: 'milestone', name: 'Milestone', icon: Star },
  { id: 'special', name: 'Special', icon: Flame }
]

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Trophy className="h-10 w-10 text-yellow-500" />
              Achievements
            </h1>
            <p className="text-gray-600">
              Unlock achievements by completing challenges and reaching milestones
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* Achievements Grid */}
        <AchievementsGrid
          category={selectedCategory === 'all' ? undefined : selectedCategory}
          showStats={selectedCategory === 'all'}
        />

        {/* Tips Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Tips to Unlock Achievements</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>First Battle:</strong> Complete your first squad battle to unlock First Battle</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Perfect Score:</strong> Get 100% accuracy in any battle</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Speed Demon:</strong> Complete a battle in under 5 minutes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>HOTS Master:</strong> Win 5 ELITE battles with HOTS questions</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Comeback King:</strong> Rank 1st after being in last place</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
