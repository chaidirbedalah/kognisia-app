'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Upload, Users, FileText, Calendar, AlertCircle, CheckCircle, Clock, Play } from 'lucide-react'
import { toast } from 'sonner'

interface BulkOperation {
  id: string
  type: 'student_import' | 'question_import' | 'assessment_schedule' | 'class_creation'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  total_items: number
  processed_items: number
  created_at: string
  completed_at?: string
  error_message?: string
}

interface ClassData {
  id: string
  name: string
  grade: string
  teacher: string
  student_count: number
}

export function BulkOperations() {
  const [operations, setOperations] = useState<BulkOperation[]>([])
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('operations')
  
  // Dialog states
  const [studentImportOpen, setStudentImportOpen] = useState(false)
  const [questionImportOpen, setQuestionImportOpen] = useState(false)
  const [assessmentScheduleOpen, setAssessmentScheduleOpen] = useState(false)
  const [classCreationOpen, setClassCreationOpen] = useState(false)
  
  // Form states
  const [studentFile, setStudentFile] = useState<File | null>(null)
  const [questionFile, setQuestionFile] = useState<File | null>(null)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [assessmentTemplate, setAssessmentTemplate] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [newClassName, setNewClassName] = useState('')
  const [newClassGrade, setNewClassGrade] = useState('')
  const [newClassTeacher, setNewClassTeacher] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Load operations
      const operationsResponse = await fetch('/api/admin/bulk/operations')
      if (operationsResponse.ok) {
        const data = await operationsResponse.json()
        setOperations(data.operations || [])
      }
      
      // Load classes
      const classesResponse = await fetch('/api/admin/classes')
      if (classesResponse.ok) {
        const data = await classesResponse.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  async function handleStudentImport() {
    if (!studentFile) {
      toast.error('Pilih file terlebih dahulu')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', studentFile)
      
      const response = await fetch('/api/admin/bulk/import/students', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Impor siswa dimulai')
        setStudentImportOpen(false)
        setStudentFile(null)
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal memulai impor siswa')
      }
    } catch (error) {
      console.error('Error importing students:', error)
      toast.error('Terjadi kesalahan saat mengimpor siswa')
    }
  }

  async function handleQuestionImport() {
    if (!questionFile) {
      toast.error('Pilih file terlebih dahulu')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', questionFile)
      
      const response = await fetch('/api/admin/bulk/import/questions', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Impor soal dimulai')
        setQuestionImportOpen(false)
        setQuestionFile(null)
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal memulai impor soal')
      }
    } catch (error) {
      console.error('Error importing questions:', error)
      toast.error('Terjadi kesalahan saat mengimpor soal')
    }
  }

  async function handleAssessmentSchedule() {
    if (!assessmentTemplate || !scheduleDate || selectedClasses.length === 0) {
      toast.error('Lengkapi semua field')
      return
    }

    try {
      const response = await fetch('/api/admin/bulk/schedule/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: assessmentTemplate,
          schedule_date: scheduleDate,
          target_classes: selectedClasses
        })
      })
      
      if (response.ok) {
        toast.success('Penjadwalan ujian massal dimulai')
        setAssessmentScheduleOpen(false)
        setAssessmentTemplate('')
        setScheduleDate('')
        setSelectedClasses([])
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menjadwalkan ujian')
      }
    } catch (error) {
      console.error('Error scheduling assessments:', error)
      toast.error('Terjadi kesalahan saat menjadwalkan ujian')
    }
  }

  async function handleClassCreation() {
    if (!newClassName || !newClassGrade || !newClassTeacher) {
      toast.error('Lengkapi semua field')
      return
    }

    try {
      const response = await fetch('/api/admin/bulk/create/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newClassName,
          grade: newClassGrade,
          teacher: newClassTeacher
        })
      })
      
      if (response.ok) {
        toast.success('Kelas berhasil dibuat')
        setClassCreationOpen(false)
        setNewClassName('')
        setNewClassGrade('')
        setNewClassTeacher('')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal membuat kelas')
      }
    } catch (error) {
      console.error('Error creating class:', error)
      toast.error('Terjadi kesalahan saat membuat kelas')
    }
  }

  function getOperationIcon(type: string) {
    switch (type) {
      case 'student_import': return <Users className="h-4 w-4" />
      case 'question_import': return <FileText className="h-4 w-4" />
      case 'assessment_schedule': return <Calendar className="h-4 w-4" />
      case 'class_creation': return <Users className="h-4 w-4" />
      default: return <Upload className="h-4 w-4" />
    }
  }

  function getOperationTypeLabel(type: string) {
    switch (type) {
      case 'student_import': return 'Impor Siswa'
      case 'question_import': return 'Impor Soal'
      case 'assessment_schedule': return 'Jadwalkan Ujian'
      case 'class_creation': return 'Buat Kelas'
      default: return type
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'running': return <Play className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
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
          <h2 className="text-2xl font-bold text-gray-900">Operasi Massal</h2>
          <p className="text-gray-600">Kelola operasi massal untuk efisiensi administrasi</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Dialog open={studentImportOpen} onOpenChange={setStudentImportOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impor Siswa</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Impor data siswa dari file CSV/Excel
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Impor Data Siswa</DialogTitle>
              <DialogDescription>
                Upload file CSV atau Excel dengan data siswa
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student-file">File Data Siswa</Label>
                <Input
                  id="student-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setStudentFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500">
                  Format: Nama, Email, Kelas, NIS
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStudentImportOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleStudentImport}>
                Mulai Impor
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={questionImportOpen} onOpenChange={setQuestionImportOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impor Soal</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Impor bank soal dari file CSV/JSON
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Impor Bank Soal</DialogTitle>
              <DialogDescription>
                Upload file CSV atau JSON dengan data soal
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question-file">File Soal</Label>
                <Input
                  id="question-file"
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => setQuestionFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500">
                  Format CSV: Pertanyaan, Opsi A, Opsi B, Opsi C, Opsi D, Jawaban, Topik
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setQuestionImportOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleQuestionImport}>
                Mulai Impor
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={assessmentScheduleOpen} onOpenChange={setAssessmentScheduleOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jadwalkan Ujian</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Jadwalkan ujian untuk banyak kelas
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Jadwalkan Ujian Massal</DialogTitle>
              <DialogDescription>
                Buat jadwal ujian untuk beberapa kelas sekaligus
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="template">Template Ujian</Label>
                <Select value={assessmentTemplate} onValueChange={setAssessmentTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih template" />
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
                <Label htmlFor="schedule-date">Tanggal</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Kelas Target</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {classes.map((classData) => (
                    <div key={classData.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={classData.id}
                        checked={selectedClasses.includes(classData.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedClasses([...selectedClasses, classData.id])
                          } else {
                            setSelectedClasses(selectedClasses.filter(id => id !== classData.id))
                          }
                        }}
                      />
                      <Label htmlFor={classData.id} className="text-sm">
                        {classData.name} ({classData.grade})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssessmentScheduleOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAssessmentSchedule}>
                Jadwalkan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={classCreationOpen} onOpenChange={setClassCreationOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buat Kelas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Buat kelas baru secara massal
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Kelas Baru</DialogTitle>
              <DialogDescription>
                Tambahkan kelas baru ke sistem
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="class-name">Nama Kelas</Label>
                <Input
                  id="class-name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Contoh: XII IPA 1"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="class-grade">Tingkat</Label>
                <Select value={newClassGrade} onValueChange={setNewClassGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X">Kelas X</SelectItem>
                    <SelectItem value="XI">Kelas XI</SelectItem>
                    <SelectItem value="XII">Kelas XII</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="class-teacher">Wali Kelas</Label>
                <Input
                  id="class-teacher"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  placeholder="Nama wali kelas"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setClassCreationOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleClassCreation}>
                Buat Kelas
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Operations History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="operations">Operasi</TabsTrigger>
          <TabsTrigger value="students">Siswa</TabsTrigger>
          <TabsTrigger value="questions">Soal</TabsTrigger>
          <TabsTrigger value="classes">Kelas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Operasi</CardTitle>
              <CardDescription>
                Status operasi massal yang telah dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operations.length > 0 ? (
                  operations.map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-md">
                          {getOperationIcon(operation.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{getOperationTypeLabel(operation.type)}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(operation.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {operation.processed_items} / {operation.total_items}
                          </p>
                          <p className="text-xs text-gray-500">
                            {operation.progress.toFixed(1)}% selesai
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(operation.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(operation.status)}
                              {operation.status}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada operasi massal dilakukan
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Siswa</CardTitle>
              <CardDescription>
                Impor dan kelola data siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Gunakan tombol "Impor Siswa" untuk mengimpor data siswa
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Soal</CardTitle>
              <CardDescription>
                Impor dan kelola bank soal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Gunakan tombol "Impor Soal" untuk mengimpor bank soal
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Kelas</CardTitle>
              <CardDescription>
                Buat dan kelola kelas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nama Kelas</th>
                          <th className="text-left p-2">Tingkat</th>
                          <th className="text-left p-2">Wali Kelas</th>
                          <th className="text-left p-2">Jumlah Siswa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map((classData) => (
                          <tr key={classData.id} className="border-b">
                            <td className="p-2">{classData.name}</td>
                            <td className="p-2">{classData.grade}</td>
                            <td className="p-2">{classData.teacher}</td>
                            <td className="p-2">{classData.student_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada kelas. Gunakan tombol "Buat Kelas" untuk menambahkan kelas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}