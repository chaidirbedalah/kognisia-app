'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Challenge {
  id: string;
  challenge_code: string;
  description: string;
  points: number;
  difficulty: string;
  icon?: string;
}

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

interface EventProgress {
  id: string;
  challenge_id: string;
  completed_at: string;
  points_earned: number;
  event_challenges: Challenge;
}

interface UseEventHuntingReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  joinEvent: (eventId: string) => Promise<void>;
  completeChallenge: (eventId: string, challengeId: string) => Promise<void>;
  getEventProgress: (eventId: string) => Promise<void>;
  eventProgress: EventProgress[];
  eventStats: {
    total_points: number;
    challenges_completed: number;
  };
}

export function useEventHunting(): UseEventHuntingReturn {
  const { session } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventProgress, setEventProgress] = useState<EventProgress[]>([]);
  const [eventStats, setEventStats] = useState({
    total_points: 0,
    challenges_completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active events
  useEffect(() => {
    if (!session?.access_token) return;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/events/active', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [session?.access_token]);

  const joinEvent = async (eventId: string) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/events/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId })
      });

      if (!response.ok) {
        throw new Error('Failed to join event');
      }

      // Update local state
      setEvents(events.map(event =>
        event.id === eventId
          ? { ...event, isJoined: true }
          : event
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const completeChallenge = async (eventId: string, challengeId: string) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/events/complete-challenge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId, challengeId })
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      const data = await response.json();

      // Update local state
      setEvents(events.map(event =>
        event.id === eventId
          ? {
              ...event,
              userStats: {
                total_points: event.userStats.total_points + data.pointsEarned,
                challenges_completed: event.userStats.challenges_completed + 1
              },
              userProgress: {
                ...event.userProgress,
                [challengeId]: {
                  completed_at: new Date().toISOString(),
                  points_earned: data.pointsEarned
                }
              }
            }
          : event
      ));

      setEventStats({
        total_points: eventStats.total_points + data.pointsEarned,
        challenges_completed: eventStats.challenges_completed + 1
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const getEventProgress = async (eventId: string) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`/api/events/progress?eventId=${eventId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      setEventProgress(data.progress || []);
      setEventStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    joinEvent,
    completeChallenge,
    getEventProgress,
    eventProgress,
    eventStats
  };
}
