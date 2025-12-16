import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Generate questions based on session type
    let questions: Array<{
      id: string
      question_text: string
      options: string[]
      correct_answer: string
      subtest_code: string
      topic_name: string
      difficulty_level: 'easy' | 'medium' | 'hard'
    }> = []
    const assessmentId = `adaptive_${Date.now()}`

    if (sessionId === 'remedial-session') {
      // Get weak topics from user's progress
      const { data: progressData } = await supabase
        .from('student_progress')
        .select(`
          question_id,
          is_correct,
          questions:question_id (
            subtest_utbk,
            topic_id
          )
        `)
        .eq('student_id', user.id)

      if (progressData && progressData.length > 0) {
        // Get topics data
        const questionIds = progressData.map(p => p.question_id).filter(Boolean)
        const { data: questionBank } = await supabase
          .from('question_bank')
          .select('id, subtest_utbk, topic_id')
          .in('id', questionIds)

        const { data: topicsData } = await supabase
          .from('topics')
          .select('id, name')

        const topicNameMap = new Map()
        topicsData?.forEach(t => topicNameMap.set(t.id, t.name))

        // Identify weak topics (accuracy < 50%)
        const topicPerformance = new Map()
        
        progressData.forEach(p => {
          const question = questionBank?.find(q => q.id === p.question_id)
          if (!question) return

          const topicId = question.topic_id
          if (!topicPerformance.has(topicId)) {
            topicPerformance.set(topicId, { correct: 0, total: 0 })
          }
          
          const perf = topicPerformance.get(topicId)
          perf.total++
          if (p.is_correct) perf.correct++
        })

        const weakTopics = Array.from(topicPerformance.entries())
          .filter(([, perf]) => perf.total >= 3 && (perf.correct / perf.total) < 0.5)
          .map(([topicId]) => topicId)

        // Get questions from weak topics
        if (weakTopics.length > 0) {
          const { data: remedialQuestions } = await supabase
            .from('question_bank')
            .select('*')
            .in('topic_id', weakTopics.slice(0, 3)) // Limit to 3 weak topics
            .limit(15) // 15 questions for remedial session

          questions = remedialQuestions?.map(q => ({
            id: q.id,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            subtest_code: q.subtest_utbk,
            topic_name: topicNameMap.get(q.topic_id) || 'Unknown',
            difficulty_level: 'easy'
          })) || []
        }
      }
    } else if (sessionId === 'practice-session') {
      // Get weakest subtest and generate practice questions
      const { data: subtestData } = await supabase
        .from('student_progress')
        .select(`
          question_id,
          is_correct,
          questions:question_id (
            subtest_utbk
          )
        `)
        .eq('student_id', user.id)

      if (subtestData && subtestData.length > 0) {
        const subtestPerformance = new Map()
        
        subtestData.forEach(p => {
          const questionData = subtestData.find(q => q.question_id === p.question_id)?.questions as { subtest_utbk?: string } | undefined
          if (!questionData || !questionData.subtest_utbk) return

          const subtest = questionData.subtest_utbk
          if (!subtestPerformance.has(subtest)) {
            subtestPerformance.set(subtest, { correct: 0, total: 0 })
          }
          
          const perf = subtestPerformance.get(subtest)
          perf.total++
          if (p.is_correct) perf.correct++
        })

        const weakestSubtest = Array.from(subtestPerformance.entries())
          .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0]?.[0]

        if (weakestSubtest) {
          const { data: practiceQuestions } = await supabase
            .from('question_bank')
            .select('*')
            .eq('subtest_utbk', weakestSubtest)
            .limit(10)

          questions = practiceQuestions?.map(q => ({
            id: q.id,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            subtest_code: q.subtest_utbk,
            topic_name: 'Practice',
            difficulty_level: 'medium'
          })) || []
        }
      }
    } else if (sessionId === 'challenge-session') {
      // Get strongest areas and generate challenging questions
      const { data: strongData } = await supabase
        .from('student_progress')
        .select(`
          question_id,
          is_correct,
          questions:question_id (
            subtest_utbk
          )
        `)
        .eq('student_id', user.id)

      if (strongData && strongData.length > 0) {
        const subtestPerformance = new Map()
        
        strongData.forEach(p => {
          const questionData = strongData.find(q => q.question_id === p.question_id)?.questions as { subtest_utbk?: string } | undefined
          if (!questionData || !questionData.subtest_utbk) return

          const subtest = questionData.subtest_utbk
          if (!subtestPerformance.has(subtest)) {
            subtestPerformance.set(subtest, { correct: 0, total: 0 })
          }
          
          const perf = subtestPerformance.get(subtest)
          perf.total++
          if (p.is_correct) perf.correct++
        })

        const strongestSubtest = Array.from(subtestPerformance.entries())
          .filter(([, perf]) => perf.total >= 10)
          .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))[0]?.[0]

        if (strongestSubtest) {
          const { data: challengeQuestions } = await supabase
            .from('question_bank')
            .select('*')
            .eq('subtest_utbk', strongestSubtest)
            .order('id', { ascending: false }) // Get newer/harder questions
            .limit(10)

          questions = challengeQuestions?.map(q => ({
            id: q.id,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            subtest_code: q.subtest_utbk,
            topic_name: 'Challenge',
            difficulty_level: 'hard'
          })) || []
        }
      }
    }

    if (questions.length === 0) {
      // Fallback: get random questions
      const { data: fallbackQuestions } = await supabase
        .from('question_bank')
        .select('*')
        .limit(10)

      questions = fallbackQuestions?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        subtest_code: q.subtest_utbk,
        topic_name: 'General',
        difficulty_level: 'medium'
      })) || []
    }

    // Create assessment record
    const { error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        id: assessmentId,
        user_id: user.id,
        type: 'adaptive_session',
        status: 'in_progress',
        metadata: {
          session_id: sessionId,
          question_count: questions.length
        }
      })

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError)
    }

    return NextResponse.json({
      success: true,
      session: {
        id: assessmentId,
        questions: questions,
        total_questions: questions.length,
        estimated_duration: Math.ceil(questions.length * 1.5)
      }
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to start adaptive session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}