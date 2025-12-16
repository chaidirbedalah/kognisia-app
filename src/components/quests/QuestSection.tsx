'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, CalendarCheck, CheckCircle2 } from 'lucide-react'
import { useQuests } from '@/hooks/useQuests'

export default function QuestSection() {
  const { weeklyQuests, seasonPass, loading, claimQuest, completeTask } = useQuests()

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Memuat...</CardTitle>
              <CardDescription>Quest sedang dimuat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-blue-600" />
            Quest Mingguan
          </CardTitle>
          <CardDescription>Lengkapi misi dan klaim reward points</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyQuests.length === 0 ? (
            <div className="text-sm text-gray-600">Belum ada quest minggu ini</div>
          ) : (
            <div className="space-y-4">
              {weeklyQuests.map((quest) => {
                const totalProgress = quest.tasks.reduce((sum, t) => sum + Math.min(t.progress, t.target), 0)
                const totalTarget = quest.tasks.reduce((sum, t) => sum + t.target, 0)
                const percent = totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0
                const allCompleted = quest.tasks.every(t => t.completed)
                return (
                  <div key={quest.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium">{quest.title}</div>
                        <div className="text-xs text-gray-600">{quest.description}</div>
                      </div>
                      <Badge variant="outline" className="text-green-700 border-green-700">
                        +{quest.total_reward_points} pts
                      </Badge>
                    </div>
                    <Progress value={percent} className="h-2" />
                    <div className="text-xs text-gray-600 mt-1">{percent}% selesai</div>
                    <div className="mt-3 space-y-2">
                      {quest.tasks.map((task) => {
                        const taskPercent = task.target > 0 ? Math.round((Math.min(task.progress, task.target) / task.target) * 100) : 0
                        return (
                          <div key={task.id} className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`h-4 w-4 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
                                <div className="text-sm">{task.title}</div>
                              </div>
                              <Progress value={taskPercent} className="h-1 mt-2" />
                              <div className="text-xs text-gray-600 mt-1">
                                {Math.min(task.progress, task.target)}/{task.target}
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={task.completed}
                              onClick={() => completeTask(task.id)}
                            >
                              {task.completed ? 'Selesai' : 'Progres +1'}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 text-right">
                      <Button 
                        variant={allCompleted && !quest.claimed ? 'default' : 'outline'} 
                        size="sm"
                        disabled={!allCompleted || quest.claimed}
                        onClick={() => claimQuest(quest.id)}
                      >
                        {quest.claimed ? 'Sudah Diklaim' : 'Klaim Reward'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Season Pass
          </CardTitle>
          <CardDescription>Progres season berjalan</CardDescription>
        </CardHeader>
        <CardContent>
          {!seasonPass ? (
            <div className="text-sm text-gray-600">Belum ada season aktif</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{seasonPass.title}</div>
                  <div className="text-xs text-gray-600">{seasonPass.description}</div>
                </div>
                <Badge variant="outline" className="text-indigo-700 border-indigo-700">
                  +{seasonPass.total_reward_points} pts
                </Badge>
              </div>
              <div className="space-y-2">
                {seasonPass.tasks.map((t) => {
                  const taskPercent = t.target > 0 ? Math.round((Math.min(t.progress, t.target) / t.target) * 100) : 0
                  return (
                    <div key={t.id}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">{t.title}</div>
                        <div className="text-xs text-gray-600">{Math.min(t.progress, t.target)}/{t.target}</div>
                      </div>
                      <Progress value={taskPercent} className="h-1 mt-1" />
                    </div>
                  )
                })}
              </div>
              <div className="text-right">
                <Button 
                  variant={seasonPass.claimed ? 'outline' : 'default'}
                  size="sm"
                  disabled={!seasonPass.tasks.every(t => t.completed) || seasonPass.claimed}
                >
                  {seasonPass.claimed ? 'Season Claimed' : 'Claim Season Reward'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

