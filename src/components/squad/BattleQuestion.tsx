'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import type { SquadBattleQuestion } from '@/lib/squad-types'
import { getDifficultyLabel, isValidDifficulty } from '@/lib/squad-types'

interface BattleQuestionProps {
  question: SquadBattleQuestion
  selectedAnswer: string | null
  onAnswerSelect: (questionId: string, answer: string) => void
  questionNumber: number
  totalQuestions: number
}

export function BattleQuestion({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionNumber,
  totalQuestions
}: BattleQuestionProps) {
  if (!question.question) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Question data not available
        </CardContent>
      </Card>
    )
  }

  const q = question.question
  const options = [
    { label: 'A', text: q.option_a },
    { label: 'B', text: q.option_b },
    { label: 'C', text: q.option_c },
    { label: 'D', text: q.option_d },
    { label: 'E', text: q.option_e },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2">
            <Badge variant="secondary">
              {getDifficultyLabel(isValidDifficulty(q.difficulty) ? q.difficulty : 'medium')}
            </Badge>
            <Badge variant="outline">{q.subtest_utbk}</Badge>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Question {questionNumber} of {totalQuestions}
        </div>
        <CardTitle className="text-lg leading-relaxed">
          {q.question_text}
        </CardTitle>
        {q.question_image_url && (
          <div className="mt-4">
            <Image 
              src={q.question_image_url} 
              alt="Question illustration"
              width={800}
              height={600}
              className="max-w-full h-auto rounded-lg object-contain"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option) => (
          <button
            key={option.label}
            onClick={() => onAnswerSelect(question.question_id, option.label)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedAnswer === option.label
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="font-semibold text-purple-600">{option.label}.</span>{' '}
            <span className="text-gray-900">{option.text}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
