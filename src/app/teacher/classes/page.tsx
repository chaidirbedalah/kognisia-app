'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSearchParams } from 'next/navigation'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

type ClassInfo = { id: string; name: string }
type RosterItem = { id: string; full_name: string; email: string }

function ClassManagementContent() {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [roster, setRoster] = useState<RosterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [renameValue, setRenameValue] = useState('')
  const [transferTargetClassId, setTransferTargetClassId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const loadClasses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }
    const { data: classEnrollments } = await supabase
      .from('enrollments')
      .select('class_id, classes!inner(id, name)')
      .eq('student_id', user.id)
    const rows = (classEnrollments || []) as Array<Record<string, unknown>>
    const seen = new Set<string>()
    const items: ClassInfo[] = []
    rows.forEach(r => {
      const c = r['classes'] as Record<string, unknown> | undefined
      const id = String(c?.id ?? '')
      const name = String(c?.name ?? '')
      if (id && !seen.has(id)) {
        seen.add(id)
        items.push({ id, name })
      }
    })
    setClasses(items)
    if (items.length > 0) {
      setSelectedClassId(items[0].id)
      setRenameValue(items[0].name)
    }
  }, [])

  const loadRoster = useCallback(async (classId: string) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token ?? ''
    const res = await fetch(`/api/classes/${classId}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const json = await res.json() as { students: RosterItem[] }
      setRoster(json.students || [])
    } else {
      setRoster([])
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await loadClasses()
      setLoading(false)
    }
    init()
  }, [loadClasses])

  useEffect(() => {
    if (selectedClassId) {
      const t = setTimeout(() => {
        loadRoster(selectedClassId)
      }, 0)
      return () => clearTimeout(t)
    }
  }, [selectedClassId, loadRoster])

  useEffect(() => {
    const id = searchParams.get('selectedClassId')
    if (id && classes.some(c => c.id === id)) {
      const c = classes.find(x => x.id === id)
      const t = setTimeout(() => {
        setSelectedClassId(id)
        setRenameValue(c?.name || '')
      }, 0)
      return () => clearTimeout(t)
    }
  }, [searchParams, classes])
  const handleClassSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    const c = classes.find(x => x.id === id)
    setSelectedClassId(id)
    setRenameValue(c?.name || '')
  }

  const handleRename = async () => {
    if (!selectedClassId) return
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token ?? ''
    const res = await fetch(`/api/classes/${selectedClassId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: renameValue })
    })
    if (res.ok) {
      const updated = classes.map(c => c.id === selectedClassId ? { ...c, name: renameValue } : c)
      setClasses(updated)
      // no-op
    }
  }

  const handleTransfer = async (studentId: string) => {
    if (!selectedClassId || !transferTargetClassId || transferTargetClassId === selectedClassId) return
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token ?? ''
    const res = await fetch(`/api/classes/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ studentId, fromClassId: selectedClassId, toClassId: transferTargetClassId })
    })
    if (res.ok) {
      await loadRoster(selectedClassId)
    }
  }

  if (loading) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-40 rounded" />
              <Badge variant="secondary">Guru</Badge>
            </div>
            <Skeleton className="h-9 w-32 rounded" />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/teacher">Kognisia Teacher</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manajemen Kelas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-gray-600">Kelas:</span>
            <Skeleton className="h-9 w-48 rounded" />
          </div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="h-6 w-56">
                <Skeleton className="h-6 w-56 rounded" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-40 rounded" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 bg-white border rounded">
                    <Skeleton className="h-5 w-40 rounded mb-2" />
                    <Skeleton className="h-4 w-56 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-600">Manajemen Kelas</h1>
            <Badge variant="secondary">Guru</Badge>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/teacher'}>
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/teacher">Kognisia Teacher</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Manajemen Kelas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-gray-600">Kelas:</span>
          <select
            className="text-sm border rounded px-2 py-1"
            value={selectedClassId ?? ''}
            onChange={handleClassSelect}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Kelas</CardTitle>
              <CardDescription>Ubah nama kelas dan kelola siswa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700">Nama Kelas</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="max-w-md" />
                    <Button size="sm" onClick={handleRename}>Simpan</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-700">Pindahkan siswa ke kelas lain</label>
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={transferTargetClassId ?? ''}
                      onChange={(e) => setTransferTargetClassId(e.target.value)}
                    >
                      <option value="">Pilih kelas tujuan</option>
                      {classes
                        .filter(c => c.id !== selectedClassId)
                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pilih kelas tujuan, lalu klik tombol pindah pada baris siswa.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Siswa</CardTitle>
              <CardDescription>Kelola anggota kelas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roster.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-gray-900">{s.full_name}</div>
                      <div className="text-sm text-gray-600">{s.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!transferTargetClassId}
                        onClick={() => handleTransfer(s.id)}
                      >
                        Pindah ke kelas tujuan
                      </Button>
                    </div>
                  </div>
                ))}
                {roster.length === 0 && (
                  <div className="text-gray-500 text-sm">Belum ada siswa di kelas ini</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </Suspense>
  )
}

export default function ClassManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ClassManagementContent />
    </Suspense>
  )
}
