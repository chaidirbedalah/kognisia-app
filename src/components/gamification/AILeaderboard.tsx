'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import { 
  GlobalLeaderboard,
  SubjectLeaderboard,
  ImprovementLeaderboard,
  LeaderboardEntry,
  ImprovementEntry,
  TournamentMode
} from '@/lib/gamification/types'
import { gamificationService } from '@/lib/gamification/service'
import { 
  Trophy, 
  Crown, 
  Medal, 
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  Star,
  Zap,
  Search,
  Filter
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

interface AILeaderboardProps {
  userId: string
  viewMode?: 'personal' | 'global' | 'subject' | 'improvement'
  schoolId?: string
  classId?: string
}

export function AILeaderboard({ 
  userId, 
  viewMode = 'personal',
  schoolId,
  classId
}: AILeaderboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<'all_time' | 'yearly' | 'monthly' | 'weekly'>('all_time')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  
  // Leaderboard data
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboard | null>(null)
  const [subjectLeaderboards, setSubjectLeaderboards] = useState<SubjectLeaderboard[]>([])
  const [improvementLeaderboard, setImprovementLeaderboard] = useState<ImprovementLeaderboard | null>(null)
  const [activeTournaments, setActiveTournaments] = useState<TournamentMode[]>([])
  
  // User rankings
  const [userRankings, setUserRankings] = useState<any>(null)

  useEffect(() => {
    loadLeaderboardData()
    loadUserRankings()
    loadActiveTournaments()
    subscribeToUpdates()
  }, [selectedPeriod, selectedSubject])

  const loadLeaderboardData = async () => {
    try {
      setLoading(true)
      
      // Load data in parallel
      const [global, subjects, improvement] = await Promise.all([
        gamificationService.getGlobalLeaderboard(selectedPeriod),
        gamificationService.getSubjectLeaderboard('math', selectedPeriod), // Default to math
        gamificationService.getImprovementLeaderboard('accuracy_improvement', selectedPeriod === 'all_time' ? undefined : selectedPeriod === 'yearly' ? 'quarterly' : 'monthly')
      ])
      
      setGlobalLeaderboard(global)
      setSubjectLeaderboards([subjects]) // Would normally load all subjects
      setImprovementLeaderboard(improvement)
    } catch (error) {
      console.error('Failed to load leaderboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserRankings = async () => {
    try {
      const rankings = await gamificationService.getUserRankings(userId)
      setUserRankings(rankings)
    } catch (error) {
      console.error('Failed to load user rankings:', error)
    }
  }

  const loadActiveTournaments = async () => {
    try {
      const tournaments = await gamificationService.getActiveTournaments()
      setActiveTournaments(tournaments)
    } catch (error) {
      console.error('Failed to load tournaments:', error)
    }
  }

  const subscribeToUpdates = () => {
    const unsubscribe = gamificationService.subscribeToLeaderboardUpdates(
      'global',
      (leaderboard) => {
        setGlobalLeaderboard(leaderboard)
      }
    )

    return unsubscribe
  }

  const filteredLeaderboard = useMemo(() => {
    if (!globalLeaderboard?.participants) return []
    
    return globalLeaderboard.participants.filter(entry =>
      entry.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [globalLeaderboard, searchTerm])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    return <div className="h-4 w-4" />
  }

  const getRankChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const joinTournament = async (tournamentId: string) => {
    try {
      const result = await gamificationService.joinTournament(userId, tournamentId)
      if (result.success) {
        // Show success message
        console.log('Successfully joined tournament')
      }
    } catch (error) {
      console.error('Failed to join tournament:', error)
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Leaderboard</h1>
          <p className="text-muted-foreground">
            Smart matchmaking and fair competition
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">All Time</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Rankings Summary */}
      {userRankings && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{userRankings.global.rank}</div>
              <p className="text-xs text-muted-foreground">
                {userRankings.global.score.toLocaleString()} points
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Subject</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                #{userRankings.subjects[0]?.rank || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {userRankings.subjects[0]?.subject || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                #{userRankings.improvement[0]?.rank || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {userRankings.improvement[0]?.improvement || 0}% improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTournaments.length}</div>
              <p className="text-xs text-muted-foreground">
                Join to compete
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 3 Global */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Global champions this {selectedPeriod}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeaderboard.slice(0, 3).map((entry, index) => (
                    <div key={entry.userId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getRankIcon(entry.rank)}
                        <Avatar>
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{entry.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.score.toLocaleString()} points
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {entry.badge && (
                          <Badge variant="secondary">{entry.badge}</Badge>
                        )}
                        {entry.title && (
                          <Badge variant="outline">{entry.title}</Badge>
                        )}
                        <div className={`flex items-center ${getRankChangeColor(entry.change)}`}>
                          {getRankChangeIcon(entry.change)}
                          <span className="text-sm ml-1">
                            {entry.change > 0 ? '+' : ''}{entry.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Tournaments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-purple-500" />
                  Active Tournaments
                </CardTitle>
                <CardDescription>
                  Compete for exclusive rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeTournaments.slice(0, 3).map((tournament) => (
                    <div key={tournament.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{tournament.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {tournament.type} • {tournament.maxParticipants} max
                          </p>
                          {tournament.nextStart && (
                            <p className="text-xs text-muted-foreground">
                              Starts: {new Date(tournament.nextStart).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => joinTournament(tournament.id)}
                          disabled={!tournament.isActive}
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>
                Top performers worldwide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredLeaderboard.map((entry) => (
                  <div key={entry.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 text-center font-bold">
                        {getRankIcon(entry.rank)}
                      </div>
                      <Avatar>
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>{entry.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{entry.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.score.toLocaleString()} points
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.badge && (
                        <Badge variant="secondary">{entry.badge}</Badge>
                      )}
                      {entry.title && (
                        <Badge variant="outline">{entry.title}</Badge>
                      )}
                      <div className={`flex items-center ${getRankChangeColor(entry.change)}`}>
                        {getRankChangeIcon(entry.change)}
                        <span className="text-sm ml-1">
                          {entry.change > 0 ? '+' : ''}{entry.change}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subjectLeaderboards.map((leaderboard) => (
              <Card key={leaderboard.id}>
                <CardHeader>
                  <CardTitle className="capitalize">{leaderboard.subject}</CardTitle>
                  <CardDescription>
                    Top performers in {leaderboard.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboard.participants.slice(0, 5).map((entry) => (
                      <div key={entry.userId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm">#{entry.rank}</span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={entry.avatar} />
                            <AvatarFallback className="text-xs">
                              {entry.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{entry.username}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {entry.score.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTournaments.map((tournament) => (
              <Card key={tournament.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-purple-500" />
                    {tournament.name}
                  </CardTitle>
                  <CardDescription>
                    {tournament.type} tournament
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Participants:</span>
                      <span>{tournament.maxParticipants} max</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span>{tournament.duration} minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant={tournament.isActive ? 'default' : 'secondary'}>
                        {tournament.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {tournament.nextStart && (
                      <div className="text-sm text-muted-foreground">
                        Starts: {new Date(tournament.nextStart).toLocaleString()}
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      onClick={() => joinTournament(tournament.id)}
                      disabled={!tournament.isActive}
                    >
                      Join Tournament
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}