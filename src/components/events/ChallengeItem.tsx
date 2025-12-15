'use client';

import React from 'react';

interface ChallengeItemProps {
  id: string;
  challenge_code: string;
  description: string;
  points: number;
  difficulty: string;
  icon?: string;
  isCompleted: boolean;
  pointsEarned?: number;
  onComplete: () => void;
}

export function ChallengeItem({
  challenge_code,
  description,
  points,
  difficulty,
  icon,
  isCompleted,
  pointsEarned,
  onComplete
}: ChallengeItemProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        isCompleted
          ? 'bg-green-50 border-green-300'
          : `${getDifficultyColor(difficulty)} border-opacity-50`
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <div>
              <h4 className="font-bold text-gray-900">{challenge_code}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(difficulty)}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="text-sm font-bold text-gray-700">
              {isCompleted ? (
                <span className="text-green-600">✓ {pointsEarned} poin</span>
              ) : (
                <span>{points} poin</span>
              )}
            </span>
          </div>
        </div>

        {!isCompleted && (
          <button
            onClick={onComplete}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors whitespace-nowrap"
          >
            Selesaikan
          </button>
        )}

        {isCompleted && (
          <div className="ml-4 text-green-600 text-2xl">✓</div>
        )}
      </div>
    </div>
  );
}
