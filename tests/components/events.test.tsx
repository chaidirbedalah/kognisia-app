import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventCard } from '@/components/events/EventCard';
import { ChallengeItem } from '@/components/events/ChallengeItem';
import { EventTemplateManager } from '@/components/events/EventTemplateManager';
import { EventAnalytics } from '@/components/events/EventAnalytics';

// Mock data
const mockEvent = {
  id: 'test-event-1',
  name: 'Test Event Challenge',
  description: 'Test event untuk unit testing',
  icon: '🧪',
  start_date: '2025-12-16T00:00:00Z',
  end_date: '2025-12-23T23:59:59Z',
  bonus_multiplier: 2.0,
  status: 'active',
  event_challenges: [
    {
      id: 'challenge-1',
      challenge_code: 'TEST_1',
      description: 'Test challenge pertama',
      points: 100,
      difficulty: 'easy',
      icon: '🧪'
    },
    {
      id: 'challenge-2',
      challenge_code: 'TEST_2',
      description: 'Test challenge kedua',
      points: 200,
      difficulty: 'medium',
      icon: '🧪'
    }
  ],
  isJoined: true,
  userStats: {
    total_points: 150,
    challenges_completed: 1
  }
};

const mockChallenge = {
  id: 'challenge-1',
  challenge_code: 'TEST_1',
  description: 'Test challenge pertama',
  points: 100,
  difficulty: 'easy',
  icon: '🧪',
  isCompleted: false,
  pointsEarned: undefined,
  onComplete: vi.fn()
};

describe('Event Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EventCard', () => {
    it('renders event information correctly', () => {
      const onJoin = vi.fn();
      const onViewDetails = vi.fn();

      render(
        <EventCard
          {...mockEvent}
          onJoin={onJoin}
          onViewDetails={onViewDetails}
        />
      );

      expect(screen.getByText('Test Event Challenge')).toBeInTheDocument();
      expect(screen.getByText('Test event untuk unit testing')).toBeInTheDocument();
      expect(screen.getByText('2.0x')).toBeInTheDocument();
    });

    it('shows join button when not joined', () => {
      const onJoin = vi.fn();
      const onViewDetails = vi.fn();

      render(
        <EventCard
          {...mockEvent}
          isJoined={false}
          onJoin={onJoin}
          onViewDetails={onViewDetails}
        />
      );

      expect(screen.getByText('Gabung Event Challenge')).toBeInTheDocument();
      expect(screen.queryByText('Lihat Tantangan')).not.toBeInTheDocument();
    });

    it('shows view details button when joined', () => {
      const onJoin = vi.fn();
      const onViewDetails = vi.fn();

      render(
        <EventCard
          {...mockEvent}
          isJoined={true}
          onJoin={onJoin}
          onViewDetails={onViewDetails}
        />
      );

      expect(screen.getByText('Lihat Tantangan')).toBeInTheDocument();
      expect(screen.queryByText('Gabung Event Challenge')).not.toBeInTheDocument();
    });

    it('displays user progress when joined', () => {
      const onJoin = vi.fn();
      const onViewDetails = vi.fn();

      render(
        <EventCard
          {...mockEvent}
          isJoined={true}
          onJoin={onJoin}
          onViewDetails={onViewDetails}
        />
      );

      expect(screen.getByText('Poin: 150')).toBeInTheDocument();
      expect(screen.getByText('1 / 2 tantangan')).toBeInTheDocument();
    });

    it('calls onJoin when join button is clicked', async () => {
      const onJoin = vi.fn();
      const onViewDetails = vi.fn();

      render(
        <EventCard
          {...mockEvent}
          isJoined={false}
          onJoin={onJoin}
          onViewDetails={onViewDetails}
        />
      );

      const joinButton = screen.getByText('Gabung Event Challenge');
      await fireEvent.click(joinButton);

      expect(onJoin).toHaveBeenCalledTimes(1);
    });
  });

  describe('ChallengeItem', () => {
    it('renders challenge information correctly', () => {
      render(<ChallengeItem {...mockChallenge} />);

      expect(screen.getByText('TEST_1')).toBeInTheDocument();
      expect(screen.getByText('Test challenge pertama')).toBeInTheDocument();
      expect(screen.getByText('100 poin')).toBeInTheDocument();
      expect(screen.getByText('Easy')).toBeInTheDocument();
    });

    it('shows complete button when not completed', () => {
      render(<ChallengeItem {...mockChallenge} isCompleted={false} />);

      expect(screen.getByText('Selesaikan Tantangan')).toBeInTheDocument();
      expect(screen.queryByText('✓ 100 poin')).not.toBeInTheDocument();
    });

    it('shows completed state when completed', () => {
      render(
        <ChallengeItem 
          {...mockChallenge} 
          isCompleted={true} 
          pointsEarned={100}
        />
      );

      expect(screen.getByText('✓ 100 poin')).toBeInTheDocument();
      expect(screen.queryByText('Selesaikan Tantangan')).not.toBeInTheDocument();
    });

    it('calls onComplete when complete button is clicked', async () => {
      render(<ChallengeItem {...mockChallenge} isCompleted={false} />);

      const completeButton = screen.getByText('Selesaikan Tantangan');
      await fireEvent.click(completeButton);

      expect(mockChallenge.onComplete).toHaveBeenCalledTimes(1);
    });

    it('applies correct difficulty colors', () => {
      const { rerender } = render(<ChallengeItem {...mockChallenge} difficulty="easy" />);

      let difficultyBadge = screen.getByText('Easy');
      expect(difficultyBadge).toHaveClass('bg-green-100', 'text-green-800');

      rerender(<ChallengeItem {...mockChallenge} difficulty="hard" />);
      difficultyBadge = screen.getByText('Hard');
      expect(difficultyBadge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('EventTemplateManager', () => {
    it('renders template categories', () => {
      const onTemplateSelect = vi.fn();
      const onCreateEvent = vi.fn();

      render(
        <EventTemplateManager
          onTemplateSelect={onTemplateSelect}
          onCreateEvent={onCreateEvent}
        />
      );

      expect(screen.getByText('Template Event Challenge')).toBeInTheDocument();
      expect(screen.getByText('Mingguan')).toBeInTheDocument();
      expect(screen.getByText('Bulanan')).toBeInTheDocument();
      expect(screen.getByText('Musiman')).toBeInTheDocument();
      expect(screen.getByText('Spesial')).toBeInTheDocument();
    });

    it('filters templates by category', () => {
      const onTemplateSelect = vi.fn();
      const onCreateEvent = vi.fn();

      render(
        <EventTemplateManager
          onTemplateSelect={onTemplateSelect}
          onCreateEvent={onCreateEvent}
        />
      );

      // Click on weekly category
      const weeklyTab = screen.getByText('Mingguan');
      fireEvent.click(weeklyTab);

      // Should show weekly templates
      expect(screen.getByText('Weekly Challenge')).toBeInTheDocument();
    });

    it('shows template details when selected', () => {
      const onTemplateSelect = vi.fn();
      const onCreateEvent = vi.fn();

      render(
        <EventTemplateManager
          onTemplateSelect={onTemplateSelect}
          onCreateEvent={onCreateEvent}
        />
      );

      // Select first template
      const firstTemplate = screen.getByText('Weekly Challenge');
      fireEvent.click(firstTemplate);

      expect(screen.getByText('Template Dipilih: Weekly Challenge')).toBeInTheDocument();
      expect(screen.getByText('🚀 Buat Event dari Template')).toBeInTheDocument();
    });
  });

  describe('EventAnalytics', () => {
    const mockAnalytics = {
      eventId: 'test-event-1',
      eventName: 'Test Event Challenge',
      totalParticipants: 100,
      activeParticipants: 75,
      completedChallenges: 150,
      totalChallenges: 200,
      averageCompletionTime: 45,
      totalPointsAwarded: 5000,
      engagementRate: 75,
      completionRate: 75,
      dailyParticipation: [
        {
          date: '2025-12-16',
          participants: 20,
          completions: 15
        }
      ],
      challengeBreakdown: [
        {
          challengeCode: 'TEST_1',
          completed: 50,
          total: 100,
          completionRate: 50
        }
      ]
    };

    it('renders analytics metrics correctly', () => {
      render(<EventAnalytics {...mockAnalytics} />);

      expect(screen.getByText('Analytics Event: Test Event Challenge')).toBeInTheDocument();
      expect(screen.getByText('Total Peserta')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('75 aktif (75.0%)')).toBeInTheDocument();
    });

    it('displays completion rate', () => {
      render(<EventAnalytics {...mockAnalytics} />);

      expect(screen.getByText('75.0%')).toBeInTheDocument();
      expect(screen.getByText('150 dari 200 tantangan')).toBeInTheDocument();
    });

    it('shows engagement metrics', () => {
      render(<EventAnalytics {...mockAnalytics} />);

      expect(screen.getByText('75.0%')).toBeInTheDocument();
      expect(screen.getByText('75 dari 100 peserta aktif')).toBeInTheDocument();
    });

    it('displays challenge breakdown', () => {
      render(<EventAnalytics {...mockAnalytics} />);

      expect(screen.getByText('Analisis Tantangan per Kategori')).toBeInTheDocument();
      expect(screen.getByText('TEST_1')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('provides improvement suggestions', () => {
      render(<EventAnalytics {...mockAnalytics} />);

      // Should show positive suggestions for good performance
      expect(screen.getByText(/Performa event sangat baik!/)).toBeInTheDocument();
    });

    it('shows warnings for poor performance', () => {
      const poorPerformanceAnalytics = {
        ...mockAnalytics,
        completionRate: 30,
        engagementRate: 40
      };

      render(<EventAnalytics {...poorPerformanceAnalytics} />);

      expect(screen.getByText(/Tingkat penyelesaian rendah/)).toBeInTheDocument();
      expect(screen.getByText(/Tingkat keterlibatan rendah/)).toBeInTheDocument();
    });
  });
});