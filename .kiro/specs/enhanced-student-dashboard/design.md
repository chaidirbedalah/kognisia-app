# Enhanced Student Dashboard - Design Document

## Overview

Enhanced Student Dashboard adalah redesign komprehensif dari dashboard siswa yang mengubahnya dari simple stats display menjadi full analytics center. Dashboard ini memberikan insight mendalam tentang learning journey siswa across all assessment types dengan visualisasi yang clear dan actionable insights.

## Architecture

### Component Structure

DashboardPage (src/app/dashboard/page.tsx) ├── Header (Logo, User Info, Logout) ├── OverviewSection │ ├── StreakCard │ ├── DailyChallengeCard │ ├── SquadBattleCard │ ├── TryOutCard │ ├── MarathonCard │ └── InsightsCard (Strongest/Weakest) ├── TabsContainer │ ├── DailyChallengeTab │ │ ├── SummaryStats │ │ ├── LayerBreakdown (Direct/Hint/Solution %) │ │ ├── HistoryList │ │ └── TrendChart │ ├── MarathonTab │ │ ├── SummaryStats │ │ ├── HistoryList │ │ ├── SubtestBreakdown │ │ └── ComparisonChart │ ├── SquadBattleTab (Future) │ ├── TryOutTab (Future) │ └── ProgressTab │ ├── SubtestGrid (7 subtests) │ └── TopicList (per subtest) └── QuickActions ├── StartDailyChallenge ├── StartMarathon └── JoinSquad (Future)

### Data Flow

User loads /dashboard ↓ checkUser() → Fetch auth user ↓ loadDashboardData() → Parallel queries: ├── student_progress (all records) ├── submissions (grouped by assessment_id) ├── user_streaks └── question_bank (for topic/subtest info) ↓ processData() → Calculate metrics: ├── Overall stats ├── Per-assessment breakdown ├── 3-layer percentages ├── Trend data └── Subtest/topic aggregation ↓ Render dashboard with tabs


## Components and Interfaces

### 1. OverviewSection Component

**Props:**
```typescript
interface OverviewSectionProps {
  stats: {
    streak: { current: number; longest: number }
    dailyChallenge: { total: number; accuracy: number }
    squadBattle: { total: number; accuracy: number }
    tryOut: { total: number; accuracy: number }
    marathon: { total: number; accuracy: number }
    insights: {
      strongestSubtest: string
      weakestSubtest: string
      avgTimePerQuestion: number
    }
  }
  loading: boolean
}

Behavior:

Display 6 cards in responsive grid (3 cols desktop, 2 cols tablet, 1 col mobile)
Show skeleton loader when loading=true
Animate numbers on mount (count-up effect)
Color-code based on performance (green >70%, yellow 50-70%, red <50%)
2. DailyChallengeTab Component
Props:
interface DailyChallengeTabProps {
  data: {
    totalQuestions: number
    accuracy: number
    layerBreakdown: {
      direct: number      // % answered without hints
      withHint: number    // % used hint
      withSolution: number // % viewed solution
    }
    history: Array<{
      date: string
      score: number
      totalQuestions: number
      accuracy: number
    }>
    trendData: Array<{
      date: string
      accuracy: number
    }>
  }
}

Features:

Summary cards (Total, Accuracy, Layer breakdown)
Pie chart for layer breakdown
Scrollable history list (last 30 days)
Line chart for accuracy trend
Click history item → expand to show questions
3. MarathonTab Component
Props:
interface MarathonTabProps {
  data: {
    totalMarathons: number
    avgScore: number
    layerBreakdown: {
      direct: number
      withHint: number
      withSolution: number
    }
    history: Array<{
      id: string
      date: string
      totalScore: number
      maxScore: number
      subtestScores: Record<string, number> // PU: 80, PPU: 70, etc
    }>
  }
}

Features:

Summary stats
History list with expand/collapse
Radar chart for subtest comparison
Bar chart comparing marathons
"Retake Marathon" CTA if last attempt >30 days
4. ProgressTab Component
Props:

interface ProgressTabProps {
  data: {
    subtests: Array<{
      code: string
      name: string
      accuracy: number
      totalQuestions: number
      topics: Array<{
        name: string
        accuracy: number
        status: 'strong' | 'medium' | 'weak'
      }>
    }>
  }
}

Features:

Grid of 7 subtest cards
Each card shows accuracy + topic breakdown
Color-coded topics (green/yellow/red)
"Perbaiki Sekarang" button for weak topics
Heatmap visualization option
Data Models
DashboardStats Type

type DashboardStats = {
  overview: {
    streak: { current: number; longest: number }
    totalQuestions: number
    overallAccuracy: number
  }
  dailyChallenge: {
    total: number
    accuracy: number
    layerBreakdown: LayerBreakdown
    history: DailyChallengeHistory[]
    trend: TrendData[]
  }
  marathon: {
    total: number
    avgScore: number
    layerBreakdown: LayerBreakdown
    history: MarathonHistory[]
  }
  squadBattle: {
    total: number
    avgRank: number
    history: SquadBattleHistory[]
  }
  tryOut: {
    total: number
    avgScore: number
    history: TryOutHistory[]
  }
  progress: {
    subtests: SubtestProgress[]
  }
  insights: {
    strongestSubtest: string
    weakestSubtest: string
    avgTimePerQuestion: number
    weekComparison: { thisWeek: number; lastWeek: number }
  }
}

type LayerBreakdown = {
  direct: number      // %
  withHint: number    // %
  withSolution: number // %
}

Error Handling
Error Scenarios
No data available

Show empty state with motivational message
CTA: "Mulai Daily Challenge Pertamamu!"
Partial data (some assessments done, others not)

Show available data
Gray out unavailable sections with "Belum ada data"
Database query failure

Show error toast
Retry button
Fallback to cached data if available
Slow loading (>3s)

Show progress indicator
"Memuat data..." message
Option to cancel and retry
Testing Strategy
Unit Tests
Test data aggregation functions (groupBySubtest, calculateLayerBreakdown)
Test date formatting utilities
Test percentage calculations
Test trend data generation
Integration Tests
Test full dashboard load with mock data
Test tab switching
Test expand/collapse interactions
Test chart rendering
E2E Tests
Student with no data → See empty state
Student with Daily Challenge only → See DC tab populated
Student with all assessments → See all tabs populated
Click "Perbaiki Sekarang" → Navigate to remedial
Performance Considerations
Optimization Strategies
Data Fetching

Use parallel queries (Promise.all)
Cache dashboard data (5 min TTL)
Lazy load tab content (only fetch when tab opened)
Rendering

Use React.memo for cards
Virtualize long lists (history >50 items)
Debounce chart re-renders
Bundle Size

Code-split tabs (dynamic import)
Lazy load chart library
Use lightweight chart library (recharts)
Performance Targets
Initial load: <2s
Tab switch: <300ms
Chart render: <500ms
Smooth scroll: 60fps
UI/UX Design
Color Palette
Primary: Blue (#3B82F6) - Actions, links
Success: Green (#10B981) - Strong performance (>70%)
Warning: Yellow (#F59E0B) - Medium performance (50-70%)
Danger: Red (#EF4444) - Weak performance (<50%)
Gray: Neutral (#6B7280) - Text, borders
Typography
Headings: Inter Bold
Body: Inter Regular
Numbers: Inter SemiBold (for emphasis)
Spacing
Card padding: 24px
Card gap: 16px
Section margin: 32px
Responsive Breakpoints
Mobile: <640px (1 col)
Tablet: 640-1024px (2 cols)
Desktop: >1024px (3 cols)
Implementation Plan
See tasks.md for detailed implementation tasks.

Future Enhancements
Export Reports - PDF/Excel download
Goal Setting - Set target accuracy per subtest
Peer Comparison - Compare with class average
AI Recommendations - Personalized study suggestions
Gamification - Badges, achievements, leaderboard

