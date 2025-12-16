'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  SchoolMetrics, 
  AnalyticsTimeRange, 
  RealTimeMetrics,
  StudentRiskProfile 
} from '@/lib/analytics/types'
import { analyticsService } from '@/lib/analytics/service'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  Activity,
  Target,
  BookOpen,
  Award
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsDashboardProps {
  schoolId?: string
  classId?: string
  studentId?: string
  viewMode?: 'admin' | 'teacher' | 'student'
}

export function AnalyticsDashboard({ 
  schoolId, 
  classId, 
  studentId, 
  viewMode = 'admin' 
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange['type']>('30d')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null)
  const [riskProfiles, setRiskProfiles] = useState<StudentRiskProfile[]>([])

  useEffect(() => {
    loadAnalyticsData()
    loadRealTimeMetrics()
    if (viewMode === 'admin') {
      loadRiskProfiles()
    }
  }, [timeRange, schoolId, classId, studentId])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const timeRangeObj = analyticsService.createDefaultTimeRange(timeRange)
      
      let response
      if (viewMode === 'admin') {
        response = await analyticsService.getSchoolAnalytics(timeRangeObj)
      } else if (viewMode === 'teacher') {
        response = await analyticsService.getClassPerformanceAnalytics(classId, timeRangeObj)
      } else {
        response = await analyticsService.getStudentAnalytics(studentId!, timeRangeObj)
      }
      
      if (response.success) {
        setData(response.data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealTimeMetrics = async () => {
    try {
      const response = await analyticsService.getRealTimeMetrics()
      if (response.success) {
        setRealTimeMetrics(response.data)
      }

      // Subscribe to real-time updates
      analyticsService.subscribeToRealTimeUpdates((metrics) => {
        setRealTimeMetrics(metrics)
      })
    } catch (error) {
      console.error('Failed to load real-time metrics:', error)
    }
  }

  const loadRiskProfiles = async () => {
    try {
      // This would be part of the admin analytics data
      // For now, using mock data
      const mockRiskProfiles: StudentRiskProfile[] = [
        {
          studentId: '1',
          studentName: 'John Doe',
          riskLevel: 'high',
          riskFactors: {
            decliningPerformance: true,
            lowEngagement: false,
            missedDeadlines: true,
            socialIsolation: false
          },
          recommendations: [
            'Schedule one-on-one tutoring session',
            'Adjust difficulty level',
            'Set up study reminders'
          ],
          interventionPriority: 1
        }
      ]
      setRiskProfiles(mockRiskProfiles)
    } catch (error) {
      console.error('Failed to load risk profiles:', error)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
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
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {viewMode === 'admin' ? 'School Analytics' : 
           viewMode === 'teacher' ? 'Class Performance' : 'Student Progress'}
        </h1>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
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
          
          <Button variant="outline" onClick={loadAnalyticsData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Real-time Metrics
            </CardTitle>
            <CardDescription>
              Live data as of {new Date(realTimeMetrics.timestamp).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeMetrics.activeUsers}
                </div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeMetrics.currentSessions}
                </div>
                <div className="text-sm text-muted-foreground">Current Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(realTimeMetrics.averageSessionLength)}m
                </div>
                <div className="text-sm text-muted-foreground">Avg Session</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {realTimeMetrics.performanceDistribution.excellent}%
                </div>
                <div className="text-sm text-muted-foreground">Excellent Performance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {data?.schoolMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Students"
                value={data.schoolMetrics.totalStudents}
                icon={<Users className="h-5 w-5" />}
                trend={5.2}
              />
              <MetricCard
                title="Average Progress"
                value={`${Math.round(data.schoolMetrics.averageProgress)}%`}
                icon={<Target className="h-5 w-5" />}
                trend={2.8}
              />
              <MetricCard
                title="Engagement Rate"
                value={`${Math.round(data.schoolMetrics.engagementRate)}%`}
                icon={<Activity className="h-5 w-5" />}
                trend={-1.2}
              />
              <MetricCard
                title="Retention Rate"
                value={`${Math.round(data.schoolMetrics.retentionRate)}%`}
                icon={<Award className="h-5 w-5" />}
                trend={3.4}
              />
            </div>
          )}

          {/* Risk Profiles for Admin */}
          {viewMode === 'admin' && riskProfiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  At-Risk Students
                </CardTitle>
                <CardDescription>
                  Students requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskProfiles.slice(0, 5).map((profile) => (
                    <div key={profile.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(profile.riskLevel)}`} />
                        <div>
                          <div className="font-medium">{profile.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            Priority: {profile.interventionPriority}
                          </div>
                        </div>
                      </div>
                      <Badge variant={profile.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                        {profile.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>
                  Learning performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data?.trends?.performanceTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="performance" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>
                  Average accuracy by subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.subjectPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageAccuracy" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trend</CardTitle>
                <CardDescription>
                  User engagement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data?.trends?.engagementTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#ffc658" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
                <CardDescription>
                  Performance levels distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Excellent', value: realTimeMetrics?.performanceDistribution.excellent || 0, fill: '#10b981' },
                        { name: 'Good', value: realTimeMetrics?.performanceDistribution.good || 0, fill: '#3b82f6' },
                        { name: 'Average', value: realTimeMetrics?.performanceDistribution.average || 0, fill: '#f59e0b' },
                        { name: 'Poor', value: realTimeMetrics?.performanceDistribution.poor || 0, fill: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {data?.subjectPerformance?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Analytics</CardTitle>
              <CardDescription>
                AI-powered insights and predictions
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  description?: string
}

function MetricCard({ title, value, icon, trend, description }: MetricCardProps) {
  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trendValue < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            {icon}
            {trend !== undefined && (
              <div className="flex items-center text-sm">
                {getTrendIcon(trend)}
                <span className={`ml-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}