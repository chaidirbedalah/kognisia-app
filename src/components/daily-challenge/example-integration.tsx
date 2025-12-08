/**
 * Example Integration: Daily Challenge Mode Selector & Subtest Selector
 * 
 * This file demonstrates how to integrate the DailyChallengeModeSelectorComponent
 * and SubtestSelectorComponent into the Daily Challenge flow.
 * 
 * This is NOT production code - it's a reference implementation showing
 * how the components should be used together.
 */

'use client'

import { useState } from 'react'
import { DailyChallengeModeSelectorComponent } from './DailyChallengeModeSelectorComponent'
import { SubtestSelectorComponent } from './SubtestSelectorComponent'
import { DailyChallengeMode } from '@/lib/types'

/**
 * Example: Daily Challenge Page with Mode Selection
 * 
 * Flow:
 * 1. Show mode selector
 * 2. User selects mode
 * 3. If balanced: fetch questions and start
 * 4. If focus: show subtest selector
 * 5. User selects subtest
 * 6. Fetch questions and start
 */
export function ExampleDailyChallengeFlow() {
  const [selectedMode, setSelectedMode] = useState<DailyChallengeMode | null>(null)
  const [selectedSubtest, setSelectedSubtest] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleModeSelect = async (mode: DailyChallengeMode) => {
    console.log('Mode selected:', mode)
    setSelectedMode(mode)

    if (mode === 'balanced') {
      // Balanced Mode: Fetch 18 questions immediately
      setIsLoading(true)
      try {
        console.log('Fetching 18 questions for balanced mode...')
        
        // Example API call (to be implemented in Task 8):
        // const response = await fetch('/api/daily-challenge/start', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ mode: 'balanced' })
        // })
        // const data = await response.json()
        // Navigate to question screen with data
        
        console.log('Would navigate to question screen with 18 questions')
      } catch (error) {
        console.error('Error starting Daily Challenge:', error)
      } finally {
        setIsLoading(false)
      }
    }
    // Focus mode: will show subtest selector (no loading yet)
  }

  const handleSubtestSelect = async (subtestCode: string) => {
    console.log('Subtest selected:', subtestCode)
    setSelectedSubtest(subtestCode)
    setIsLoading(true)

    try {
      // Focus Mode: Fetch 10 questions from selected subtest
      console.log(`Fetching 10 questions for subtest ${subtestCode}...`)
      
      // Example API call (to be implemented in Task 9):
      // const response = await fetch('/api/daily-challenge/start', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     mode: 'focus',
      //     subtestCode: subtestCode 
      //   })
      // })
      // const data = await response.json()
      // Navigate to question screen with data
      
      console.log('Would navigate to question screen with 10 questions')
    } catch (error) {
      console.error('Error starting Daily Challenge:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedMode(null)
    setSelectedSubtest(null)
  }

  // Step 1: Show mode selector
  if (!selectedMode) {
    return (
      <DailyChallengeModeSelectorComponent 
        onModeSelect={handleModeSelect}
      />
    )
  }

  // Step 2: Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">
            Mempersiapkan soal...
          </p>
        </div>
      </div>
    )
  }

  // Step 3: Show subtest selector for focus mode
  if (selectedMode === 'focus' && !selectedSubtest) {
    return (
      <SubtestSelectorComponent 
        onSelect={handleSubtestSelect}
        onBack={handleBack}
      />
    )
  }

  // Step 4: Would show questions (placeholder)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">
          {selectedMode === 'balanced' ? '⚖️' : '🎯'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedMode === 'balanced' ? 'Mode Seimbang' : 'Mode Fokus'}
        </h2>
        <p className="text-gray-600 mb-4">
          {selectedMode === 'balanced' 
            ? 'Akan menampilkan 18 soal (3 dari setiap subtes)'
            : `Akan menampilkan 10 soal dari subtes ${selectedSubtest}`
          }
        </p>
        <p className="text-sm text-gray-500">
          Next: Implement question display (Task 8-10)
        </p>
      </div>
    </div>
  )
}

/**
 * Example: Integration with existing Daily Challenge page
 * 
 * To integrate into /app/daily-challenge/page.tsx:
 * 
 * 1. Import the components:
 *    import { DailyChallengeModeSelectorComponent } from '@/components/daily-challenge/DailyChallengeModeSelectorComponent'
 *    import { SubtestSelectorComponent } from '@/components/daily-challenge/SubtestSelectorComponent'
 * 
 * 2. Add state for mode and subtest selection:
 *    const [selectedMode, setSelectedMode] = useState<DailyChallengeMode | null>(null)
 *    const [selectedSubtest, setSelectedSubtest] = useState<string | null>(null)
 *    const [isLoading, setIsLoading] = useState(false)
 * 
 * 3. Show mode selector first:
 *    if (!selectedMode) {
 *      return (
 *        <DailyChallengeModeSelectorComponent 
 *          onModeSelect={(mode) => {
 *            setSelectedMode(mode)
 *            if (mode === 'balanced') {
 *              loadQuestions('balanced')
 *            }
 *            // Focus mode will show subtest selector next
 *          }}
 *        />
 *      )
 *    }
 * 
 * 4. Show subtest selector for focus mode:
 *    if (selectedMode === 'focus' && !selectedSubtest) {
 *      return (
 *        <SubtestSelectorComponent 
 *          onSelect={(subtestCode) => {
 *            setSelectedSubtest(subtestCode)
 *            loadQuestions('focus', subtestCode)
 *          }}
 *          onBack={() => setSelectedMode(null)}
 *        />
 *      )
 *    }
 * 
 * 5. Update loadQuestions to accept mode and optional subtestCode:
 *    async function loadQuestions(mode: DailyChallengeMode, subtestCode?: string) {
 *      const response = await fetch('/api/daily-challenge/start', {
 *        method: 'POST',
 *        body: JSON.stringify({ mode, subtestCode })
 *      })
 *      // Handle response...
 *    }
 * 
 * 6. Update progress recording to include mode information
 */
