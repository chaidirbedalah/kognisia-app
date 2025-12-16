'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  IntegratedUserProfile,
  UnifiedDashboardData,
  LearningGamificationCorrelation
} from '@/lib/integration/types'
import { integrationService } from '@/lib/integration/service'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Trophy, 
  Star,
  Brain,
  Zap,
  Users,
  Calendar,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Lightbulb,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UnifiedDashboardProps {
  userId: string
  schoolId?: string
  viewMode?: 'student' | 'teacher' | 'admin'
}

export function UnifiedDashboard({ 
  userId, 
  schoolId,
  viewMode = 'student'
}: UnifiedDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<UnifiedDashboardData | null>(null)
  const [correlationData, setCorrelationData] = useState<LearningGamificationCorrelation | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '365d'>('30d')

  useEffect(() => {
    loadUnifiedData()
    loadCorrelationData()
    subscribeToUpdates()
  }, [userId, selectedTimeframe])

  const loadUnifiedData = async () => {
    try {
      setLoading(true)
      const data = await integrationService.getUnifiedDashboardData(userId, schoolId)
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to load unified dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCorrelationData = async () => {
    try {
      const correlation = await integrationService.getLearningGamificationCorrelation(userId, selectedTimeframe)
      setCorrelationData(correlation)
    } catch (error) {
      console.error('Failed to load correlation data:', error)
    }
  }

  const subscribeToUpdates = () => {
    const unsubscribe = integrationService.subscribeToIntegratedUpdates(
      userId,
      (update) => {
        // Handle real-time updates
        console.log('Integrated update:', update)
        
        // Refresh relevant data based on update type
        switch (update.type) {
          case 'achievement':
          case 'leaderboard':
          case 'analytics':
            loadUnifiedData()
            break
          case 'correlation':
            loadCorrelationData()
            break
        }
      }
    )

    return unsubscribe
  }

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.7) return 'text-green-600'
    if (correlation > 0.3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCorrelationIcon = (correlation: number) => {
    if (correlation > 0.7) return <TrendingUp className="h-4 w-4" />
    if (correlation > 0.3) return <Activity className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">Unified Dashboard</h1>
          <p className="text-muted-foreground">
            Analytics & Gamification Integration
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="365d">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadUnifiedData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="correlations">Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Learning Performance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Velocity</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.user.analytics.learningVelocity.current}
                  </div>
                  <div className="flex items-center text-sm">
                    {dashboardData.user.analytics.learningVelocity.trend === 'improving' && (
                      <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                    )}
                    {dashboardData.user.analytics.learningVelocity.trend === 'declining' && (
                      <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className="text-muted-foreground">
                      {dashboardData.user.analytics.learningVelocity.trend}
                    </span>
                  </div>
                  <Progress 
                    value={dashboardData.user.insights.learningVelocity.achievementImpact * 100} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              {/* Achievement Progress */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievement Points</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.user.achievements.totalPoints.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tier {dashboardData.user.achievements.currentTier}
                  </p>
                  <Progress 
                    value={dashboardData.user.achievements.tierProgress.progressPercentage} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              {/* Leaderboard Rank */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    #{dashboardData.user.leaderboard.global.userRank || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.user.leaderboard.global.userScore?.toLocaleString() || '0'} points
                  </p>
                  <div className="flex items-center text-sm mt-2">
                    <span className="text-muted-foreground">
                      Check leaderboard for position changes
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Score */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(dashboardData.user.insights.engagementDrivers.gamification * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gamification driven
                  </p>
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-xs">
                      <span>Social</span>
                      <span>{Math.round(dashboardData.user.insights.engagementDrivers.social * 100)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Content</span>
                      <span>{Math.round(dashboardData.user.insights.engagementDrivers.content * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Real-time Activity */}
          {dashboardData?.realTime && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Real-time Activity
                </CardTitle>
                <CardDescription>
                  Live system activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardData.realTime.activeUsers}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardData.realTime.currentAchievements}
                    </div>
                    <div className="text-sm text-muted-foreground">Achievements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {dashboardData.realTime.ongoingTournaments}
                    </div>
                    <div className="text-sm text-muted-foreground">Tournaments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {dashboardData.realTime.activeChallenges}
                    </div>
                    <div className="text-sm text-muted-foreground">Challenges</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          {correlationData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievement vs Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Achievement vs Performance
                  </CardTitle>
                  <CardDescription>
                    How achievements impact learning outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Correlation</span>
                      <div className="flex items-center">
                        <span className={`font-bold mr-2 ${getCorrelationColor(correlationData.correlations.achievementVsPerformance.correlation)}`}>
                          {correlationData.correlations.achievementVsPerformance.correlation.toFixed(2)}
                        </span>
                        {getCorrelationIcon(correlationData.correlations.achievementVsPerformance.correlation)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Significance: {correlationData.correlations.achievementVsPerformance.significance}</p>
                      <div className="mt-2">
                        <h4 className="font-medium">Key Insights:</h4>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {correlationData.correlations.achievementVsPerformance.insights.map((insight, index) => (
                            <li key={index} className="text-sm">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leaderboard vs Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5" />
                    Leaderboard vs Engagement
                  </CardTitle>
                  <CardDescription>
                    Competition impact on user engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Correlation</span>
                      <div className="flex items-center">
                        <span className={`font-bold mr-2 ${getCorrelationColor(correlationData.correlations.leaderboardVsEngagement.correlation)}`}>
                          {correlationData.correlations.leaderboardVsEngagement.correlation.toFixed(2)}
                        </span>
                        {getCorrelationIcon(correlationData.correlations.leaderboardVsEngagement.correlation)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Significance: {correlationData.correlations.leaderboardVsEngagement.significance}</p>
                      <div className="mt-2">
                        <h4 className="font-medium">Key Insights:</h4>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {correlationData.correlations.leaderboardVsEngagement.insights.map((insight, index) => (
                            <li key={index} className="text-sm">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {dashboardData?.predictions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Next Achievement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Next Achievement
                  </CardTitle>
                  <CardDescription>
                    AI-powered achievement prediction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{dashboardData.predictions.nextAchievement}</h4>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">
                          {Math.round(dashboardData.predictions.learningMilestone.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Estimated time: {Math.round(dashboardData.predictions.learningMilestone.estimatedTime / (24 * 60 * 60 * 1000))} days</p>
                      <div className="mt-2">
                        <h5 className="font-medium">Required Actions:</h5>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {dashboardData.predictions.learningMilestone.requiredActions.map((action: string, index: number) => (
                            <li key={index} className="text-sm">{action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tournament Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Tournament Prediction
                  </CardTitle>
                  <CardDescription>
                    Expected tournament performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        #{dashboardData.predictions.leaderboardPosition}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Predicted rank
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Based on current performance trends</p>
                      <div className="mt-2">
                        <h5 className="font-medium">Improvement Areas:</h5>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li className="text-sm">Focus on weak subjects</li>
                          <li className="text-sm">Maintain consistency</li>
                          <li className="text-sm">Participate in more tournaments</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {dashboardData?.user.insights.recommendations && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Learning Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    Learning
                  </CardTitle>
                  <CardDescription>
                    Personalized learning suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.user.insights.recommendations.learning.map((recommendation, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gamification Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Gamification
                  </CardTitle>
                  <CardDescription>
                    Achievement and engagement tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.user.insights.recommendations.gamification.map((recommendation, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Social
                  </CardTitle>
                  <CardDescription>
                    Collaboration and community tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.user.insights.recommendations.social.map((recommendation, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Activity className="h-4 w-4 text-green-500 mt-0.5" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}