'use client'

import { useState, useEffect } from 'react'

import { Swords, Copy, Check } from 'lucide-react'

interface Subtest {
  code: string
  name: string
  description: string
}

interface StartBattleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBattleStarted: (battleId: string) => void
}

export function StartBattleDialog({
  open,
  onOpenChange,
  onBattleStarted
}: StartBattleDialogProps) {
  const [battleName, setBattleName] = useState('')
  const [battleType, setBattleType] = useState<'subtest' | 'mini_tryout'>('subtest')
  const [subtestCode, setSubtestCode] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [scheduleType, setScheduleType] = useState<'10min' | '30min' | 'custom'>('10min')
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [subtests, setSubtests] = useState<Subtest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [battleCreated, setBattleCreated] = useState(false)
  const [battleInfo, setBattleInfo] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setBattleName('')
      setBattleCreated(false)
      setBattleInfo(null)
      setCopied(false)
      setError('')
      loadSubtests()
    }
  }, [open])

  async function loadSubtests() {
    try {
      const response = await fetch('/api/subtests')
      if (response.ok) {
        const data = await response.json()
        setSubtests(data.subtests || [])
        if (data.subtests?.length > 0) {
          setSubtestCode(data.subtests[0].code)
        }
      }
    } catch (error) {
      console.error('Error loading subtests:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate battle name
      if (!battleName.trim()) {
        setError('Nama battle harus diisi')
        setLoading(false)
        return
      }

      // Calculate scheduled_start_at (always scheduled, no immediate start)
      let scheduledStartAt: string
      
      if (scheduleType === '10min') {
        const start = new Date()
        start.setMinutes(start.getMinutes() + 10)
        scheduledStartAt = start.toISOString()
      } else if (scheduleType === '30min') {
        const start = new Date()
        start.setMinutes(start.getMinutes() + 30)
        scheduledStartAt = start.toISOString()
      } else if (scheduleType === 'custom') {
        if (!customDate || !customTime) {
          setError('Pilih tanggal dan waktu untuk custom schedule')
          setLoading(false)
          return
        }
        scheduledStartAt = new Date(`${customDate}T${customTime}`).toISOString()
      } else {
        setError('Pilih waktu mulai battle')
        setLoading(false)
        return
      }

      // Get session token
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      // Use the new battle/create endpoint
      const response = await fetch('/api/battle/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          battle_name: battleName.trim(),
          battle_type: battleType,
          subtest_code: battleType === 'subtest' ? subtestCode : undefined,
          question_count: battleType === 'subtest' ? questionCount : undefined,
          scheduled_start_at: scheduledStartAt
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create battle')
      }

      // Battle created successfully, show info screen
      setBattleCreated(true)
      setBattleInfo({
        battleId: data.battle.id,
        squadName: data.battle.squad_name,
        inviteCode: data.battle.invite_code,
        scheduledStartAt,
        battleType,
        subtestCode,
        subtestName: subtests.find(s => s.code === subtestCode)?.name,
        questionCount
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setBattleName('')
    setBattleType('subtest')
    setQuestionCount(10)
    setError('')
    setBattleCreated(false)
    setBattleInfo(null)
    setCopied(false)
    onOpenChange(false)
  }

  const copyBattleInfo = () => {
    if (!battleInfo) return
    
    const subtestInfo = battleInfo.battleType === 'subtest' 
      ? `${battleInfo.subtestName || battleInfo.subtestCode} - ${battleInfo.questionCount} soal`
      : 'Mini Try Out'
    
    const message = `🎯 Squad Battle Challenge! 🎯

Squad: ${battleInfo.squadName}
Invite Code: ${battleInfo.inviteCode}

📚 Materi: ${subtestInfo}
🕐 Waktu Battle: ${new Date(battleInfo.scheduledStartAt).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

⚠️ Battle akan auto-start tepat waktu!
Join squad ini jika waktu battle cocok dengan jadwalmu.

Buktikan kemampuanmu! 💪`
    
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Show battle info screen after creation
  console.log('StartBattleDialog render:', { open, battleCreated, hasBattleInfo: !!battleInfo })
  
  if (battleCreated && battleInfo) {
    console.log('Showing battle info screen')
    const subtestInfo = battleInfo.battleType === 'subtest' 
      ? `${battleInfo.subtestName || battleInfo.subtestCode} - ${battleInfo.questionCount} soal`
      : 'Mini Try Out'
    
    return (
      <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
        
        {/* Dialog */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl border-4 border-green-500 p-6 z-50">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-green-600">Battle Created! 🎉</h2>
            <p className="text-gray-600 text-sm mt-1">
              Share this info with your squad members
            </p>
          </div>

          <div className="space-y-4">
            {/* Invite Code */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Invite Code</p>
              <p className="text-3xl font-bold text-purple-600 tracking-wider">
                {battleInfo.inviteCode}
              </p>
            </div>

            {/* Battle Info */}
            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Squad:</span>
                <span className="font-medium">{battleInfo.squadName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Materi:</span>
                <span className="font-medium">{subtestInfo}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Waktu Battle:</span>
                <span className="font-medium text-right">
                  {new Date(battleInfo.scheduledStartAt).toLocaleString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={copyBattleInfo}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy to Share via WhatsApp
                </>
              )}
            </button>

            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <p className="text-orange-800 text-sm">
                ⚠️ Battle will auto-start at scheduled time. Be there or beware!
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                handleClose()
                onBattleStarted('') // Trigger refresh
              }}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  console.log('Showing form')
  
  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      
      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl border-4 border-purple-500 p-6 z-50">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-purple-600 flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Create Squad Battle
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Pilih materi dan jadwalkan waktu battle
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Battle Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Nama Battle *</label>
            <input
              type="text"
              value={battleName}
              onChange={(e) => setBattleName(e.target.value)}
              placeholder="Contoh: Battle Matematika Sore"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Nama ini akan menjadi nama squad dan terlihat oleh semua member
            </p>
          </div>

          {/* Battle Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Materi Battle *</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="battleType"
                  value="subtest"
                  checked={battleType === 'subtest'}
                  onChange={(e) => setBattleType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Pilih Subtest</div>
                  <div className="text-xs text-gray-500">Pilih 1 dari 7 subtest UTBK dan jumlah soal</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="battleType"
                  value="mini_tryout"
                  checked={battleType === 'mini_tryout'}
                  onChange={(e) => setBattleType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Mini Try Out</div>
                  <div className="text-xs text-gray-500">Semua subtest digabung - 20 soal campuran</div>
                </div>
              </label>
            </div>
          </div>

          {/* Subtest Selection */}
          {battleType === 'subtest' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Pilih Subtest *</label>
                <select
                  value={subtestCode}
                  onChange={(e) => setSubtestCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Pilih subtest</option>
                  {subtests.map((subtest) => (
                    <option key={subtest.code} value={subtest.code}>
                      {subtest.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Jumlah Soal *</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value={5}>5 soal</option>
                  <option value={10}>10 soal</option>
                  <option value={15}>15 soal</option>
                  <option value={20}>20 soal</option>
                  <option value={25}>25 soal</option>
                  <option value={30}>30 soal</option>
                </select>
              </div>
            </>
          )}



          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Waktu Mulai Battle *</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scheduleType"
                  value="10min"
                  checked={scheduleType === '10min'}
                  onChange={(e) => setScheduleType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">10 Menit dari Sekarang</div>
                  <div className="text-xs text-gray-500">Waktu minimum untuk share invite code</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scheduleType"
                  value="30min"
                  checked={scheduleType === '30min'}
                  onChange={(e) => setScheduleType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">30 Menit dari Sekarang</div>
                  <div className="text-xs text-gray-500">Waktu persiapan lebih lama (recommended)</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scheduleType"
                  value="custom"
                  checked={scheduleType === 'custom'}
                  onChange={(e) => setScheduleType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Custom (Pilih Tanggal & Waktu)</div>
                  <div className="text-xs text-gray-500">Jadwalkan untuk waktu tertentu</div>
                </div>
              </label>
            </div>
          </div>

          {/* Custom Date/Time */}
          {scheduleType === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal *</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Waktu *</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <p className="text-sm text-orange-800 font-medium">
              ⚠️ Battle will auto-start at scheduled time!
            </p>
            <p className="text-xs text-orange-700 mt-1">
              Be there or beware - late joiners will have less time to complete!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (battleType === 'subtest' && !subtestCode)}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Battle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
