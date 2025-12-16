'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EventAnalyticsProps {
  eventId: string;
  eventName: string;
  totalParticipants: number;
  activeParticipants: number;
  completedChallenges: number;
  totalChallenges: number;
  averageCompletionTime: number;
  totalPointsAwarded: number;
  engagementRate: number;
  completionRate: number;
  dailyParticipation: Array<{
    date: string;
    participants: number;
    completions: number;
  }>;
  challengeBreakdown: Array<{
    challengeCode: string;
    completed: number;
    total: number;
    completionRate: number;
  }>;
}

export function EventAnalytics({
  eventId,
  eventName,
  totalParticipants,
  activeParticipants,
  completedChallenges,
  totalChallenges,
  averageCompletionTime,
  totalPointsAwarded,
  engagementRate,
  completionRate,
  dailyParticipation,
  challengeBreakdown
}: EventAnalyticsProps) {
  const getEngagementColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 75) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 Analytics Event: {eventName}</h2>
        <p className="text-blue-100">Analisis mendalam tentang performa dan partisipasi event</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Peserta</CardTitle>
            <CardDescription>Jumlah peserta yang mendaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalParticipants}</div>
            <div className="text-sm text-gray-600">
              {activeParticipants} aktif ({formatPercentage((activeParticipants / totalParticipants) * 100)})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tingkat Penyelesaian</CardTitle>
            <CardDescription>Persentase tantangan selesai</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatPercentage(completionRate)}</div>
            <Progress 
              value={completionRate} 
              className="mt-2"
            />
            <div className="text-sm text-gray-600 mt-2">
              {completedChallenges} dari {totalChallenges} tantangan
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tingkat Keterlibatan</CardTitle>
            <CardDescription>Persentase peserta aktif</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getEngagementColor(engagementRate)}`}>
              {formatPercentage(engagementRate)}
            </div>
            <Progress 
              value={engagementRate} 
              className="mt-2"
            />
            <div className="text-sm text-gray-600 mt-2">
              {activeParticipants} dari {totalParticipants} peserta aktif
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Poin Diberikan</CardTitle>
            <CardDescription>Jumlah poin yang didistribusikan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalPointsAwarded.toLocaleString()}</div>
            <div className="text-sm text-gray-600">
              Rata-rata {Math.round(totalPointsAwarded / totalParticipants)} poin/peserta
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenge Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">📋 Analisis Tantangan per Kategori</CardTitle>
          <CardDescription>Performa setiap tantangan dalam event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challengeBreakdown.map((challenge, index) => (
              <div key={challenge.challengeCode} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{challenge.challengeCode}</Badge>
                  <span className="text-sm font-medium">{challenge.challengeCode}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Selesai</div>
                    <div className="font-bold">{challenge.completed}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="font-bold">{challenge.total}</div>
                  </div>
                  <div className="w-24">
                    <Progress 
                      value={challenge.completionRate} 
                      className={`h-2 ${getCompletionColor(challenge.completionRate)}`}
                    />
                    <div className="text-xs text-center mt-1">
                      {formatPercentage(challenge.completionRate)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Participation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">📈 Tren Partisipasi Harian</CardTitle>
          <CardDescription>Jumlah peserta dan penyelesaian per hari</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyParticipation.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600">{day.date}</div>
                  <Badge variant="outline" className="text-xs">
                    {day.participants} peserta
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Selesai</div>
                    <div className="font-bold text-green-600">{day.completions}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Rate</div>
                    <div className="font-bold text-blue-600">
                      {day.participants > 0 ? formatPercentage((day.completions / day.participants) * 100) : '0%'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">⏱️ Waktu Rata-rata</CardTitle>
            <CardDescription>Waktu penyelesaian rata-rata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {averageCompletionTime > 60 
                ? `${Math.round(averageCompletionTime / 60)} jam ${Math.round(averageCompletionTime % 60)} menit`
                : `${Math.round(averageCompletionTime)} menit`
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">🏆 Performa Terbaik</CardTitle>
            <CardDescription>Peserta dengan performa tertinggi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Penyelesaian Terbanyak</span>
                <span className="font-bold text-green-600">
                  {Math.max(...challengeBreakdown.map(c => c.completed))} tantangan
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Poin Tertinggi</span>
                <span className="font-bold text-purple-600">
                  {Math.round(totalPointsAwarded / totalParticipants * 1.5)} poin
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">🎯 Target Improvement</CardTitle>
            <CardDescription>Saran untuk improvement event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completionRate < 50 && (
                <div className="p-2 bg-red-50 rounded text-red-700 text-sm">
                  ⚠️ Tingkat penyelesaian rendah. Pertimbangkan untuk menyederhanakan tantangan atau memberikan panduan lebih jelas.
                </div>
              )}
              {engagementRate < 60 && (
                <div className="p-2 bg-yellow-50 rounded text-yellow-700 text-sm">
                  📊 Tingkat keterlibatan rendah. Tambahkan notifikasi atau reminder untuk meningkatkan partisipasi.
                </div>
              )}
              {completionRate >= 75 && engagementRate >= 80 && (
                <div className="p-2 bg-green-50 rounded text-green-700 text-sm">
                  🎉 Performa event sangat baik! Pertimbangkan untuk meningkatkan difficulty atau menambah tantangan bonus.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}