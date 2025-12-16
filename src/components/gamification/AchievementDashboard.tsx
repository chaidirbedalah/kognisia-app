'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  UserAchievements, 
  AchievementBase, 
  AchievementProgress,
  Badge,
  Title,
  CosmeticItem,
  AchievementNotification
} from '@/lib/gamification/types'
import { gamificationService } from '@/lib/gamification/service'
import { 
  Trophy, 
  Star, 
  Crown, 
  Gem, 
  Lock, 
  Unlock,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Gift,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface AchievementDashboardProps {
  userId: string
  viewMode?: 'personal' | 'compare' | 'explore'
}

export function AchievementDashboard({ 
  userId, 
  viewMode = 'personal' 
}: AchievementDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null)
  const [availableAchievements, setAvailableAchievements] = useState<AchievementBase[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [notifications, setNotifications] = useState<AchievementNotification[]>([])

  useEffect(() => {
    loadUserAchievements()
    loadAvailableAchievements()
    subscribeToUpdates()
  }, [userId, selectedCategory, selectedTier])

  const loadUserAchievements = async () => {
    try {
      setLoading(true)
      const achievements = await gamificationService.getUserAchievements(userId)
      setUserAchievements(achievements)
    } catch (error) {
      console.error('Failed to load user achievements:', error)
      toast.error('Failed to load achievements')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableAchievements = async () => {
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory
      const tier = selectedTier === 'all' ? undefined : selectedTier
      
      const achievements = await gamificationService.getAvailableAchievements(category, tier)
      setAvailableAchievements(achievements)
    } catch (error) {
      console.error('Failed to load available achievements:', error)
    }
  }

  const subscribeToUpdates = () => {
    const unsubscribe = gamificationService.subscribeToAchievementUpdates(
      userId,
      (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 5))
        
        if (notification.type === 'achievement_unlocked') {
          toast.success(`🎉 Achievement Unlocked: ${notification.achievement.name}`)
          loadUserAchievements() // Refresh data
        } else if (notification.type === 'tier_upgraded') {
          toast.success(`🎊 Tier Upgraded! You're now ${notification.achievement.tier}!`)
        }
      }
    )

    return unsubscribe
  }

  const getAchievementIcon = (achievement: AchievementBase) => {
    if (achievement.isHidden) return <Lock className="h-8 w-8 text-gray-400" />
    return <Unlock className="h-8 w-8 text-yellow-500" />
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-500'
      case 'silver': return 'bg-gray-400'
      case 'gold': return 'bg-yellow-500'
      case 'platinum': return 'bg-purple-500'
      case 'diamond': return 'bg-blue-500'
      default: return 'bg-gray-300'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400'
      case 'uncommon': return 'border-green-400'
      case 'rare': return 'border-blue-400'
      case 'epic': return 'border-purple-400'
      case 'legendary': return 'border-orange-400'
      default: return 'border-gray-400'
    }
  }

  const getProgressPercentage = (achievement: AchievementBase): number => {
    if (!userAchievements) return 0
    
    const inProgress = userAchievements.inProgressAchievements.find(
      p => p.achievementId === achievement.id
    )
    
    if (!inProgress) return 0
    return (inProgress.currentProgress / inProgress.requiredProgress) * 100
  }

  const isUnlocked = (achievementId: string): boolean => {
    return userAchievements?.unlockedAchievements.includes(achievementId) || false
  }

  const isInProgress = (achievementId: string): boolean => {
    return userAchievements?.inProgressAchievements.some(
      p => p.achievementId === achievementId
    ) || false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">
            {userAchievements?.statistics.totalUnlocked || 0} / {userAchievements?.statistics.totalAvailable || 0} Unlocked
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="streak">Streak</SelectItem>
              <SelectItem value="mastery">Mastery</SelectItem>
              <SelectItem value="exploration">Exploration</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <Card key={index} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {notification.type === 'achievement_unlocked' && <Trophy className="h-6 w-6 text-yellow-500" />}
                    {notification.type === 'tier_upgraded' && <Crown className="h-6 w-6 text-purple-500" />}
                    {notification.type === 'milestone_reached' && <Star className="h-6 w-6 text-blue-500" />}
                  </div>
                  <div>
                    <p className="font-medium">{notification.achievement.name}</p>
                    <p className="text-sm text-muted-foreground">{notification.achievement.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {userAchievements && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Points */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <Gem className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userAchievements.totalPoints.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Tier {userAchievements.currentTier}
                  </p>
                </CardContent>
              </Card>

              {/* Completion Rate */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userAchievements.statistics.completionPercentage}%</div>
                  <Progress value={userAchievements.statistics.completionPercentage} className="mt-2" />
                </CardContent>
              </Card>

              {/* Rare Achievements */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rare Achievements</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userAchievements.statistics.rareAchievements}</div>
                  <p className="text-xs text-muted-foreground">
                    {userAchievements.statistics.secretAchievements} Secret
                  </p>
                </CardContent>
              </Card>

              {/* Next Tier Progress */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Tier</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userAchievements.tierProgress.pointsToNext}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Points to {['bronze', 'silver', 'gold', 'platinum', 'diamond'][userAchievements.tierProgress.nextTier]}
                  </p>
                  <Progress value={userAchievements.tierProgress.progressPercentage} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAchievements.map((achievement) => {
              const unlocked = isUnlocked(achievement.id)
              const inProgress = isInProgress(achievement.id)
              const progress = getProgressPercentage(achievement)
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`transition-all duration-200 hover:shadow-lg ${
                    unlocked ? 'ring-2 ring-yellow-400' : 
                    inProgress ? 'ring-2 ring-blue-400' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getAchievementIcon(achievement)}
                        <div>
                          <CardTitle className="text-lg">{achievement.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <UIBadge 
                          variant={unlocked ? 'default' : 'secondary'}
                          className={getTierColor(achievement.tier)}
                        >
                          {achievement.tier}
                        </UIBadge>
                        <UIBadge 
                          variant="outline"
                          className={getRarityColor(achievement.rarity)}
                        >
                          {achievement.rarity}
                        </UIBadge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!unlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                        {inProgress && (
                          <p className="text-xs text-muted-foreground">
                            {achievement.points} points
                          </p>
                        )}
                      </div>
                    )}
                    {unlocked && (
                      <div className="flex items-center justify-center text-green-600">
                        <Award className="h-5 w-5 mr-2" />
                        <span className="font-medium">Unlocked</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Badges
                </CardTitle>
                <CardDescription>Your earned badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div 
                      key={i}
                      className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"
                    >
                      <Award className="h-8 w-8 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Titles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="mr-2 h-5 w-5" />
                  Titles
                </CardTitle>
                <CardDescription>Your earned titles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    <span className="font-medium">Master Learner</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Star className="h-6 w-6 text-blue-500" />
                    <span className="font-medium">Quick Thinker</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {userAchievements?.inProgressAchievements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  In Progress
                </CardTitle>
                <CardDescription>Achievements you're currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userAchievements.inProgressAchievements.map((progress) => (
                    <div key={progress.achievementId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Achievement Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {progress.currentProgress} / {progress.requiredProgress}
                        </span>
                      </div>
                      <Progress 
                        value={(progress.currentProgress / progress.requiredProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}