'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    streak: 0
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      // Fetch user stats
      const { data: progressData } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user.id)
      
      if (progressData && progressData.length > 0) {
        const total = progressData.length
        const correct = progressData.filter(p => p.is_correct).length
        const accuracy = Math.round((correct / total) * 100)
        
        // Calculate streak (simple: check if user did challenge today)
        const today = new Date().toISOString().split('T')[0]
        const todayProgress = progressData.filter(p => {
          const progressDate = new Date(p.created_at).toISOString().split('T')[0]
          return progressDate === today
        })
        
        const currentStreak = todayProgress.length > 0 ? 1 : 0
        
        setStats({
          totalQuestions: total,
          correctAnswers: correct,
          accuracy: accuracy,
          streak: currentStreak
        })
      }
    }
    
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Kognisia</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang! 👋
          </h2>
          <p className="text-gray-600">
            Siap belajar hari ini? Yuk mulai Daily Challenge!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Streak Harian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.streak} Hari 🔥</div>
              <p className="text-xs text-gray-500 mt-2">Mulai streak pertamamu!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Soal Dikerjakan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalQuestions} Soal</div>
              <p className="text-xs text-gray-500 mt-2">Ayo mulai latihan!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Akurasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.accuracy}%</div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.correctAnswers} dari {stats.totalQuestions} benar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Challenge */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Daily Challenge 📚</CardTitle>
                <CardDescription>
                  Latihan harian 10 soal - Jaga streak kamu!
                </CardDescription>
              </div>
              <Badge variant="secondary">Belum Mulai</Badge>
            </div>
          </CardHeader>
          <CardContent>
              <Button 
                className="w-full md:w-auto"
                onClick={() => window.location.href = '/daily-challenge'}
              >
                Mulai Daily Challenge
              </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Try Out 📝</CardTitle>
              <CardDescription>
                Simulasi ujian 40 soal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => alert('Try Out coming soon!')}
              >
                Mulai Try Out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marathon Mode 🏃</CardTitle>
              <CardDescription>
                Simulasi UTBK lengkap 195 menit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => alert('Marathon Mode coming soon!')}
              >
                Mulai Marathon
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
