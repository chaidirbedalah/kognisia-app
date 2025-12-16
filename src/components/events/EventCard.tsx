'use client';

import React from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Challenge {
  id: string;
  challenge_code: string;
  description: string;
  points: number;
  difficulty: string;
  icon?: string;
}

interface EventCardProps {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  start_date: string;
  end_date: string;
  bonus_multiplier: number;
  challenges: Challenge[];
  isJoined: boolean;
  userStats: {
    total_points: number;
    challenges_completed: number;
  };
  onJoin: () => void;
  onViewDetails: () => void;
}

export function EventCard({
  name,
  description,
  icon,
  end_date,
  bonus_multiplier,
  challenges,
  isJoined,
  userStats,
  onJoin,
  onViewDetails
}: EventCardProps) {

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <span className="text-3xl">{icon}</span>}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {bonus_multiplier}x
          </div>
          <p className="text-xs text-gray-500">Bonus</p>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          Berakhir pada <span className="font-bold text-red-600">{format(new Date(end_date), 'dd MMMM yyyy', { locale: idLocale })}</span>
        </p>
      </div>

      {isJoined && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Poin: {userStats.total_points}
              </p>
              <p className="text-xs text-blue-700">
                {userStats.challenges_completed} / {challenges.length} tantangan
              </p>
            </div>
            <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: `${(userStats.challenges_completed / challenges.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

        <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Tantangan Event:</p>
        <div className="flex flex-wrap gap-2">
          {challenges.slice(0, 3).map((challenge: Challenge) => (
            <span
              key={challenge.id}
              className={`text-xs px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)}`}
            >
              {challenge.challenge_code}
            </span>
          ))}
          {challenges.length > 3 && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
              +{challenges.length - 3} lagi
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!isJoined ? (
          <button
            onClick={onJoin}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Gabung Event Challenge
          </button>
        ) : (
          <button
            onClick={onViewDetails}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Lihat Tantangan
          </button>
        )}
      </div>
    </div>
  );
}
