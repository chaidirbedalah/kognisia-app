'use client';

import { useState } from 'react';
import { useEventChallenge } from '@/hooks/useEventChallenge';
import { EventCard } from '@/components/events/EventCard';
import { ChallengeItem } from '@/components/events/ChallengeItem';

interface Event {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  start_date: string;
  end_date: string;
  bonus_multiplier: number;
  status: string;
  event_challenges: Challenge[];
  isJoined: boolean;
  userStats: {
    total_points: number;
    challenges_completed: number;
  };
  userProgress: Record<string, { completed_at?: string; points_earned?: number }>;
}

interface Challenge {
  id: string;
  challenge_code: string;
  description: string;
  points: number;
  difficulty: string;
  icon?: string;
}

export default function EventsPage() {
  const {
    events,
    loading,
    error,
    joinEvent,
    completeChallenge,
    getEventProgress,
    eventStats
  } = useEventChallenge();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = events.find((e: Event) => e.id === selectedEventId);

  const handleJoinEvent = async (eventId: string) => {
    try {
      await joinEvent(eventId);
      setSelectedEventId(eventId);
      await getEventProgress(eventId);
    } catch (err) {
      console.error('Failed to join event:', err);
    } finally {
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!selectedEventId) return;

    try {
      await completeChallenge(selectedEventId, challengeId);
      await getEventProgress(selectedEventId);
    } catch (err) {
      console.error('Failed to complete challenge:', err);
    } finally {
    }
  };

  const handleViewDetails = async (eventId: string) => {
    setSelectedEventId(eventId);
    await getEventProgress(eventId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Memuat event...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h1 className="text-4xl font-bold tracking-tight mb-2">🏆 Event Challenge</h1>
            <p className="text-blue-100">Ikuti tantangan spesial dan dapatkan poin bonus! Nikmati pengalaman belajar yang lebih menyenangkan dengan berbagai event challenge yang menarik.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded">
            {error}
          </div>
        )}

        {selectedEvent ? (
          // Event Detail View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <button
                onClick={() => setSelectedEventId(null)}
                className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← Kembali ke Daftar Event
              </button>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  {selectedEvent.icon && (
                    <span className="text-5xl">{selectedEvent.icon}</span>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {selectedEvent.name}
                    </h2>
                    {selectedEvent.description && (
                      <p className="text-gray-600 mt-2">{selectedEvent.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedEvent.event_challenges.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Tantangan</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {eventStats.challenges_completed}
                    </p>
                    <p className="text-sm text-gray-600">Tantangan Selesai</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {eventStats.total_points}
                    </p>
                    <p className="text-sm text-gray-600">Poin Event</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                      style={{
                        width: `${(eventStats.challenges_completed / selectedEvent.event_challenges.length) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {eventStats.challenges_completed} dari {selectedEvent.event_challenges.length} tantangan event selesai
                  </p>
                </div>
              </div>

              {/* Challenges */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Daftar Tantangan Event</h3>
                {selectedEvent.event_challenges.map((challenge: Challenge) => {
                  const isCompleted = !!selectedEvent.userProgress[challenge.id];
                  const pointsEarned = selectedEvent.userProgress[challenge.id]?.points_earned;

                  return (
                    <ChallengeItem
                      key={challenge.id}
                      id={challenge.id}
                      challenge_code={challenge.challenge_code}
                      description={challenge.description}
                      points={challenge.points}
                      difficulty={challenge.difficulty}
                      icon={challenge.icon}
                      isCompleted={isCompleted}
                      pointsEarned={pointsEarned}
                      onComplete={() => handleCompleteChallenge(challenge.id)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Info Event</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Bonus Multiplier</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedEvent.bonus_multiplier}x
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-bold text-green-600">
                      {selectedEvent.isJoined ? '✓ Sudah Ikut' : 'Belum Ikut'}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Pencapaian</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Poin</span>
                        <span className="font-bold text-purple-600">
                          {eventStats.total_points}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Tantangan Selesai</span>
                        <span className="font-bold text-green-600">
                          {eventStats.challenges_completed}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Events List View
          <div>
            {events.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">Tidak ada event aktif saat ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event: Event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    description={event.description}
                    icon={event.icon}
                    start_date={event.start_date}
                    end_date={event.end_date}
                    bonus_multiplier={event.bonus_multiplier}
                    challenges={event.event_challenges}
                    isJoined={event.isJoined}
                    userStats={event.userStats}
                    onJoin={() => handleJoinEvent(event.id)}
                    onViewDetails={() => handleViewDetails(event.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
