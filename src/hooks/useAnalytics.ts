'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UserMetrics {
  total_battles: number;
  total_achievements: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  engagement_score: number;
}

interface EngagementTrendItem {
  date: string;
  activeUsers: number;
  battles: number;
  achievements: number;
}

interface AchievementStat {
  id: string;
  achievement_id: string;
  total_unlocks: number;
  unlock_percentage: number;
  average_unlock_time_days?: number;
  last_unlocked_at?: string;
  isUnlocked: boolean;
  achievements: {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    rarity: string;
  };
}

interface SeasonalPerformance {
  id: string;
  season_id: string;
  battles_completed: number;
  achievements_unlocked: number;
  total_points: number;
  rank: number;
  performance_score: number;
  seasons: {
    id: string;
    name: string;
    theme: string;
    start_date: string;
    end_date: string;
  };
}

interface StreakStats {
  current_streak: number;
  longest_streak: number;
  total_days_active: number;
}

interface AchievementTimelineItem {
  date: string;
  achievement: {
    id: string;
    name: string;
    icon: string;
    points: number;
    rarity: string;
  };
  points: number;
}

interface PointsTimelineItem {
  date: string;
  cumulativePoints: number;
}

interface Trends {
  totalSeasons: number;
  averagePerformanceScore: number;
  bestRank: number | null;
  totalAchievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
}

interface UseAnalyticsReturn {
  // Achievement Analytics
  achievementStats: AchievementStat[];
  totalAchievements: number;
  userUnlocked: number;
  averageUnlockPercentage: number;

  // Engagement Analytics
  userMetrics: UserMetrics;
  engagementTrend: EngagementTrendItem[];
  recentActivity: any[];

  // Trend Analytics
  seasonalPerformance: SeasonalPerformance[];
  streakStats: StreakStats;
  achievementTimeline: AchievementTimelineItem[];
  pointsTimeline: PointsTimelineItem[];
  trends: Trends;

  // State
  loading: boolean;
  error: string | null;
}

export function useAnalytics(): UseAnalyticsReturn {
  const { session } = useAuth();
  const [achievementStats, setAchievementStats] = useState<AchievementStat[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    total_battles: 0,
    total_achievements: 0,
    current_streak: 0,
    longest_streak: 0,
    total_points: 0,
    engagement_score: 0
  });
  const [engagementTrend, setEngagementTrend] = useState<EngagementTrendItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [seasonalPerformance, setSeasonalPerformance] = useState<SeasonalPerformance[]>([]);
  const [streakStats, setStreakStats] = useState<StreakStats>({
    current_streak: 0,
    longest_streak: 0,
    total_days_active: 0
  });
  const [achievementTimeline, setAchievementTimeline] = useState<AchievementTimelineItem[]>([]);
  const [pointsTimeline, setPointsTimeline] = useState<PointsTimelineItem[]>([]);
  const [trends, setTrends] = useState<Trends>({
    totalSeasons: 0,
    averagePerformanceScore: 0,
    bestRank: null,
    totalAchievementsUnlocked: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [userUnlocked, setUserUnlocked] = useState(0);
  const [averageUnlockPercentage, setAverageUnlockPercentage] = useState(0);

  // Fetch all analytics data
  useEffect(() => {
    if (!session?.access_token) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch achievement analytics
        const achievementsRes = await fetch('/api/analytics/achievements', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (achievementsRes.ok) {
          const achievementsData = await achievementsRes.json();
          setAchievementStats(achievementsData.stats);
          setTotalAchievements(achievementsData.totalStats.totalAchievements);
          setUserUnlocked(achievementsData.totalStats.userUnlocked);
          setAverageUnlockPercentage(parseFloat(achievementsData.totalStats.averageUnlockPercentage));
        }

        // Fetch engagement analytics
        const engagementRes = await fetch('/api/analytics/engagement', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (engagementRes.ok) {
          const engagementData = await engagementRes.json();
          setUserMetrics(engagementData.userMetrics);
          setEngagementTrend(engagementData.engagementTrend);
          setRecentActivity(engagementData.recentActivity);
        }

        // Fetch trend analytics
        const trendsRes = await fetch('/api/analytics/trends', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          setSeasonalPerformance(trendsData.seasonalPerformance);
          setStreakStats(trendsData.streakStats);
          setAchievementTimeline(trendsData.achievementTimeline);
          setPointsTimeline(trendsData.pointsTimeline);
          setTrends(trendsData.trends);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session?.access_token]);

  return {
    achievementStats,
    totalAchievements,
    userUnlocked,
    averageUnlockPercentage,
    userMetrics,
    engagementTrend,
    recentActivity,
    seasonalPerformance,
    streakStats,
    achievementTimeline,
    pointsTimeline,
    trends,
    loading,
    error
  };
}
