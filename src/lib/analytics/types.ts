// Advanced Analytics Types & Interfaces
// For comprehensive analytics and reporting system

export interface AnalyticsTimeRange {
  start: Date
  end: Date
  type: '7d' | '30d' | '90d' | '365d' | 'custom'
}

export interface SchoolMetrics {
  totalStudents: number
  activeTeachers: number
  totalClasses: number
  averageProgress: number
  engagementRate: number
  retentionRate: number
  completionRate: number
  timeSpentLearning: number
  performanceScore: number
}

export interface LearningPattern {
  hourOfDay: number
  dayOfWeek: number
  activityLevel: number
  subject: string
  performance: number
}

export interface SubjectMetrics {
  subject: string
  totalAttempts: number
  averageAccuracy: number
  improvementRate: number
  timeSpent: number
  masteryLevel: number
  difficultyProgression: number[]
}

export interface StudentRiskProfile {
  studentId: string
  studentName: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskFactors: {
    decliningPerformance: boolean
    lowEngagement: boolean
    missedDeadlines: boolean
    socialIsolation: boolean
  }
  recommendations: string[]
  interventionPriority: number
}

export interface TimeAnalysis {
  peakStudyHours: number[]
  optimalStudyTimes: {
    start: string
    end: string
    effectiveness: number
  }[]
  averageSessionLength: number
  studyFrequency: number
}

export interface ResourceMetrics {
  resourceType: 'learning_material' | 'assessment' | 'video' | 'interactive'
  utilizationRate: number
  effectiveness: number
  userSatisfaction: number
  costPerUsage: number
}

export interface AdminAnalytics {
  schoolMetrics: SchoolMetrics
  learningPatterns: LearningPattern[]
  subjectPerformance: SubjectMetrics[]
  predictiveInsights: {
    atRiskStudents: StudentRiskProfile[]
    optimalStudyTimes: TimeAnalysis
    resourceUtilization: ResourceMetrics[]
  }
  trends: {
    engagementTrend: number[]
    performanceTrend: number[]
    retentionTrend: number[]
  }
}

export interface LearningVelocity {
  current: number
  trend: 'improving' | 'stable' | 'declining'
  prediction: number
  confidence: number
  acceleration: number
}

export interface SubjectMastery {
  subject: string
  currentLevel: number
  targetLevel: number
  progressRate: number
  strengths: string[]
  weaknesses: string[]
  nextMilestone: string
}

export interface SubtopicProgress {
  subtopic: string
  completed: boolean
  accuracy: number
  timeSpent: number
  attempts: number
  lastAccessed: Date
}

export interface FocusArea {
  area: string
  priority: 'high' | 'medium' | 'low'
  estimatedTimeToMastery: number
  recommendedResources: string[]
  expectedImprovement: number
}

export interface StudentAnalytics {
  studentId: string
  learningVelocity: LearningVelocity
  masteryBreakdown: SubjectMastery[]
  subtopics: SubtopicProgress[]
  recommendedFocus: FocusArea[]
  socialLearning: {
    squadContributions: number
    peerInfluence: number
    collaborativeScore: number
    leadershipScore: number
  }
  engagement: {
    dailyActiveMinutes: number
    weeklyStreak: number
    monthlyGoals: number
    achievementRate: number
  }
}

export interface MetricSelector {
  id: string
  name: string
  category: 'performance' | 'engagement' | 'progress' | 'social' | 'predictive'
  type: 'number' | 'percentage' | 'trend' | 'chart'
  aggregation: 'sum' | 'average' | 'median' | 'min' | 'max'
  description: string
}

export interface FilterConfig {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in'
  value: any
  label: string
}

export interface ChartType {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge'
  title: string
  xAxis?: string
  yAxis?: string
  groupBy?: string
  aggregation?: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'academic' | 'engagement' | 'administrative' | 'custom'
  metrics: MetricSelector[]
  filters: FilterConfig[]
  visualizations: ChartType[]
  layout: ReportLayout
  isDefault: boolean
  createdBy: string
  createdAt: Date
}

export interface ReportLayout {
  type: 'single_page' | 'multi_page' | 'dashboard'
  sections: ReportSection[]
  styling: ReportStyling
}

export interface ReportSection {
  id: string
  title: string
  type: 'chart' | 'table' | 'metric_cards' | 'text' | 'image'
  content: any
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface ReportStyling {
  theme: 'light' | 'dark' | 'school_branded'
  colors: string[]
  fonts: {
    heading: string
    body: string
    data: string
  }
  logo?: string
}

export interface ExportConfig {
  templateId: string
  format: 'PDF' | 'Excel' | 'CSV' | 'JSON' | 'PowerBI'
  filters: FilterConfig[]
  dateRange: AnalyticsTimeRange
  includeCharts: boolean
  includeRawData: boolean
  compression: boolean
  password?: string
}

export interface ExportResult {
  url: string
  filename: string
  size: number
  format: string
  expiresAt: Date
  downloadCount: number
}

export interface ReportSchedule {
  id: string
  templateId: string
  recipients: string[]
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  nextRun: Date
  format: 'PDF' | 'Excel'
  autoSend: boolean
  isActive: boolean
}

// API Response Types
export interface AnalyticsResponse<T = any> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AnalyticsError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Chart Data Types
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
}

// Real-time Analytics
export interface RealTimeMetrics {
  timestamp: Date
  activeUsers: number
  currentSessions: number
  averageSessionLength: number
  subjectDistribution: Record<string, number>
  performanceDistribution: {
    excellent: number
    good: number
    average: number
    poor: number
  }
}

// Predictive Analytics
export interface PredictiveModel {
  id: string
  name: string
  type: 'performance' | 'retention' | 'engagement' | 'mastery'
  accuracy: number
  confidence: number
  lastTrained: Date
  features: string[]
  predictions: Prediction[]
}

export interface Prediction {
  targetId: string
  targetType: 'student' | 'class' | 'school'
  metric: string
  currentValue: number
  predictedValue: number
  timeHorizon: string
  confidence: number
  factors: {
    name: string
    impact: number
    value: any
  }[]
}