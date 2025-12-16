'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Users, BookOpen, Target, Clock, Download } from 'lucide-react'
import { toast } from 'sonner'

interface SchoolAnalytics {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  activeStudents: number
  averageAccuracy: number
  totalAssessments: number
  completionRate: number
  engagementRate: number
}

interface ClassPerformance {
  id: string
  name: string
  grade: string
  teacher: string
  studentCount: number
  averageAccuracy: number
  totalQuestions: number
  completionRate: number
  lastActivity: string
}

interface SubtestPerformance {
  subtestCode: string
  subtestName: string
  averageAccuracy: number
  totalAttempts: number
  improvementRate: number
}

interface WeeklyEngagement {
  week: string
  activeUsers: number
  totalSessions: number
  averageSessionTime: number
  completionRate: number
}

export function SchoolAnalytics() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [analytics, setAnalytics] = useState<SchoolAnalytics | null>(null)
  const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([])
  const [subtestPerformance, setSubtestPerformance] = useState<SubtestPerformance[]>([])
  const [weeklyEngagement, setWeeklyEngagement] = useState<WeeklyEngagement[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  async function loadAnalytics() {
    try {
      setLoading(true)
      
      // Load main analytics
      const analyticsResponse = await fetch(`/api/admin/analytics/overview?timeRange=${timeRange}`)
      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json()
        setAnalytics(data.analytics)
      }
      
      // Load class performance
      const classResponse = await fetch(`/api/admin/analytics/classes?timeRange=${timeRange}`)
      if (classResponse.ok) {
        const data = await classResponse.json()
        setClassPerformance(data.classes || [])
      }
      
      // Load subtest performance
      const subtestResponse = await fetch(`/api/admin/analytics/subtests?timeRange=${timeRange}`)
      if (subtestResponse.ok) {
        const data = await subtestResponse.json()
        setSubtestPerformance(data.subtests || [])
      }
      
      // Load weekly engagement
      const engagementResponse = await fetch(`/api/admin/analytics/engagement?timeRange=${timeRange}`)
      if (engagementResponse.ok) {
        const data = await engagementResponse.json()
        setWeeklyEngagement(data.weeks || [])
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Gagal memuat data analitik')
    } finally {
      setLoading(false)
    }
  }

  async function exportReport() {
    try {
      const response = await fetch(`/api/admin/analytics/export?timeRange=${timeRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `school-analytics-${timeRange}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Laporan berhasil diunduh')
      } else {
        toast.error('Gagal mengunduh laporan')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Terjadi kesalahan saat mengunduh laporan')
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analitik Sekolah</h2>
          <p className="text-gray-600">Pantau performa dan keterlibatan siswa</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih rentang waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Hari Terakhir</SelectItem>
              <SelectItem value="30d">30 Hari Terakhir</SelectItem>
              <SelectItem value="90d">3 Bulan Terakhir</SelectItem>
              <SelectItem value="365d">1 Tahun Terakhir</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Unduh Laporan
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalStudents.toLocaleString('id-ID')}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {analytics.activeStudents} aktif hari ini
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Akurasi</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageAccuracy.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Dari {analytics.totalAssessments} ujian
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tingkat Penyelesaian</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +5% dari bulan lalu
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tingkat Keterlibatan</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.engagementRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Siswa aktif minggu ini
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">Performa Kelas</TabsTrigger>
          <TabsTrigger value="subtests">Performa Subtest</TabsTrigger>
          <TabsTrigger value="engagement">Keterlibatan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performa per Kelas</CardTitle>
              <CardDescription>
                Perbandingan performa akademik antar kelas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageAccuracy" fill="#8884d8" name="Akurasi (%)" />
                    <Bar dataKey="completionRate" fill="#82ca9d" name="Tingkat Penyelesaian (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Class Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Performa Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Kelas</th>
                      <th className="text-left p-2">Guru</th>
                      <th className="text-left p-2">Siswa</th>
                      <th className="text-left p-2">Akurasi</th>
                      <th className="text-left p-2">Penyelesaian</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classPerformance.map((classData) => (
                      <tr key={classData.id} className="border-b">
                        <td className="p-2">{classData.name}</td>
                        <td className="p-2">{classData.teacher}</td>
                        <td className="p-2">{classData.studentCount}</td>
                        <td className="p-2">{classData.averageAccuracy.toFixed(1)}%</td>
                        <td className="p-2">{classData.completionRate.toFixed(1)}%</td>
                        <td className="p-2">
                          <Badge variant={classData.averageAccuracy >= 70 ? "default" : "destructive"}>
                            {classData.averageAccuracy >= 70 ? "Baik" : "Perlu Perhatian"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subtests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performa per Subtest</CardTitle>
              <CardDescription>
                Analisis performa siswa berdasarkan subtest UTBK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subtestPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ subtestName, averageAccuracy }) => `${subtestName}: ${averageAccuracy.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="averageAccuracy"
                    >
                      {subtestPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tren Keterlibatan Mingguan</CardTitle>
              <CardDescription>
                Jumlah siswa aktif dan sesi pembelajaran per minggu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyEngagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Siswa Aktif" />
                    <Line type="monotone" dataKey="totalSessions" stroke="#82ca9d" name="Total Sesi" />
                    <Line type="monotone" dataKey="completionRate" stroke="#ffc658" name="Tingkat Penyelesaian (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}