'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Mail, MessageSquare, Smartphone, Clock, Users, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationTemplate {
  id: string
  name: string
  type: 'assessment_reminder' | 'achievement_unlock' | 'streak_milestone' | 'class_announcement'
  channel: 'email' | 'push' | 'sms' | 'in_app'
  subject: string
  message: string
  timing: 'immediate' | 'daily' | 'weekly' | 'custom'
  custom_days?: number
  is_active: boolean
  created_at: string
}

interface NotificationSettings {
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  in_app_enabled: boolean
  assessment_reminder_hours: number
  achievement_notification: boolean
  streak_notification: boolean
  class_announcement: boolean
  digest_frequency: 'daily' | 'weekly' | 'never'
}

export function NotificationSettings() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    in_app_enabled: true,
    assessment_reminder_hours: 24,
    achievement_notification: true,
    streak_notification: true,
    class_announcement: true,
    digest_frequency: 'weekly'
  })
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [activeTab, setActiveTab] = useState('settings')
  
  // Template form states
  const [templateFormOpen, setTemplateFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'assessment_reminder' as const,
    channel: 'email' as const,
    subject: '',
    message: '',
    timing: 'immediate' as const,
    custom_days: 1,
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Load settings
      const settingsResponse = await fetch('/api/admin/notifications/settings')
      if (settingsResponse.ok) {
        const data = await settingsResponse.json()
        setSettings(data.settings || settings)
      }
      
      // Load templates
      const templatesResponse = await fetch('/api/admin/notifications/templates')
      if (templatesResponse.ok) {
        const data = await templatesResponse.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error loading notification data:', error)
      toast.error('Gagal memuat data notifikasi')
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    try {
      const response = await fetch('/api/admin/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        toast.success('Pengaturan notifikasi disimpan')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menyimpan pengaturan')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Terjadi kesalahan saat menyimpan pengaturan')
    }
  }

  async function saveTemplate() {
    try {
      const url = editingTemplate 
        ? `/api/admin/notifications/templates/${editingTemplate.id}`
        : '/api/admin/notifications/templates'
      
      const method = editingTemplate ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateForm)
      })
      
      if (response.ok) {
        toast.success(`Template ${editingTemplate ? 'diperbarui' : 'dibuat'}`)
        setTemplateFormOpen(false)
        setEditingTemplate(null)
        resetTemplateForm()
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menyimpan template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Terjadi kesalahan saat menyimpan template')
    }
  }

  function resetTemplateForm() {
    setTemplateForm({
      name: '',
      type: 'assessment_reminder',
      channel: 'email',
      subject: '',
      message: '',
      timing: 'immediate',
      custom_days: 1,
      is_active: true
    })
  }

  function editTemplate(template: NotificationTemplate) {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      type: template.type,
      channel: template.channel,
      subject: template.subject,
      message: template.message,
      timing: template.timing,
      custom_days: template.custom_days || 1,
      is_active: template.is_active
    })
    setTemplateFormOpen(true)
  }

  async function deleteTemplate(templateId: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/notifications/templates/${templateId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Template dihapus')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menghapus template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Terjadi kesalahan saat menghapus template')
    }
  }

  function getChannelIcon(channel: string) {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'push': return <Smartphone className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'in_app': return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'assessment_reminder': return 'Pengingat Ujian'
      case 'achievement_unlock': return 'Unlock Achievement'
      case 'streak_milestone': return 'Milestone Streak'
      case 'class_announcement': return 'Pengumuman Kelas'
      default: return type
    }
  }

  function getTimingLabel(timing: string) {
    switch (timing) {
      case 'immediate': return 'Segera'
      case 'daily': return 'Harian'
      case 'weekly': return 'Mingguan'
      case 'custom': return 'Kustom'
      default: return timing
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
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan Notifikasi</h2>
          <p className="text-gray-600">Kelola notifikasi otomatis untuk siswa dan guru</p>
        </div>
        
        <Button onClick={saveSettings} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Simpan Pengaturan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          <TabsTrigger value="templates">Template</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-4">
          {/* Channel Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Saluran Notifikasi
              </CardTitle>
              <CardDescription>
                Pilih saluran notifikasi yang akan digunakan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="email-enabled">Email</Label>
                </div>
                <Switch
                  id="email-enabled"
                  checked={settings.email_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, email_enabled: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <Label htmlFor="push-enabled">Push Notification</Label>
                </div>
                <Switch
                  id="push-enabled"
                  checked={settings.push_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, push_enabled: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <Label htmlFor="sms-enabled">SMS</Label>
                </div>
                <Switch
                  id="sms-enabled"
                  checked={settings.sms_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, sms_enabled: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="in-app-enabled">In-App</Label>
                </div>
                <Switch
                  id="in-app-enabled"
                  checked={settings.in_app_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, in_app_enabled: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pengaturan Waktu
              </CardTitle>
              <CardDescription>
                Atur kapan notifikasi dikirim
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="reminder-hours">Pengingat Ujian (jam sebelumnya)</Label>
                <Input
                  id="reminder-hours"
                  type="number"
                  min="1"
                  max="168"
                  value={settings.assessment_reminder_hours}
                  onChange={(e) => setSettings({ ...settings, assessment_reminder_hours: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="digest-frequency">Frekuensi Digest</Label>
                <Select value={settings.digest_frequency} onValueChange={(value: any) => setSettings({ ...settings, digest_frequency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih frekuensi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="never">Tidak pernah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tipe Notifikasi
              </CardTitle>
              <CardDescription>
                Pilih tipe notifikasi yang akan dikirim
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="achievement-notification">Notifikasi Achievement</Label>
                <Switch
                  id="achievement-notification"
                  checked={settings.achievement_notification}
                  onCheckedChange={(checked) => setSettings({ ...settings, achievement_notification: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="streak-notification">Notifikasi Streak</Label>
                <Switch
                  id="streak-notification"
                  checked={settings.streak_notification}
                  onCheckedChange={(checked) => setSettings({ ...settings, streak_notification: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="class-announcement">Pengumuman Kelas</Label>
                <Switch
                  id="class-announcement"
                  checked={settings.class_announcement}
                  onCheckedChange={(checked) => setSettings({ ...settings, class_announcement: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Template Notifikasi</h3>
              <p className="text-sm text-gray-600">Kelola template untuk berbagai jenis notifikasi</p>
            </div>
            
            <Button onClick={() => {
              resetTemplateForm()
              setEditingTemplate(null)
              setTemplateFormOpen(true)
            }}>
              Buat Template Baru
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Daftar Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-md">
                          {getChannelIcon(template.channel)}
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-gray-500">
                            {getTypeLabel(template.type)} • {getTimingLabel(template.timing)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Aktif" : "Non-aktif"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => editTemplate(template)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteTemplate(template.id)}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada template notifikasi
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview Notifikasi</CardTitle>
              <CardDescription>
                Lihat contoh notifikasi yang akan diterima pengguna
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Preview */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4" />
                  <h3 className="font-medium">Email Preview</h3>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="border-b pb-2 mb-2">
                    <p className="text-sm text-gray-600">Dari: noreply@kognisia.id</p>
                    <p className="text-sm text-gray-600">Ke: siswa@example.com</p>
                    <p className="font-medium">Subjek: Pengingat Ujian - Try Out Matematika</p>
                  </div>
                  <div className="text-sm">
                    <p>Hai [Nama Siswa],</p>
                    <p className="mt-2">Jangan lupa bahwa kamu memiliki ujian Try Out Matematika yang dijadwalkan untuk:</p>
                    <p className="mt-2 font-medium">Tanggal: [Tanggal Ujian]</p>
                    <p>Waktu: [Waktu Ujian]</p>
                    <p className="mt-2">Pastikan kamu sudah siap dan login ke platform 15 menit sebelum ujian dimulai.</p>
                    <p className="mt-2">Semoga berhasil!</p>
                    <p className="mt-2">Tim Kognisia</p>
                  </div>
                </div>
              </div>
              
              {/* Push Notification Preview */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4" />
                  <h3 className="font-medium">Push Notification Preview</h3>
                </div>
                <div className="bg-gray-900 text-white p-3 rounded-lg max-w-sm">
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-600 rounded-full p-1 mt-1">
                      <Bell className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Kognisia</p>
                      <p className="text-sm">Pengingat Ujian: Try Out Matematika besok pukul 08:00</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SMS Preview */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4" />
                  <h3 className="font-medium">SMS Preview</h3>
                </div>
                <div className="bg-gray-100 p-3 rounded max-w-sm">
                  <p className="text-sm font-mono">
                    Kognisia: Pengingat ujian Try Out Matematika besok pukul 08:00. Login 15 menit sebelum ujian dimulai.
                  </p>
                </div>
              </div>
              
              {/* In-App Preview */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="h-4 w-4" />
                  <h3 className="font-medium">In-App Notification Preview</h3>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 rounded-full p-1 mt-1">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Achievement Unlocked!</p>
                      <p className="text-sm text-gray-600">Selamat! Kamu telah membuka achievement "First Battle Victory"</p>
                      <p className="text-xs text-gray-500 mt-1">2 menit yang lalu</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Template Form Dialog */}
      {templateFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingTemplate ? 'Edit Template' : 'Buat Template Baru'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="template-name">Nama Template</Label>
                <Input
                  id="template-name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Contoh: Pengingat Ujian Harian"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="template-type">Tipe Notifikasi</Label>
                <Select value={templateForm.type} onValueChange={(value: any) => setTemplateForm({ ...templateForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assessment_reminder">Pengingat Ujian</SelectItem>
                    <SelectItem value="achievement_unlock">Unlock Achievement</SelectItem>
                    <SelectItem value="streak_milestone">Milestone Streak</SelectItem>
                    <SelectItem value="class_announcement">Pengumuman Kelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="template-channel">Saluran</Label>
                <Select value={templateForm.channel} onValueChange={(value: any) => setTemplateForm({ ...templateForm, channel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih saluran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="template-subject">Subjek (untuk email)</Label>
                <Input
                  id="template-subject"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  placeholder="Subjek notifikasi"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="template-message">Pesan</Label>
                <Textarea
                  id="template-message"
                  value={templateForm.message}
                  onChange={(e) => setTemplateForm({ ...templateForm, message: e.target.value })}
                  placeholder="Isi pesan notifikasi"
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Gunakan [Nama Siswa], [Tanggal Ujian], [Waktu Ujian] untuk placeholder
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="template-timing">Timing</Label>
                <Select value={templateForm.timing} onValueChange={(value: any) => setTemplateForm({ ...templateForm, timing: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Segera</SelectItem>
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="custom">Kustom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {templateForm.timing === 'custom' && (
                <div className="grid gap-2">
                  <Label htmlFor="custom-days">Hari Kustom</Label>
                  <Input
                    id="custom-days"
                    type="number"
                    min="1"
                    max="30"
                    value={templateForm.custom_days}
                    onChange={(e) => setTemplateForm({ ...templateForm, custom_days: parseInt(e.target.value) })}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label htmlFor="template-active">Aktif</Label>
                <Switch
                  id="template-active"
                  checked={templateForm.is_active}
                  onCheckedChange={(checked) => setTemplateForm({ ...templateForm, is_active: checked })}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setTemplateFormOpen(false)}>
                Batal
              </Button>
              <Button onClick={saveTemplate}>
                {editingTemplate ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}