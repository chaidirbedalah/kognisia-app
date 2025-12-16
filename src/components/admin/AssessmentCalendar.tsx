'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, Users, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ScheduledAssessment {
  id: string
  title: string
  description: string
  assessment_type: 'daily_challenge' | 'mini_tryout' | 'tryout_utbk' | 'marathon'
  scheduled_at: string
  start_time: string
  end_time: string
  target_classes: string[]
  is_published: boolean
  is_completed: boolean
  created_at: string
}

export function AssessmentCalendar() {
  const [assessments, setAssessments] = useState<ScheduledAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assessment_type: 'mini_tryout' as const,
    scheduled_at: new Date(),
    start_time: '08:00',
    end_time: '09:00',
    target_classes: [] as string[]
  })

  useEffect(() => {
    loadAssessments()
  }, [])

  async function loadAssessments() {
    try {
      const response = await fetch('/api/admin/assessments/scheduled')
      if (response.ok) {
        const data = await response.json()
        setAssessments(data.assessments || [])
      }
    } catch (error) {
      console.error('Error loading assessments:', error)
      toast.error('Gagal memuat jadwal ujian')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAssessment() {
    try {
      const response = await fetch('/api/admin/assessments/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scheduled_at: formData.scheduled_at.toISOString(),
        }),
      })

      if (response.ok) {
        toast.success('Ujian berhasil dijadwalkan')
        setCreateDialogOpen(false)
        loadAssessments()
        // Reset form
        setFormData({
          title: '',
          description: '',
          assessment_type: 'mini_tryout',
          scheduled_at: new Date(),
          start_time: '08:00',
          end_time: '09:00',
          target_classes: []
        })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menjadwalkan ujian')
      }
    } catch (error) {
      console.error('Error creating assessment:', error)
      toast.error('Terjadi kesalahan saat menjadwalkan ujian')
    }
  }

  function getAssessmentsForDate(date: Date) {
    return assessments.filter(assessment => {
      const assessmentDate = new Date(assessment.scheduled_at)
      return assessmentDate.toDateString() === date.toDateString()
    })
  }

  function getAssessmentTypeLabel(type: string) {
    switch (type) {
      case 'daily_challenge': return 'Daily Challenge'
      case 'mini_tryout': return 'Mini Try Out'
      case 'tryout_utbk': return 'Try Out UTBK'
      case 'marathon': return 'Marathon'
      default: return type
    }
  }

  function getAssessmentTypeColor(type: string) {
    switch (type) {
      case 'daily_challenge': return 'bg-blue-100 text-blue-800'
      case 'mini_tryout': return 'bg-green-100 text-green-800'
      case 'tryout_utbk': return 'bg-purple-100 text-purple-800'
      case 'marathon': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Kalender Ujian</h2>
          <p className="text-gray-600">Jadwalkan dan kelola ujian untuk semua kelas</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Jadwalkan Ujian
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Jadwalkan Ujian Baru</DialogTitle>
              <DialogDescription>
                Buat jadwal ujian untuk satu atau lebih kelas
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Ujian</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Try Out Matematika Kelas 12"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat tentang ujian"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="assessment_type">Tipe Ujian</Label>
                <Select
                  value={formData.assessment_type}
                  onValueChange={(value: any) => setFormData({ ...formData, assessment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe ujian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily_challenge">Daily Challenge</SelectItem>
                    <SelectItem value="mini_tryout">Mini Try Out</SelectItem>
                    <SelectItem value="tryout_utbk">Try Out UTBK</SelectItem>
                    <SelectItem value="marathon">Marathon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduled_at && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {formData.scheduled_at ? format(formData.scheduled_at, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_at}
                      onSelect={(date) => date && setFormData({ ...formData, scheduled_at: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Waktu Mulai</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_time">Waktu Selesai</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateAssessment}>
                Jadwalkan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </CardTitle>
          <CardDescription>
            Klik pada tanggal untuk melihat detail ujian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, index) => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 1)
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
              const dayAssessments = isCurrentMonth ? getAssessmentsForDate(date) : []
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[80px] p-1 border rounded-md",
                    isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400",
                    selectedDate?.toDateString() === date.toDateString() && "ring-2 ring-blue-500"
                  )}
                  onClick={() => isCurrentMonth && setSelectedDate(date)}
                >
                  <div className="text-sm font-medium mb-1">
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayAssessments.slice(0, 2).map((assessment) => (
                      <div
                        key={assessment.id}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer",
                          getAssessmentTypeColor(assessment.assessment_type)
                        )}
                        title={assessment.title}
                      >
                        {assessment.title}
                      </div>
                    ))}
                    {dayAssessments.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayAssessments.length - 2} lagi
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Ujian untuk {format(selectedDate, 'PPP', { locale: id })}
            </CardTitle>
            <CardDescription>
              Kelola ujian yang dijadwalkan untuk tanggal ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getAssessmentsForDate(selectedDate).length > 0 ? (
              <div className="space-y-4">
                {getAssessmentsForDate(selectedDate).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{assessment.title}</h3>
                        <Badge className={getAssessmentTypeColor(assessment.assessment_type)}>
                          {getAssessmentTypeLabel(assessment.assessment_type)}
                        </Badge>
                        {assessment.is_published && (
                          <Badge variant="outline">Dipublikasikan</Badge>
                        )}
                        {assessment.is_completed && (
                          <Badge variant="secondary">Selesai</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {assessment.start_time} - {assessment.end_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assessment.target_classes.length} kelas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tidak ada ujian dijadwalkan untuk tanggal ini
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}