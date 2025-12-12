/**
 * Performance Monitor for tracking API response times and metrics
 */

interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  timestamp: number;
  status: number;
  cached: boolean;
}

interface PerformanceStats {
  endpoint: string;
  method: string;
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  cacheHitRate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000;

  /**
   * Record a performance metric
   */
  recordMetric(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    cached: boolean = false
  ): void {
    this.metrics.push({
      endpoint,
      method,
      duration,
      timestamp: Date.now(),
      status,
      cached
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (duration > 1000) {
      console.warn(
        `[SLOW REQUEST] ${method} ${endpoint} took ${duration}ms`
      );
    }
  }

  /**
   * Get statistics for a specific endpoint
   */
  getEndpointStats(endpoint: string, method: string = 'GET'): PerformanceStats | null {
    const endpointMetrics = this.metrics.filter(
      m => m.endpoint === endpoint && m.method === method
    );

    if (endpointMetrics.length === 0) {
      return null;
    }

    const durations = endpointMetrics.map(m => m.duration);
    const cachedCount = endpointMetrics.filter(m => m.cached).length;

    return {
      endpoint,
      method,
      count: endpointMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      cacheHitRate: (cachedCount / endpointMetrics.length) * 100
    };
  }

  /**
   * Get all statistics
   */
  getAllStats(): PerformanceStats[] {
    const endpoints = new Set<string>();
    const stats: PerformanceStats[] = [];

    for (const metric of this.metrics) {
      const key = `${metric.method}:${metric.endpoint}`;
      if (!endpoints.has(key)) {
        endpoints.add(key);
        const stat = this.getEndpointStats(metric.endpoint, metric.method);
        if (stat) {
          stats.push(stat);
        }
      }
    }

    return stats.sort((a, b) => b.avgDuration - a.avgDuration);
  }

  /**
   * Get slowest endpoints
   */
  getSlowestEndpoints(limit: number = 10): PerformanceStats[] {
    return this.getAllStats().slice(0, limit);
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;

    const cachedCount = this.metrics.filter(m => m.cached).length;
    return (cachedCount / this.metrics.length) * 100;
  }

  /**
   * Get average response time
   */
  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / this.metrics.length;
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    totalRequests: number;
    averageResponseTime: number;
    cacheHitRate: number;
    slowRequests: number;
    errorRequests: number;
  } {
    const slowRequests = this.metrics.filter(m => m.duration > 1000).length;
    const errorRequests = this.metrics.filter(m => m.status >= 400).length;

    return {
      totalRequests: this.metrics.length,
      averageResponseTime: this.getAverageResponseTime(),
      cacheHitRate: this.getCacheHitRate(),
      slowRequests,
      errorRequests
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getSummary(),
      stats: this.getAllStats()
    }, null, 2);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Middleware wrapper for tracking API performance
 */
export function withPerformanceTracking(
  endpoint: string,
  method: string = 'GET'
) {
  return async <T>(fn: () => Promise<T>, cached: boolean = false): Promise<T> => {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      performanceMonitor.recordMetric(endpoint, method, duration, 200, cached);

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      performanceMonitor.recordMetric(endpoint, method, duration, 500, cached);

      throw error;
    }
  };
}
