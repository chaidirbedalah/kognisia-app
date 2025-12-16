import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEventChallenge } from '@/hooks/useEventChallenge';

// Mock fetch
global.fetch = vi.fn();

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    session: {
      access_token: 'test-token'
    }
  })
}));

describe('useEventChallenge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useEventChallenge());

    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.eventStats).toEqual({
      total_points: 0,
      challenges_completed: 0
    });
  });

  it('fetches events on mount', async () => {
    const mockEvents = [
      {
        id: 'event-1',
        name: 'Test Event',
        description: 'Test Description',
        icon: '🧪',
        start_date: '2025-12-16T00:00:00Z',
        end_date: '2025-12-23T23:59:59Z',
        bonus_multiplier: 2.0,
        status: 'active',
        event_challenges: [],
        isJoined: false,
        userStats: {
          total_points: 0,
          challenges_completed: 0
        },
        userProgress: {}
      }
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockEvents })
    });

    const { result } = renderHook(() => useEventChallenge());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.loading).toBe(false);
  });

  it('handles fetch error', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useEventChallenge());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });

  it('joins event successfully', async () => {
    const mockEvent = {
      id: 'event-1',
      name: 'Test Event',
      description: 'Test Description',
      icon: '🧪',
      start_date: '2025-12-16T00:00:00Z',
      end_date: '2025-12-23T23:59:59Z',
      bonus_multiplier: 2.0,
      status: 'active',
      event_challenges: [],
      isJoined: false,
      userStats: {
        total_points: 0,
        challenges_completed: 0
      },
      userProgress: {}
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [mockEvent] })
    });

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    const { result } = renderHook(() => useEventChallenge());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.joinEvent('event-1');
    });

    expect(result.current.events[0].isJoined).toBe(true);
  });

  it('completes challenge successfully', async () => {
    const mockEvent = {
      id: 'event-1',
      name: 'Test Event',
      description: 'Test Description',
      icon: '🧪',
      start_date: '2025-12-16T00:00:00Z',
      end_date: '2025-12-23T23:59:59Z',
      bonus_multiplier: 2.0,
      status: 'active',
      event_challenges: [
        {
          id: 'challenge-1',
          challenge_code: 'TEST_1',
          description: 'Test challenge',
          points: 100,
          difficulty: 'easy',
          icon: '🧪'
        }
      ],
      isJoined: true,
      userStats: {
        total_points: 0,
        challenges_completed: 0
      },
      userProgress: {}
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [mockEvent] })
    });

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pointsEarned: 100 })
    });

    const { result } = renderHook(() => useEventChallenge());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.completeChallenge('event-1', 'challenge-1');
    });

    expect(result.current.eventStats.total_points).toBe(100);
    expect(result.current.eventStats.challenges_completed).toBe(1);
  });

  it('gets event progress', async () => {
    const mockProgress = [
      {
        id: 'progress-1',
        challenge_id: 'challenge-1',
        completed_at: '2025-12-16T10:00:00Z',
        points_earned: 100,
        event_challenges: {
          id: 'challenge-1',
          challenge_code: 'TEST_1',
          description: 'Test challenge',
          points: 100,
          difficulty: 'easy',
          icon: '🧪'
        }
      }
    ];

    const mockStats = {
      total_points: 100,
      challenges_completed: 1
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [] })
    });

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        progress: mockProgress,
        stats: mockStats
      })
    });

    const { result } = renderHook(() => useEventChallenge());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.getEventProgress('event-1');
    });

    expect(result.current.eventProgress).toEqual(mockProgress);
    expect(result.current.eventStats).toEqual(mockStats);
  });
});