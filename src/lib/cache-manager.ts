/**
 * Cache Manager for Performance Optimization
 * Handles in-memory caching with TTL support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval (every 5 minutes)
    this.startCleanup();
  }

  /**
   * Set a value in cache with TTL (in seconds)
   */
  set<T>(key: string, data: T, ttl: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000
    });
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Start cleanup interval to remove expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`Cache cleanup: removed ${cleaned} expired entries`);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: Array<{ key: string; ttl: number; age: number }>;
  } {
    const entries: Array<{ key: string; ttl: number; age: number }> = [];
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        ttl: entry.ttl,
        age: now - entry.timestamp
      });
    }

    return {
      size: this.cache.size,
      entries
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Cache key generators for common queries
 */
export const cacheKeys = {
  // Achievements
  achievementsList: () => 'achievements:list',
  achievementStats: (achievementId: string) => `achievement:stats:${achievementId}`,
  userAchievements: (userId: string) => `user:achievements:${userId}`,

  // Leaderboard
  globalLeaderboard: (limit: number = 100) => `leaderboard:global:${limit}`,
  userRank: (userId: string) => `leaderboard:rank:${userId}`,

  // Streaks
  userStreak: (userId: string) => `streak:${userId}`,
  streakStats: (userId: string) => `streak:stats:${userId}`,

  // Seasonal
  currentSeason: () => 'season:current',
  seasonalLeaderboard: (seasonId: string, limit: number = 100) => `leaderboard:seasonal:${seasonId}:${limit}`,
  userSeasonalAchievements: (userId: string, seasonId: string) => `user:seasonal:${userId}:${seasonId}`,

  // Cosmetics
  availableCosmetics: () => 'cosmetics:available',
  userCosmetics: (userId: string) => `user:cosmetics:${userId}`,

  // Events
  activeEvents: () => 'events:active',
  eventDetails: (eventId: string) => `event:${eventId}`,
  userEventProgress: (userId: string, eventId: string) => `user:event:${userId}:${eventId}`,

  // Analytics
  userMetrics: (userId: string) => `analytics:metrics:${userId}`,
  engagementTrend: () => 'analytics:engagement:trend',
  achievementAnalytics: () => 'analytics:achievements:stats'
};

/**
 * Cache TTL constants (in seconds)
 */
export const cacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAILY: 86400 // 24 hours
};
