'use client'

import { useRealtimeAchievements } from '@/hooks/useRealtimeAchievements'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff } from 'lucide-react'

export function RealtimeNotificationBadge() {
  const { isConnected, achievements } = useRealtimeAchievements()

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-600">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-600">Offline</span>
          </>
        )}
      </div>

      {/* New Achievements Badge */}
      {achievements.length > 0 && (
        <Badge className="bg-purple-600 hover:bg-purple-700">
          {achievements.length} new
        </Badge>
      )}
    </div>
  )
}

