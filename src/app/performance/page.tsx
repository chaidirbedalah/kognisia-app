'use client';

import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/lib/performance-monitor';

interface PerformanceStats {
  endpoint: string;
  method: string;
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  cacheHitRate: number;
}

export default function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats[]>([]);
  const [summary, setSummary] = useState({
    totalRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    slowRequests: 0,
    errorRequests: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(performanceMonitor.getAllStats());
      setSummary(performanceMonitor.getSummary());
    };

    updateStats();

    // Refresh every 5 seconds
    const interval = setInterval(updateStats, 5000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleExport = () => {
    const data = performanceMonitor.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua metrics?')) {
      performanceMonitor.clear();
      setStats([]);
      setSummary({
        totalRequests: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        slowRequests: 0,
        errorRequests: 0
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">⚡ Performance Monitor</h1>
            <p className="text-gray-600">Pantau performa API dan response times</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Export
            </button>
            <button
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Requests</p>
            <p className="text-3xl font-bold text-blue-600">{summary.totalRequests}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Avg Response Time</p>
            <p className="text-3xl font-bold text-green-600">
              {summary.averageResponseTime.toFixed(0)}ms
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Cache Hit Rate</p>
            <p className="text-3xl font-bold text-purple-600">
              {summary.cacheHitRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Slow Requests</p>
            <p className="text-3xl font-bold text-orange-600">{summary.slowRequests}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Error Requests</p>
            <p className="text-3xl font-bold text-red-600">{summary.errorRequests}</p>
          </div>
        </div>

        {/* Endpoint Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Endpoint Statistics</h2>

          {stats.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Belum ada data performance</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Endpoint</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Method</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Count</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Avg (ms)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Min (ms)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Max (ms)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Cache Hit %</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 ${
                        stat.avgDuration > 1000 ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-gray-900 font-mono text-sm">
                        {stat.endpoint}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          stat.method === 'GET'
                            ? 'bg-blue-100 text-blue-800'
                            : stat.method === 'POST'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {stat.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                        {stat.count}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        stat.avgDuration > 1000
                          ? 'text-red-600'
                          : stat.avgDuration > 500
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}>
                        {stat.avgDuration.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {stat.minDuration.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {stat.maxDuration.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-semibold ${
                          stat.cacheHitRate > 50
                            ? 'text-green-600'
                            : stat.cacheHitRate > 20
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}>
                          {stat.cacheHitRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Performance Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Endpoints dengan response time &gt; 1000ms ditandai merah</li>
            <li>✓ Cache hit rate yang tinggi menunjukkan efisiensi caching</li>
            <li>✓ Monitor slow requests untuk optimasi lebih lanjut</li>
            <li>✓ Export metrics untuk analisis mendalam</li>
            <li>✓ Gunakan database indexes untuk query optimization</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
