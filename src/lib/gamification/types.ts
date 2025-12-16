// Advanced Gamification System Types
// Multi-tier achievement system with dynamic generation

export interface AchievementSystem {
  categories: {
    learning: LearningAchievement[]
    social: SocialAchievement[]
    streak: StreakAchievement[]
    mastery: MasteryAchievement[]
    exploration: ExplorationAchievement[]
  }
  progression: {
    bronze: AchievementTier
    silver: AchievementTier
    gold: AchievementTier
    platinum: AchievementTier
    diamond: AchievementTier
  }
  rewards: {
    badges: Badge[]
    titles: Title[]
    cosmetics: CosmeticItem[]
    privileges: SystemPrivilege[]
  }
}

export interface AchievementBase {
  id: string
  name: string
  description: string
  icon: string
  category: 'learning' | 'social' | 'streak' | 'mastery' | 'exploration'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  isHidden: boolean
  isSecret: boolean
  points: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  createdAt: Date
}

export interface LearningAchievement extends AchievementBase {
  type: 'completion' | 'perfect_score' | 'speed_run' | 'improvement'
  subject?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  requirements: {
    minAccuracy?: number
    maxTime?: number
    consecutiveCorrect?: number
    totalCompletions?: number
  }
}

export interface SocialAchievement extends AchievementBase {
  type: 'collaboration' | 'leadership' | 'mentorship' | 'squad_success'
  requirements: {
    squadMembers?: number
    squadWins?: number
    helpedUsers?: number
    receivedThanks?: number
  }
}

export interface StreakAchievement extends AchievementBase {
  type: 'daily' | 'weekly' | 'monthly' | 'subject_specific'
  requirements: {
    consecutiveDays: number
    minimumActivity: number
    subject?: string
  }
}

export interface MasteryAchievement extends AchievementBase {
  type: 'subject_mastery' | 'subtopic_mastery' | 'all_rounder'
  subject?: string
  requirements: {
    minAccuracy: number
    totalProblems: number
    consistentPerformance: boolean
    improvementRate: number
  }
}

export interface ExplorationAchievement extends AchievementBase {
  type: 'feature_discovery' | 'content_unlock' | 'beta_testing' | 'feedback_provider'
  requirements: {
    featuresDiscovered?: number
    contentUnlocked?: number
    betaFeaturesTested?: number
    feedbackProvided?: number
  }
}

export interface AchievementTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  name: string
  color: string
  icon: string
  pointMultiplier: number
  benefits: string[]
  requirements: {
    totalPoints: number
    achievementsInTier: number
    minimumTierLevel: number
  }
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category: string
  isAnimated: boolean
  isEquippable: boolean
  slot?: 'profile' | 'frame' | 'background' | 'effect'
  unlockedAt: Date
}

export interface Title {
  id: string
  name: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  color: string
  isPrefix: boolean // true: "Title Name", false: "Name, the Title"
  requirements: {
    achievementId?: string
    totalPoints?: number
    specificCondition?: string
  }
  unlockedAt: Date
}

export interface CosmeticItem {
  id: string
  name: string
  description: string
  type: 'avatar' | 'profile_frame' | 'background' | 'effect' | 'companion'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  price: {
    points: number
    premiumCurrency?: number
  }
  isLimited: boolean
  limitedUntil?: Date
  previewImage: string
  unlockedAt?: Date
  equippedAt?: Date
}

export interface SystemPrivilege {
  id: string
  name: string
  description: string
  type: 'moderation' | 'content_creation' | 'event_access' | 'beta_features'
  level: 'basic' | 'advanced' | 'expert'
  requirements: {
    achievementId?: string
    totalPoints?: number
    communityTrust?: number
  }
  grantedAt: Date
  expiresAt?: Date
}

export interface UserAchievements {
  userId: string
  unlockedAchievements: string[]
  inProgressAchievements: AchievementProgress[]
  totalPoints: number
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  tierProgress: {
    currentTier: number
    nextTier: number
    progressPercentage: number
    pointsToNext: number
  }
  statistics: {
    totalUnlocked: number
    totalAvailable: number
    completionPercentage: number
    rareAchievements: number
    secretAchievements: number
  }
}

export interface AchievementProgress {
  achievementId: string
  currentProgress: number
  requiredProgress: number
  isCompleted: boolean
  completedAt?: Date
  lastUpdated: Date
  milestones: {
    milestone: number
    unlockedAt: Date
    reward: string
  }[]
}

export interface DynamicChallenge {
  id: string
  name: string
  description: string
  type: 'individual' | 'squad' | 'community'
  category: 'learning' | 'creativity' | 'collaboration' | 'competition'
  difficulty: 'adaptive' | 'static'
  duration: {
    start: Date
    end: Date
  }
  requirements: {
    targetUsers?: number
    minParticipants?: number
    skillLevel?: string
  }
  rewards: {
    points: number
    achievements: string[]
    cosmetics?: string[]
  }
  isActive: boolean
  isLimited: boolean
  maxParticipants?: number
  currentParticipants: number
}

export interface ChallengeTemplate {
  id: string
  name: string
  description: string
  category: string
  baseRequirements: any
  difficultyScaling: {
    enabled: boolean
    baseLevel: number
    scalingFactor: number
    maxLevel: number
  }
  personalizationFactors: {
    userPerformance: boolean
    userPreferences: boolean
    learningStyle: boolean
  }
  autoGeneration: {
    frequency: 'daily' | 'weekly' | 'monthly'
    triggers: string[]
    conditions: any[]
  }
}

export interface SeasonalEvent {
  id: string
  name: string
  theme: EventTheme
  duration: {
    start: Date
    end: Date
  }
  challenges: EventChallenge[]
  rewards: EventReward[]
  adaptiveDifficulty: {
    enabled: boolean
    baseLevel: number
    scalingFactor: number
  }
  socialFeatures: {
    leaderboards: boolean
    teamChallenges: boolean
    sharingRewards: boolean
  }
  isActive: boolean
  isRecurring: boolean
  frequency?: 'monthly' | 'quarterly' | 'yearly'
}

export interface EventTheme {
  id: string
  name: string
  description: string
  visualStyle: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    fontFamily: string
  }
  iconSet: string[]
  musicTheme?: string
  particleEffects: boolean
}

export interface EventChallenge {
  id: string
  eventId: string
  name: string
  description: string
  type: 'individual' | 'team' | 'community'
  requirements: {
    target: number
    metric: string
    timeLimit?: number
  }
  rewards: {
    points: number
    items: string[]
    badges: string[]
  }
  leaderboard: string[]
  isActive: boolean
  startDate: Date
  endDate: Date
}

export interface EventReward {
  id: string
  eventId: string
  name: string
  description: string
  type: 'points' | 'cosmetic' | 'badge' | 'title' | 'privilege'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  requirements: {
    position?: number
    points?: number
    completions?: number
  }
  isLimited: boolean
  limitedQuantity?: number
  claimedCount: number
}

export interface LeaderboardSystem {
  matchmaking: {
    skillBasedMatching: boolean
    levelRange: number
    recentPerformanceWeight: number
    consistencyBonus: number
  }
  categories: {
    overall: GlobalLeaderboard
    subject: SubjectLeaderboard[]
    weekly: WeeklyLeaderboard
    improvement: ImprovementLeaderboard
  }
  rewards: {
    topPositions: PositionReward[]
    participationBonus: ConsistencyReward[]
    improvementBonus: ProgressReward[]
  }
}

export interface GlobalLeaderboard {
  id: string
  name: string
  period: 'all_time' | 'yearly' | 'monthly' | 'weekly'
  participants: LeaderboardEntry[]
  lastUpdated: Date
  userRank?: number
  userScore?: number
}

export interface SubjectLeaderboard {
  id: string
  subject: string
  period: 'all_time' | 'yearly' | 'monthly' | 'weekly'
  participants: LeaderboardEntry[]
  lastUpdated: Date
  userRank?: number
  userScore?: number
}

export interface WeeklyLeaderboard {
  id: string
  week: string
  theme?: string
  participants: LeaderboardEntry[]
  lastUpdated: Date
  userRank?: number
  userScore?: number
}

export interface ImprovementLeaderboard {
  id: string
  period: 'monthly' | 'quarterly'
  metric: 'accuracy_improvement' | 'speed_improvement' | 'consistency'
  participants: ImprovementEntry[]
  lastUpdated: Date
  userRank?: number
  userImprovement?: number
}

export interface LeaderboardEntry {
  userId: string
  username: string
  avatar: string
  rank: number
  score: number
  badge?: string
  title?: string
  change: number // Rank change from previous period
}

export interface ImprovementEntry {
  userId: string
  username: string
  avatar: string
  rank: number
  improvement: number
  previousValue: number
  currentValue: number
  percentageChange: number
}

export interface PositionReward {
  position: number
  reward: {
    points: number
    cosmetic?: string
    badge?: string
  }
  isGuaranteed: boolean
}

export interface ConsistencyReward {
  threshold: number // consecutive weeks/days
  reward: {
    points: number
    multiplier: number
  }
}

export interface ProgressReward {
  improvementThreshold: number
  reward: {
    points: number
    bonusItem?: string
  }
}

export interface TournamentMode {
  id: string
  name: string
  type: 'elimination' | 'round_robin' | 'swiss' | 'battle_royale'
  maxParticipants: number
  duration: number
  rules: TournamentRule[]
  rewards: TournamentReward[]
  isActive: boolean
  nextStart?: Date
}

export interface TournamentRule {
  type: 'time_limit' | 'accuracy_requirement' | 'attempts_limit' | 'subject_restriction'
  value: any
  description: string
}

export interface TournamentReward {
  position: number
  reward: {
    points: number
    cosmetic?: string
    title?: string
    badge?: string
  }
}

// API Response Types
export interface GamificationResponse<T = any> {
  success: boolean
  data: T
  message?: string
  achievements?: AchievementProgress[]
  levelUp?: boolean
}

export interface AchievementNotification {
  type: 'achievement_unlocked' | 'milestone_reached' | 'tier_upgraded'
  achievement: AchievementBase
  progress?: AchievementProgress
  rewards: any[]
  timestamp: Date
}

export interface ChallengeUpdate {
  type: 'challenge_started' | 'challenge_progress' | 'challenge_completed' | 'challenge_failed'
  challengeId: string
  progress: number
  timeRemaining?: number
  rank?: number
  timestamp: Date
}