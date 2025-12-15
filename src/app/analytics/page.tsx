'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalytics } from '@/hooks/useAnalytics';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function AnalyticsPage() {
  const {
    achievementStats,
    totalAchievements,
    userUnlocked,
    averageUnlockPercentage,
    userMetrics,
    engagementTrend,
    seasonalPerformance,
    achievementTimeline,
    trends,
    loading,
    error
  } = useAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 rounded mb-2" />
            <Skeleton className="h-4 w-80 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                <Skeleton className="h-4 w-28 rounded mb-2" />
                <Skeleton className="h-8 w-24 rounded" />
                <Skeleton className="h-3 w-40 rounded mt-2" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <Skeleton className="h-7 w-56 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded">
                  <Skeleton className="h-4 w-32 rounded mb-2" />
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded" />
                    <div>
                      <Skeleton className="h-4 w-40 rounded mb-1" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 rounded mb-1" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <Skeleton className="h-7 w-56 rounded mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <Skeleton className="h-7 w-56 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded">
                  <Skeleton className="h-4 w-32 rounded mb-2" />
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Analytics</h1>
          <p className="text-gray-600">Lihat statistik dan insights performa Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Poin</p>
            <p className="text-3xl font-bold text-purple-600">{userMetrics.total_points}</p>
            <p className="text-xs text-gray-500 mt-2">Engagement Score: {userMetrics.engagement_score.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Pertandingan</p>
            <p className="text-3xl font-bold text-blue-600">{userMetrics.total_battles}</p>
            <p className="text-xs text-gray-500 mt-2">Total Selesai</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Pencapaian</p>
            <p className="text-3xl font-bold text-green-600">{userMetrics.total_achievements}</p>
            <p className="text-xs text-gray-500 mt-2">{userUnlocked} dari {totalAchievements}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Streak</p>
            <p className="text-3xl font-bold text-orange-600">{userMetrics.current_streak}</p>
            <p className="text-xs text-gray-500 mt-2">Terpanjang: {userMetrics.longest_streak}</p>
          </div>
        </div>

        {/* Achievement Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 Statistik Pencapaian</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-purple-50 rounded">
              <p className="text-sm text-gray-600">Total Pencapaian</p>
              <p className="text-2xl font-bold text-purple-600">{totalAchievements}</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Sudah Dibuka</p>
              <p className="text-2xl font-bold text-green-600">{userUnlocked}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Rata-rata Unlock %</p>
              <p className="text-2xl font-bold text-blue-600">{averageUnlockPercentage.toFixed(1)}%</p>
            </div>
          </div>

          {/* Top Achievements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Pencapaian Paling Populer</h3>
            <div className="space-y-2">
              {achievementStats.slice(0, 5).map(stat => (
                <div key={stat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.achievements.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{stat.achievements.name}</p>
                      <p className="text-xs text-gray-600">{stat.total_unlocks} pemain</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{stat.unlock_percentage.toFixed(1)}%</p>
                    {stat.isUnlocked && <p className="text-xs text-green-600">✓ Dibuka</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Trends */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 Tren Engagement</h2>

          {engagementTrend.length > 0 ? (
            <div className="space-y-4">
              {engagementTrend.slice(-7).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {format(new Date(item.date), 'dd MMM yyyy', { locale: idLocale })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.battles} pertandingan • {item.achievements} pencapaian
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{item.activeUsers} pengguna aktif</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Belum ada data engagement</p>
          )}
        </div>

        {/* Seasonal Performance */}
        {seasonalPerformance.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Performa Musiman</h2>

            <div className="space-y-4">
              {seasonalPerformance.map(season => (
                <div key={season.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{season.seasons.name}</h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(season.seasons.start_date), 'dd MMM', { locale: idLocale })} - {format(new Date(season.seasons.end_date), 'dd MMM yyyy', { locale: idLocale })}
                      </p>
                    </div>
                    {season.rank && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">#{season.rank}</p>
                        <p className="text-xs text-gray-600">Peringkat</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">Pertandingan</p>
                      <p className="font-bold text-gray-900">{season.battles_completed}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">Pencapaian</p>
                      <p className="font-bold text-gray-900">{season.achievements_unlocked}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">Poin</p>
                      <p className="font-bold text-gray-900">{season.total_points}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievement Timeline */}
        {achievementTimeline.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⏱️ Timeline Pencapaian</h2>

            <div className="space-y-3">
              {achievementTimeline.slice(-10).reverse().map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                  <span className="text-2xl">{item.achievement.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.achievement.name}</p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(item.date), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">+{item.points}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Ringkasan Tren</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Total Musim</p>
              <p className="text-2xl font-bold text-blue-600">{trends.totalSeasons}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded">
              <p className="text-sm text-gray-600">Rata-rata Skor Performa</p>
              <p className="text-2xl font-bold text-purple-600">{trends.averagePerformanceScore.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Peringkat Terbaik</p>
              <p className="text-2xl font-bold text-green-600">
                {trends.bestRank ? `#${trends.bestRank}` : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded">
              <p className="text-sm text-gray-600">Total Pencapaian Dibuka</p>
              <p className="text-2xl font-bold text-orange-600">{trends.totalAchievementsUnlocked}</p>
            </div>
            <div className="p-4 bg-red-50 rounded">
              <p className="text-sm text-gray-600">Streak Terpanjang</p>
              <p className="text-2xl font-bold text-red-600">{trends.longestStreak} hari</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded">
              <p className="text-sm text-gray-600">Streak Saat Ini</p>
              <p className="text-2xl font-bold text-indigo-600">{trends.currentStreak} hari</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
