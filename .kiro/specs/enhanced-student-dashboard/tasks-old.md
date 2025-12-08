# Enhanced Student Dashboard - Implementation Tasks

## Phase 1: Data Layer & API Setup

### Task 1.1: Create Data Fetching Functions
**Estimated Time:** 2 hours
**Dependencies:** None

Create utility functions to fetch all required data:
- `fetchUserStats()` - Get overview statistics (streak, totals)
- `fetchDailyChallengeData()` - Get Daily Challenge history with 3-layer breakdown
- `fetchMarathonData()` - Get Marathon history with subtest breakdown
- `fetchSquadBattleData()` - Get Squad Battle history with rankings
- `fetchTryOutData()` - Get Try Out history with subtest breakdown
- `fetchProgressBySubtest()` - Get progress per subtest and topic

**Files to Create/Modify:**
- `src/lib/dashboard-api.ts` (new)

**Acceptance Criteria:**
- All functions return properly typed data
- Handle loading and error states
- Implement caching for performance
- Add proper RLS policy checks

### Task 1.2: Create Data Aggregation Functions
**Estimated Time:** 2 hours
**Dependencies:** Task 1.1

Create functions to aggregate and calculate metrics:
- `calculateStreak()` - Current and longest streak
- `calculate3LayerBreakdown()` - Direct/Hint/Solution percentages
- `calculateAccuracyTrend()` - Accuracy over time
- `findStrongestWeakest()` - Best and worst subtests
- `compareWeeklyProgress()` - This week vs last week

**Files to Create/Modify:**
- `src/lib/dashboard-calculations.ts` (new)

**Acceptance Criteria:**
- All calculations are accurate
- Handle edge cases (no data, single data point)
- Return consistent data structures

## Phase 2: UI Components

### Task 2.1: Create Stats Cards Component
**Estimated Time:** 1.5 hours
**Dependencies:** Task 1.1

Create reusable stats card components:
- `StatsCard` - Generic card with icon, title, value, description
- `StreakCard` - Special card for streak with fire emoji
- `ComparisonCard` - Card showing this week vs last week

**Files to Create/Modify:**
- `src/components/dashboard/StatsCard.tsx` (new)
- `src/components/dashboard/StreakCard.tsx` (new)

**Acceptance Criteria:**
- Cards are responsive (mobile-first)
- Support loading skeleton state
- Proper TypeScript types
- Accessible (ARIA labels)

### Task 2.2: Create Tab Navigation Component
**Estimated Time:** 1 hour
**Dependencies:** None

Create tab navigation for switching between views:
- Daily Challenge
- Marathon
- Squad Battle
- Try Out
- Progress

**Files to Create/Modify:**
- `src/components/dashboard/TabNavigation.tsx` (new)

**Acceptance Criteria:**
- Smooth transitions between tabs
- Active tab highlighted
- Keyboard navigation support
- Mobile-friendly (horizontal scroll if needed)

### Task 2.3: Create Chart Components
**Estimated Time:** 2 hours
**Dependencies:** None

Create chart components using a lightweight library (recharts):
- `AccuracyTrendChart` - Line chart for accuracy over time
- `SubtestRadarChart` - Radar chart for subtest comparison
- `LayerBreakdownPie` - Pie chart for 3-layer breakdown
- `ComparisonBarChart` - Bar chart for week comparison

**Files to Create/Modify:**
- `src/components/dashboard/charts/AccuracyTrendChart.tsx` (new)
- `src/components/dashboard/charts/SubtestRadarChart.tsx` (new)
- `src/components/dashboard/charts/LayerBreakdownPie.tsx` (new)

**Acceptance Criteria:**
- Charts are responsive
- Proper color scheme (consistent with brand)
- Tooltips on hover
- Loading states

### Task 2.4: Create History List Components
**Estimated Time:** 2 hours
**Dependencies:** Task 1.1

Create list components for assessment history:
- `DailyChallengeHistory` - List of daily challenges with dates
- `MarathonHistory` - List of marathons with scores
- `SquadBattleHistory` - List of battles with rankings
- `TryOutHistory` - List of try outs with scores

**Files to Create/Modify:**
- `src/components/dashboard/history/DailyChallengeHistory.tsx` (new)
- `src/components/dashboard/history/MarathonHistory.tsx` (new)
- `src/components/dashboard/history/SquadBattleHistory.tsx` (new)
- `src/components/dashboard/history/TryOutHistory.tsx` (new)

**Acceptance Criteria:**
- Expandable items to show details
- Pagination or lazy loading for long lists
- Sort by date (newest first)
- Show 3-layer breakdown per item

### Task 2.5: Create Progress View Component
**Estimated Time:** 2 hours
**Dependencies:** Task 1.1

Create progress view showing subtest and topic breakdown:
- List of 7 subtests with accuracy
- Expandable to show topics per subtest
- Color-coded badges (Kuat/Cukup/Lemah)
- "Perbaiki Sekarang" button for weak topics

**Files to Create/Modify:**
- `src/components/dashboard/ProgressView.tsx` (new)

**Acceptance Criteria:**
- Collapsible subtest sections
- Visual progress bars
- Proper color coding
- Link to remedial exercises

## Phase 3: Main Dashboard Integration

### Task 3.1: Refactor Dashboard Page
**Estimated Time:** 3 hours
**Dependencies:** All Phase 2 tasks

Refactor main dashboard page to use new components:
- Replace current simple stats with new overview section
- Add tab navigation
- Integrate all tab content components
- Implement proper loading states
- Add error boundaries

**Files to Create/Modify:**
- `src/app/dashboard/page.tsx` (modify)

**Acceptance Criteria:**
- All 6 overview cards displayed
- Tab switching works smoothly
- Data loads efficiently (no unnecessary re-fetches)
- Proper error handling
- Loading skeletons shown during fetch

### Task 3.2: Add Additional Metrics Section
**Estimated Time:** 1.5 hours
**Dependencies:** Task 1.2, Task 3.1

Add section showing additional insights:
- Strongest/Weakest subtest
- Average time per question
- This week vs last week comparison
- Longest streak record

**Files to Create/Modify:**
- `src/components/dashboard/InsightsSection.tsx` (new)
- `src/app/dashboard/page.tsx` (modify)

**Acceptance Criteria:**
- Insights are accurate
- Visual indicators (icons, colors)
- Motivational messages
- Handle cases with insufficient data

## Phase 4: Performance & Polish

### Task 4.1: Optimize Data Fetching
**Estimated Time:** 2 hours
**Dependencies:** Task 3.1

Optimize data fetching for performance:
- Implement React Query or SWR for caching
- Batch related queries
- Add stale-while-revalidate strategy
- Implement optimistic updates where applicable

**Files to Create/Modify:**
- `src/lib/dashboard-api.ts` (modify)
- `src/app/dashboard/page.tsx` (modify)

**Acceptance Criteria:**
- Dashboard loads in <2 seconds
- No unnecessary re-fetches on tab switch
- Proper cache invalidation
- Smooth user experience

### Task 4.2: Add Responsive Design
**Estimated Time:** 2 hours
**Dependencies:** Task 3.1

Ensure all components are fully responsive:
- Test on mobile (320px - 768px)
- Test on tablet (768px - 1024px)
- Test on desktop (1024px+)
- Adjust grid layouts for different breakpoints

**Files to Create/Modify:**
- All component files (modify)

**Acceptance Criteria:**
- Cards stack properly on mobile
- Charts resize appropriately
- Tab navigation scrolls horizontally on mobile
- No horizontal overflow
- Touch-friendly tap targets (min 44px)

### Task 4.3: Add Loading & Error States
**Estimated Time:** 1.5 hours
**Dependencies:** Task 3.1

Implement comprehensive loading and error states:
- Skeleton loaders for all sections
- Error messages with retry buttons
- Empty states with motivational messages
- Network error handling

**Files to Create/Modify:**
- `src/components/dashboard/LoadingStates.tsx` (new)
- `src/components/dashboard/ErrorStates.tsx` (new)
- All component files (modify)

**Acceptance Criteria:**
- Skeleton loaders match final layout
- Error messages are user-friendly
- Retry functionality works
- Empty states encourage action

### Task 4.4: Add Animations & Transitions
**Estimated Time:** 1 hour
**Dependencies:** Task 3.1

Add subtle animations for better UX:
- Fade in for cards on load
- Smooth tab transitions
- Chart animations
- Hover effects on interactive elements

**Files to Create/Modify:**
- All component files (modify)
- `src/app/globals.css` (modify)

**Acceptance Criteria:**
- Animations are smooth (60fps)
- No janky transitions
- Respect prefers-reduced-motion
- Enhance UX without being distracting

## Phase 5: Testing & Deployment

### Task 5.1: Manual Testing
**Estimated Time:** 2 hours
**Dependencies:** All previous tasks

Test all functionality manually:
- Test with no data (new user)
- Test with partial data
- Test with full data (all assessment types)
- Test on different devices
- Test different user scenarios

**Acceptance Criteria:**
- All features work as expected
- No console errors
- Proper data display
- Responsive on all devices

### Task 5.2: Fix TypeScript Errors
**Estimated Time:** 1 hour
**Dependencies:** Task 5.1

Fix any TypeScript errors:
- Resolve type issues in dashboard page
- Add proper types for all components
- Fix any 'any' types

**Files to Create/Modify:**
- `src/app/dashboard/page.tsx` (modify)
- All component files (modify)

**Acceptance Criteria:**
- No TypeScript errors
- Proper type safety
- No 'any' types (except where necessary)

### Task 5.3: Deploy to Production
**Estimated Time:** 0.5 hours
**Dependencies:** Task 5.2

Deploy to Vercel:
- Test locally one final time
- Build and deploy
- Verify production deployment
- Test on production URL

**Acceptance Criteria:**
- Build succeeds
- No runtime errors in production
- All features work on production
- Performance is acceptable

## Summary

**Total Estimated Time:** 27 hours (~3-4 days of focused work)

**Critical Path:**
1. Task 1.1 → Task 1.2 (Data layer)
2. Task 2.1 → Task 2.2 → Task 2.3 → Task 2.4 → Task 2.5 (UI components)
3. Task 3.1 → Task 3.2 (Integration)
4. Task 4.1 → Task 4.2 → Task 4.3 → Task 4.4 (Polish)
5. Task 5.1 → Task 5.2 → Task 5.3 (Testing & deployment)

**Recommended Approach:**
- Start with Phase 1 (data layer) to ensure we can fetch all required data
- Build UI components in Phase 2 in parallel if multiple developers
- Integrate in Phase 3 once components are ready
- Polish and optimize in Phase 4
- Test thoroughly in Phase 5 before deployment
