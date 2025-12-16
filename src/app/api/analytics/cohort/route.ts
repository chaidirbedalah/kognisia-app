// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
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

    // Verify user is a teacher
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Access denied: Teacher role required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classIds = searchParams.get('class_ids')?.split(',') || []
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Get teacher's classes
    const { data: teacherClasses, error: classesError } = await supabase
      .from('classes')
      .select('id, name')
      .eq('teacher_id', user.id)

    if (classesError) throw classesError

    const targetClassIds = classIds.length > 0 ? classIds : teacherClasses?.map(c => c.id) || []

    // Fetch cohort metrics for each class
    const cohortComparisons = await Promise.all(
      targetClassIds.map(async (classId) => {
        return await getCohortMetrics(supabase as any, classId, startDate, endDate)
      })
    )

    // Get topic distribution
    const topicDistribution = await getTopicDistribution(supabase as any, targetClassIds, startDate, endDate)

    // Get engagement analytics
    const engagementAnalytics = await getEngagementAnalytics(supabase as any, targetClassIds, startDate, endDate)

    // Generate insights
    const insights = generateCohortInsights(cohortComparisons)

    return NextResponse.json({
      success: true,
      cohort_comparison: {
        cohorts: cohortComparisons,
        comparison_period: {
          start: startDate || '30 days ago',
          end: endDate || 'today'
        },
        insights
      },
      topic_distribution: topicDistribution,
      engagement_analytics: engagementAnalytics
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch cohort analytics'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function getCohortMetrics(
  supabase: any, 
  classId: string, 
  startDate?: string | null, 
  endDate?: string | null
) {
  // Get students in class
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('class_id', classId)

  // @ts-ignore
  const studentIds = enrollments?.map(e => e.student_id) || []
  
  if (studentIds.length === 0) {
    return {
      cohort_id: classId,
      cohort_name: `Class ${classId}`,
      total_students: 0,
      active_students: 0,
      avg_accuracy: 0,
      avg_questions_attempted: 0,
      avg_time_spent: 0,
      engagement_rate: 0,
      improvement_rate: 0,
      struggling_students: 0,
      top_performers: 0,
      median_accuracy: 0,
      distribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
    }
  }

  // Build date filter
  let dateFilter = ''
  if (startDate && endDate) {
    dateFilter = `created_at.gte.${startDate}&created_at.lte.${endDate}`
  }

  // Get student progress data
  const { data: progressData } = await supabase
    .from('student_progress')
    .select(`
      student_id,
      is_correct,
      time_spent_seconds,
      created_at,
      question_id
    `)
    .in('student_id', studentIds)
    .or(dateFilter)

  // Get question metadata
  const questionIds = progressData?.map(p => p.question_id).filter(Boolean) || []
  const { data: questionData } = await supabase
    .from('question_bank')
    .select('id, subtest_utbk, topic_id')
    .in('id', questionIds)

  const questionMap = new Map()
  questionData?.forEach(q => questionMap.set(q.id, q))

  // Calculate metrics for each student
  const studentMetrics = studentIds.map(studentId => {
    const studentProgress = progressData?.filter(p => p.student_id === studentId) || []
    
    if (studentProgress.length === 0) {
      return {
        student_id: studentId,
        accuracy: 0,
        questions_attempted: 0,
        time_spent: 0,
        active: false
      }
    }

    const correct = studentProgress.filter(p => p.is_correct).length
    const total = studentProgress.length
    const accuracy = total > 0 ? (correct / total) * 100 : 0
    const timeSpent = studentProgress.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0)

    return {
      student_id: studentId,
      accuracy,
      questions_attempted: total,
      time_spent: timeSpent,
      active: total >= 10 // Active if attempted at least 10 questions
    }
  })

  // Calculate cohort metrics
  const activeStudents = studentMetrics.filter(s => s.active).length
  const accuracies = studentMetrics.map(s => s.accuracy).sort((a, b) => a - b)
  const medianAccuracy = accuracies.length > 0 ? accuracies[Math.floor(accuracies.length / 2)] : 0

  const distribution = {
    excellent: studentMetrics.filter(s => s.accuracy > 80).length,
    good: studentMetrics.filter(s => s.accuracy >= 60 && s.accuracy <= 80).length,
    fair: studentMetrics.filter(s => s.accuracy >= 40 && s.accuracy < 60).length,
    poor: studentMetrics.filter(s => s.accuracy < 40).length
  }

  const strugglingStudents = studentMetrics.filter(s => s.accuracy < 50).length
  const topPerformers = studentMetrics.filter(s => s.accuracy > 80).length

  return {
    cohort_id: classId,
    cohort_name: `Class ${classId}`, // You might want to get actual class name
    total_students: studentIds.length,
    active_students: activeStudents,
    avg_accuracy: studentMetrics.reduce((sum, s) => sum + s.accuracy, 0) / studentMetrics.length,
    avg_questions_attempted: studentMetrics.reduce((sum, s) => sum + s.questions_attempted, 0) / studentMetrics.length,
    avg_time_spent: studentMetrics.reduce((sum, s) => sum + s.time_spent, 0) / studentMetrics.length,
    engagement_rate: (activeStudents / studentIds.length) * 100,
    improvement_rate: 0, // This would require historical comparison
    struggling_students: strugglingStudents,
    top_performers: topPerformers,
    median_accuracy: medianAccuracy,
    distribution
  }
}

async function getTopicDistribution(
  supabase: ReturnType<typeof createClient>, 
  classIds: string[], 
  startDate?: string | null, 
  endDate?: string | null
) {
  // Get students in these classes
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id')
    .in('class_id', classIds)

  const studentIds = enrollments?.map(e => e.student_id) || []
  
  if (studentIds.length === 0) return []

  // Build date filter
  let dateFilter = ''
  if (startDate && endDate) {
    dateFilter = `created_at.gte.${startDate}&created_at.lte.${endDate}`
  }

  // Get progress data with question metadata
  const { data: progressData } = await supabase
    .from('student_progress')
    .select(`
      student_id,
      is_correct,
      question_id
    `)
    .in('student_id', studentIds)
    .or(dateFilter)

  const questionIds = progressData?.map(p => p.question_id).filter(Boolean) || []
  
  if (questionIds.length === 0) return []

  const { data: questionData } = await supabase
    .from('question_bank')
    .select(`
      id,
      subtest_utbk,
      topic_id
    `)
    .in('id', questionIds)

  // Get topic names
  const topicIds = questionData?.map(q => q.topic_id).filter(Boolean) || []
  const { data: topicsData } = await supabase
    .from('topics')
    .select('id, name')
    .in('id', topicIds)

  const topicNameMap = new Map()
  topicsData?.forEach(t => topicNameMap.set(t.id, t.name))

  // Group by topic
  const topicMap = new Map()
  
  progressData?.forEach(p => {
    const question = questionData?.find(q => q.id === p.question_id)
    if (!question) return

    const topicId = question.topic_id
    const topicName = topicNameMap.get(topicId) || 'Unknown'
    const subtest = question.subtest_utbk

    if (!topicMap.has(topicId)) {
      topicMap.set(topicId, {
        topic_name: topicName,
        subtest_code: subtest,
        students: [],
        total_questions: 0,
        correct_answers: 0
      })
    }

    const topic = topicMap.get(topicId)
    topic.total_questions++
    if (p.is_correct) topic.correct_answers++
    topic.students.push(p.student_id)
  })

  // Convert to final format
  return Array.from(topicMap.values()).map(topic => {
    const uniqueStudents = [...new Set(topic.students)]
    const accuracy = topic.total_questions > 0 ? (topic.correct_answers / topic.total_questions) * 100 : 0

    const studentAccuracies = uniqueStudents.map(studentId => {
      const studentQuestions = topic.students.filter(s => s === studentId)
      const topicIndex = Array.from(topicMap.values()).indexOf(topic)
      const topicId = Array.from(topicMap.keys())[topicIndex]
      const studentCorrect = studentQuestions.filter((_q, _index) => 
        progressData?.find(p => p.student_id === studentId && p.question_id === questionData?.find(q => q.topic_id === topicId)?.id && p.is_correct)
      ).length
      const studentTotal = studentQuestions.length
      return studentTotal > 0 ? (studentCorrect / studentTotal) * 100 : 0
    })

    return {
      topic_name: topic.topic_name,
      subtest_code: topic.subtest_code,
      total_questions: topic.total_questions,
      correct_answers: topic.correct_answers,
      accuracy,
      student_distribution: {
        excellent: studentAccuracies.filter(a => a > 80).length,
        good: studentAccuracies.filter(a => a >= 60 && a <= 80).length,
        fair: studentAccuracies.filter(a => a >= 40 && a < 60).length,
        poor: studentAccuracies.filter(a => a < 40).length
      },
      struggling_students: uniqueStudents.filter((_, index) => studentAccuracies[index] < 50),
      recommendations: generateTopicRecommendations(accuracy, topic.total_questions)
    }
  })
}

async function getEngagementAnalytics(
  supabase: ReturnType<typeof createClient>, 
  classIds: string[], 
  startDate?: string | null, 
  endDate?: string | null
) {
  // Similar implementation for daily activity, weekly summary, and consistency metrics
  // This is a simplified version - full implementation would be more complex

  return classIds.map(classId => ({
    cohort_id: classId,
    daily_activity: [], // Would need to query daily activity data
    weekly_summary: {
      week: 'Current Week',
      total_activity: 0,
      avg_daily_engagement: 0,
      peak_activity_day: 'Monday'
    },
    consistency_metrics: {
      streak_active_students: 0,
      daily_regular_students: 0,
      occasional_students: 0
    }
  }))
}

function generateCohortInsights(cohorts: CohortData[]) {
  if (cohorts.length === 0) return {}

  const bestPerforming = cohorts.reduce((best, current) => 
    current.avg_accuracy > best.avg_accuracy ? current : best
  )

  const mostImproved = cohorts.reduce((best, current) => 
    current.improvement_rate > best.improvement_rate ? current : best
  )

  const highestEngagement = cohorts.reduce((best, current) => 
    current.engagement_rate > best.engagement_rate ? current : best
  )

  const needsAttention = cohorts.find(c => c.struggling_students / c.total_students > 0.3)

  return {
    best_performing_cohort: bestPerforming.cohort_name,
    most_improved_cohort: mostImproved.cohort_name,
    highest_engagement: highestEngagement.cohort_name,
    needs_attention: needsAttention?.cohort_name || 'None'
  }
}

function generateTopicRecommendations(accuracy: number, totalQuestions: number) {
  const recommendations = []

  if (accuracy < 40) {
    recommendations.push('Perlu remedial intensif pada topik ini')
    recommendations.push('Rekomendasikan video pembelajaran tambahan')
  } else if (accuracy < 60) {
    recommendations.push('Berikan latihan tambahan untuk topik ini')
    recommendations.push('Fokus pada pemahaman konsep dasar')
  } else if (accuracy < 80) {
    recommendations.push('Lanjutkan latihan untuk mempertahankan level')
    recommendations.push('Tantangkan dengan soal yang lebih sulit')
  } else {
    recommendations.push('Topik sudah dikuasai dengan baik')
    recommendations.push('Dapat digunakan sebagai tutor sebaya untuk topik ini')
  }

  if (totalQuestions < 10) {
    recommendations.push('Kumpulkan lebih banyak data untuk analisis akurat')
  }

  return recommendations
}