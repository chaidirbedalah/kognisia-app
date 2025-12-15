# Implementation Plan - Enhanced Gamification System

## Overview
This implementation plan converts the Enhanced Gamification System design into actionable coding tasks. Each task builds incrementally on previous work, integrating with the existing Kognisia platform (Next.js 16 + Supabase) that already has achievement system, squad battles, and analytics infrastructure.

## Task List

- [ ] 1. Set up enhanced database schema and migrations
  - Create coin economy tables (user_coins, coin_transactions)
  - Create daily challenge tables (daily_challenges, user_challenge_progress)
  - Create enhanced social tables (cohorts, cohort_members)
  - Create enhanced battle tables (battle_rooms, battle_participants)
  - Create enhanced achievement tables (achievement_categories, achievement_tiers)
  - Set up database indexes for performance optimization
  - Configure RLS policies for data security
  - _Requirements: 2.4, 10.1, 11.4_

- [ ] 1.1 Write property test for coin conversion logic
  - **Property 4: Coin Conversion Integrity**
  - **Validates: Requirements 2.4**

- [ ] 2. Implement core coin economy system
  - Create CoinWallet component with Bronze/Silver/Gold display
  - Implement server-side coin transaction service
  - Build automatic conversion logic (15:1 ratios)
  - Create coin transaction logging and audit trail
  - Add real-time coin updates via Supabase subscriptions
  - _Requirements: 2.4, 10.1, 10.2, 11.2_

- [ ] 2.1 Write property test for coin transaction correctness
  - **Property 5: Cohort Transaction Correctness**
  - **Validates: Requirements 3.2, 3.3**

- [ ] 2.2 Write property test for automatic conversion trigger
  - **Property 9: Automatic Conversion Trigger**
  - **Validates: Requirements 10.1**

- [ ] 3. Build daily challenge system
  - Create DailyChallengeGenerator for 3 challenge types (volume, accuracy, focus)
  - Implement challenge completion validation logic
  - Build challenge progress tracking system
  - Create daily reset mechanism at midnight
  - Add Bronze coin reward system for challenge completion
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ] 3.1 Write property test for daily challenge rewards
  - **Property 2: Daily Challenge Reward Consistency**
  - **Validates: Requirements 2.2**

- [ ] 4. Implement XP and leveling enhancements
  - Enhance existing XP system with difficulty-based rewards (10/20/50 XP)
  - Create tiered progression curve for level calculation
  - Implement UTBK-themed titles (Level 10 "Pejuang SNBT", Level 30 "Calon Maba PTN")
  - Add XP bonus system for daily challenge completion
  - Integrate with existing achievement system
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4.1 Write property test for XP award consistency
  - **Property 1: XP Award Consistency**
  - **Validates: Requirements 1.1**

- [ ] 4.2 Write property test for level progression accuracy
  - **Property 3: Level Progression Accuracy**
  - **Validates: Requirements 1.3**

- [ ] 5. Create cohort (temporary study group) system
  - Build CohortManager component for creating/joining cohorts
  - Implement invitation code system for cohort access
  - Create real-time cohort session management
  - Build parallel question distribution system
  - Implement anti-leech participation tracking (minimum 80% participation)
  - Add grace period for disconnections (2 minutes)
  - Create reward distribution system (5 Bronze entry, 10 Bronze reward)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5.1 Write unit tests for cohort session management
  - Test cohort creation, joining, and completion flows
  - Test participation tracking and reward distribution
  - Test disconnection handling and grace period
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Enhance existing squad system for permanent teams
  - Extend existing squad system with enhanced features
  - Add squad level calculation based on average member XP
  - Implement custom squad names and logo system
  - Create squad statistics and performance tracking
  - Add school restriction configuration (optional)
  - Integrate with existing squad battle system
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6.1 Write unit tests for enhanced squad management
  - Test squad creation, member management, and statistics
  - Test squad level calculation and updates
  - Test school restriction enforcement
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Implement battle system enhancements
  - Create War Room system for serious HOTS battles (1 Silver Coin entry)
  - Build Battle Arena system for casual competitions (10 Bronze Coins entry)
  - Implement real-time battle synchronization with <500ms latency
  - Create anti-sharing question randomization system
  - Build real-time leaderboard during battles
  - Add battle result tracking and statistics
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.1 Write property test for battle entry cost enforcement
  - **Property 6: Battle Entry Cost Enforcement**
  - **Validates: Requirements 5.5, 6.3**

- [ ] 7.2 Write unit tests for battle synchronization
  - Test real-time question distribution and timing
  - Test anti-sharing mechanisms and question randomization
  - Test battle completion and result calculation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.4_

- [ ] 8. Enhance achievement and badge system
  - Extend existing achievement system with 4 categories (Sniper, Marathon, Speed Demon, Sultan)
  - Implement 5-tier system (Bronze, Silver, Gold, Platinum, Diamond)
  - Create automatic badge unlock detection and notifications
  - Build real-time achievement progress tracking
  - Add badge display system in user profiles
  - Integrate with existing achievement infrastructure
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8.1 Write property test for badge unlock notifications
  - **Property 10: Badge Unlock Notification**
  - **Validates: Requirements 7.5**

- [ ] 9. Implement enhanced leaderboard system
  - Extend existing leaderboard with Global, School, Squad, and Seasonal rankings
  - Implement real-time updates via Supabase subscriptions
  - Create efficient pagination and filtering system
  - Add search functionality for leaderboard navigation
  - Build squad leaderboard with squad-level statistics
  - Optimize leaderboard queries with materialized views
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9.1 Write property test for real-time leaderboard consistency
  - **Property 7: Real-time Leaderboard Consistency**
  - **Validates: Requirements 8.2**

- [ ] 10. Create immediate feedback and UI enhancements
  - Implement <200ms feedback for XP gains with animations, sound, and haptic
  - Create full-screen celebration animations for level ups and badge unlocks
  - Build visual coin animations for Bronze/Silver/Gold transactions
  - Design clear visual distinction between XP (progress bar) and Coins (counter)
  - Enhance mobile-first design with bottom navigation and touch-friendly interface
  - Add visual coin hierarchy with color coding
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10.1 Write property test for feedback response time
  - **Property 8: Feedback Response Time**
  - **Validates: Requirements 9.1**

- [ ] 10.2 Write unit tests for UI feedback systems
  - Test animation triggers and timing
  - Test sound and haptic feedback functionality
  - Test visual coin counter updates
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 11. Implement security and anti-cheat measures
  - Create server-side authoritative logic for all XP/Coins calculations
  - Implement rapid-fire answering pattern detection
  - Build audit logging system for all coin transactions
  - Create anomaly detection and flagging system
  - Enhance existing RLS policies for new tables
  - Add rate limiting for battle participation
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 11.1 Write unit tests for anti-cheat systems
  - Test rapid-fire detection algorithms
  - Test server-side calculation validation
  - Test audit logging functionality
  - _Requirements: 11.1, 11.2, 11.5_

- [ ] 12. Create API endpoints for enhanced gamification
  - Build coin management APIs (GET /api/coins, POST /api/coins/convert)
  - Create daily challenge APIs (GET /api/challenges, POST /api/challenges/complete)
  - Implement cohort APIs (POST /api/cohorts, GET /api/cohorts/[id], POST /api/cohorts/join)
  - Build enhanced battle APIs (POST /api/battles/war-room, POST /api/battles/arena)
  - Create enhanced leaderboard APIs (GET /api/leaderboard/global, /school, /squad, /seasonal)
  - Add real-time subscription endpoints for live updates
  - _Requirements: All requirements integration_

- [ ] 12.1 Write integration tests for API endpoints
  - Test all coin management endpoints
  - Test daily challenge completion flow
  - Test cohort creation and joining flow
  - Test battle creation and participation flow
  - _Requirements: All requirements integration_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Create admin dashboard for gamification management
  - Build admin interface for managing daily challenges
  - Create coin economy monitoring dashboard
  - Implement user behavior analytics for gamification features
  - Add system health monitoring for real-time features
  - Create manual intervention tools for edge cases
  - _Requirements: System administration and monitoring_

- [ ] 14.1 Write unit tests for admin dashboard functionality
  - Test admin challenge management
  - Test coin economy monitoring
  - Test user analytics display
  - _Requirements: System administration_

- [ ] 15. Performance optimization and monitoring
  - Implement database query optimization for coin transactions
  - Create caching layer for frequently accessed leaderboard data
  - Add performance monitoring for real-time battle synchronization
  - Optimize Supabase subscription filtering for reduced bandwidth
  - Implement client-side caching for static gamification data
  - _Requirements: Performance and scalability_

- [ ] 15.1 Write performance tests for critical paths
  - Test coin transaction performance under load
  - Test real-time battle synchronization latency
  - Test leaderboard query performance
  - _Requirements: Performance requirements_

- [ ] 16. Integration with existing Kognisia features
  - Integrate coin rewards with existing question answering system
  - Connect enhanced achievements with existing progress tracking
  - Merge new leaderboards with existing squad battle rankings
  - Integrate cohort system with existing study session infrastructure
  - Connect battle system with existing question bank and difficulty classification
  - _Requirements: System integration_

- [ ] 16.1 Write integration tests for existing feature compatibility
  - Test backward compatibility with existing achievement system
  - Test integration with existing squad battle system
  - Test question bank integration with new battle modes
  - _Requirements: System integration_

- [ ] 17. Final checkpoint and deployment preparation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all database migrations are ready
  - Confirm all API endpoints are documented and tested
  - Validate real-time features work correctly
  - Check mobile responsiveness and performance
  - Prepare deployment scripts and monitoring setup

## Implementation Notes

### Database Migration Strategy
- Run migrations in order, starting with core economy tables
- Migrate existing user data to new coin system (give initial Bronze coins)
- Preserve existing achievement and squad data during enhancement
- Set up proper indexes before enabling real-time features

### Real-time Feature Implementation
- Use Supabase subscriptions for coin updates, leaderboards, and battle synchronization
- Implement proper error handling and reconnection logic
- Add fallback mechanisms for offline scenarios
- Optimize subscription filters to reduce bandwidth usage

### Testing Strategy
- Property-based tests focus on economic integrity and mathematical correctness
- Unit tests cover component behavior and edge cases
- Integration tests verify end-to-end user flows
- Performance tests ensure real-time features meet latency requirements

### Security Considerations
- All economic calculations must be server-side authoritative
- Implement proper input validation and sanitization
- Use existing Supabase RLS policies and extend for new tables
- Add comprehensive audit logging for debugging and compliance

This implementation plan provides a structured approach to building the Enhanced Gamification System while maintaining compatibility with existing Kognisia infrastructure and ensuring high code quality through comprehensive testing.