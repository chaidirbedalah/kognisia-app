'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StreakStats, StreakCalendar } from '@/lib/streak-types'
import { getStreakStatus, getStreakMessage } from '@/lib/streak-types'
import { Flame, Calendar, Trophy, TrendingUp } from 'lucide-react'

export function StreakCard() {
  const [stats, setStats] = useState<StreakStats | null>(null)
  const [calendar, setCalendar] = useState<StreakCalendar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreakData()
  }, [])

  async function loadStreakData() {
    try {
      const response = await fetch('/api/streak/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setCalendar(data.calendar)
      }
    } catch (error) {
      console.error('Error loading streak data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card data-testid="streak-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card data-testid="streak-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Streak Harian
          </CardTitle>
          <CardDescription>Belum ada aktivitas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Mulai streak dengan menyelesaikan Daily Challenge, Squad Battle, atau Try Out!
          </p>
        </CardContent>
      </Card>
    )
  }

  const status = getStreakStatus(stats)
  const message = getStreakMessage(stats)

  return (
    <Card data-testid="streak-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Streak Harian
          </CardTitle>
          <Badge 
            variant={status === 'active' ? 'default' : status === 'at_risk' ? 'secondary' : 'outline'}
            className={
              status === 'active' ? 'bg-orange-500' : 
              status === 'at_risk' ? 'bg-yellow-500' : 
              'bg-gray-300'
            }
          >
            {status === 'active' ? '🔥 Active' : status === 'at_risk' ? '⚠️ At Risk' : '💔 Broken'}
          </Badge>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-orange-600">{stats.current_streak}</p>
            <p className="text-xs text-gray-600">Current</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Trophy className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-600">{stats.longest_streak}</p>
            <p className="text-xs text-gray-600">Longest</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{stats.total_active_days}</p>
            <p className="text-xs text-gray-600">Total Days</p>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-600" />
            <p className="text-sm font-medium text-gray-700">Last 30 Days</p>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {calendar.map((day, index) => {
              const date = new Date(day.date)
              const isToday = day.date === new Date().toISOString().split('T')[0]
              
              return (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-sm transition-all
                    ${day.hasActivity 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                    }
                    ${isToday ? 'ring-2 ring-orange-600 ring-offset-1' : ''}
                  `}
                  title={`${date.toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}${day.hasActivity ? ` - ${day.activities.length} aktivitas` : ''}`}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>30 hari lalu</span>
            <span>Hari ini</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <span>Tidak aktif</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
            <span>Aktif</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
