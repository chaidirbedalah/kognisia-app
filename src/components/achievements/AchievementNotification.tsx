'use client'

import { useEffect, useState } from 'react'
import { X, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  achievement_id: string
  read: boolean
  created_at: string
  achievements: {
    id: string
    code: string
    name: string
    description: string
    icon_emoji: string
    points: number
    rarity: string
  }
}

export function AchievementNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([])

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/achievements/notifications', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) return

      const data = await response.json()
      setNotifications(data.notifications || [])

      // Show new notifications
      const newNotifications = data.notifications.filter(
        (n: Notification) => !displayedNotifications.find(d => d.id === n.id)
      )

      if (newNotifications.length > 0) {
        setDisplayedNotifications(prev => [...prev, ...newNotifications])
        
        // Auto-remove after 5 seconds
        newNotifications.forEach((notification: Notification) => {
          setTimeout(() => {
            removeNotification(notification.id)
          }, 5000)
        })
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const removeNotification = async (notificationId: string) => {
    setDisplayedNotifications(prev => prev.filter(n => n.id !== notificationId))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await fetch('/api/achievements/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_id: notificationId })
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {displayedNotifications.map(notification => (
        <div
          key={notification.id}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-4 animate-slide-in"
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{notification.achievements.icon_emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4" />
                <h3 className="font-bold">{notification.achievements.name}</h3>
              </div>
              <p className="text-sm opacity-90 mb-1">
                {notification.achievements.description}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded">
                  {notification.achievements.rarity}
                </span>
                <span className="font-bold">+{notification.achievements.points} pts</span>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-white/60 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
