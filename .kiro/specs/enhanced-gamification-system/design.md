# Design Document - Enhanced Gamification System

## Overview

The Enhanced Gamification System transforms Kognisia UTBK 2026 from a traditional learning platform into an engaging, social, and competitive ecosystem. The system implements a "Strictly Earn-to-Play" model where academic effort is the only currency, creating sustainable engagement loops that motivate daily study habits while providing social and competitive outlets.

The design integrates with the existing Kognisia platform (Next.js 16 + Supabase) and builds upon the current achievement system, squad battles, and analytics infrastructure to create a comprehensive gamification experience.

## Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Next.js 16)                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Cohort    │  │    Squad    │  │   Battle    │         │
│  │ Management  │  │ Management  │  │   System    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Coin     │  │ Achievement │  │ Leaderboard │         │
│  │   System    │  │   System    │  │   System    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (Next.js API Routes)           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Economy   │  │   Battle    │  │  Real-time  │         │
│  │  Controller │  │ Controller  │  │ Controller  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                 Database Layer (Supabase)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Economy   │  │   Social    │  │ Competition │         │
│  │   Tables    │  │   Tables    │  │   Tables    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Core Economy Flow

```
Individual Study → Earn Bronze Coins → Convert to Silver/Gold → 
Access Social Features (Cohort/Battle) → Earn XP & Badges → 
Back to Individual Study
```

## Components and Interfaces

### 1. Coin Economy System

**CoinWallet Component**
- Displays Bronze, Silver, Gold coin counts with visual hierarchy
- Shows conversion progress (e.g., "12/15 Bronze → Silver")
- Handles manual conversion requests
- Real-time updates via Supabase subscriptions

**CoinTransaction Service**
- Server-authoritative coin calculations
- Automatic conversion logic (15:1 ratios)
- Transaction logging and audit trail
- Anti-cheat validation

### 2. Daily Challenge System

**DailyChallengeGenerator**
- Generates 3 daily challenges: Volume, Accuracy, Focus
- Configurable difficulty and requirements
- Reset mechanism at midnight
- Progress tracking per challenge

**ChallengeCompletion Handler**
- Validates challenge completion criteria
- Awards Bronze Coins and XP bonus
- Updates user statistics
- Triggers achievement checks

### 3. Social Learning (Cohort System)

**CohortManager Component**
- Create/join cohort with invitation codes
- Real-time member status and progress
- Session management and auto-dissolution
- Anti-leech participation tracking

**CohortSession Controller**
- Parallel question distribution
- Individual scoring with group leaderboard
- Grace period for disconnections
- Reward calculation and distribution

### 4. Competitive System (Squad & Battle)

**SquadManagement Component**
- Permanent squad creation and management
- Member invitation and role management
- Squad statistics and level calculation
- Squad-to-squad challenge system

**BattleSystem Controller**
- War Room (serious HOTS battles)
- Battle Arena (casual competitions)
- Real-time synchronization
- Anti-sharing question randomization

### 5. Achievement & Badge System

**BadgeUnlock Engine**
- Four categories: Sniper, Marathon, Speed Demon, Sultan
- Five tiers: Bronze, Silver, Gold, Platinum, Diamond
- Automatic unlock detection
- Real-time notifications

### 6. Leaderboard System

**LeaderboardManager**
- Global, School, Squad, Seasonal rankings
- Real-time updates via Supabase subscriptions
- Efficient pagination and filtering
- Rank calculation and caching

## Data Models

### Core Economy Tables

```sql
-- User Coins Wallet
CREATE TABLE user_coins (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  bronze_coins INTEGER DEFAULT 0,
  silver_coins INTEGER DEFAULT 0,
  gold_coins INTEGER DEFAULT 0,
  total_earned_bronze INTEGER DEFAULT 0,
  total_earned_silver INTEGER DEFAULT 0,
  total_earned_gold INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coin Transactions Log
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  transaction_type VARCHAR(50), -- 'earn', 'spend', 'convert'
  coin_type VARCHAR(20), -- 'bronze', 'silver', 'gold'
  amount INTEGER,
  source VARCHAR(100), -- 'daily_challenge', 'cohort', 'conversion'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Daily Challenge Tables

```sql
-- Daily Challenges
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE,
  challenge_type VARCHAR(50), -- 'volume', 'accuracy', 'focus'
  requirements JSONB, -- {target: 20, subject: 'math', accuracy: 70}
  reward_bronze INTEGER DEFAULT 1,
  reward_xp INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Challenge Progress
CREATE TABLE user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  challenge_id UUID REFERENCES daily_challenges(id),
  progress JSONB, -- {answered: 15, correct: 12, accuracy: 80}
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Social Learning Tables

```sql
-- Cohorts (Temporary Study Groups)
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  invitation_code VARCHAR(20) UNIQUE,
  creator_id UUID REFERENCES users(id),
  max_members INTEGER DEFAULT 8,
  entry_cost_bronze INTEGER DEFAULT 5,
  reward_bronze INTEGER DEFAULT 10,
  session_duration INTEGER DEFAULT 30, -- minutes
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'active', 'completed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cohort Members
CREATE TABLE cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES cohorts(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  participation_score DECIMAL(3,2) DEFAULT 0, -- 0.0 to 1.0
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  coins_paid BOOLEAN DEFAULT FALSE,
  reward_received BOOLEAN DEFAULT FALSE
);
```

### Squad & Battle Tables

```sql
-- Permanent Squads
CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE,
  logo_url VARCHAR(255),
  leader_id UUID REFERENCES users(id),
  max_members INTEGER DEFAULT 8,
  school_restriction BOOLEAN DEFAULT TRUE,
  squad_level INTEGER DEFAULT 1,
  total_xp BIGINT DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Battle Rooms
CREATE TABLE battle_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  room_type VARCHAR(20), -- 'war_room', 'battle_arena'
  invitation_code VARCHAR(20) UNIQUE,
  creator_id UUID REFERENCES users(id),
  question_count INTEGER, -- 25 or 50
  duration_minutes INTEGER, -- 30 or 60
  material_type VARCHAR(20), -- 'regular', 'hots'
  entry_cost_type VARCHAR(20), -- 'bronze', 'silver'
  entry_cost_amount INTEGER,
  status VARCHAR(20) DEFAULT 'waiting',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Enhanced Achievement Tables

```sql
-- Achievement Categories
CREATE TABLE achievement_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE, -- 'sniper', 'marathon', 'speed_demon', 'sultan'
  display_name VARCHAR(100),
  description TEXT,
  icon_url VARCHAR(255)
);

-- Achievement Tiers
CREATE TABLE achievement_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES achievement_categories(id),
  tier_level INTEGER, -- 1=Bronze, 2=Silver, 3=Gold, 4=Platinum, 5=Diamond
  tier_name VARCHAR(20),
  requirements JSONB, -- {accuracy: 95, streak: 30, speed: 10}
  reward_xp INTEGER,
  badge_icon_url VARCHAR(255)
);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: XP Award Consistency
*For any* question with difficulty level, the XP awarded should match the specified amounts: easy (10 XP), medium (20 XP), HOTS (50 XP)
**Validates: Requirements 1.1**

### Property 2: Daily Challenge Reward Consistency  
*For any* completed daily challenge, the system should award exactly 1 Bronze Coin plus XP bonus within the 50-150 range
**Validates: Requirements 2.2**

### Property 3: Level Progression Accuracy
*For any* XP milestone reached, the level calculation and title assignment should follow the tiered progression curve consistently
**Validates: Requirements 1.3**

### Property 4: Coin Conversion Integrity
*For any* coin conversion, the 15:1 ratio should be maintained: 15 Bronze = 1 Silver, 15 Silver = 1 Gold
**Validates: Requirements 2.4**

### Property 5: Cohort Transaction Correctness
*For any* cohort join operation, exactly 5 Bronze Coins should be deducted, and upon completion, exactly 10 Bronze Coins should be awarded (net +5)
**Validates: Requirements 3.2, 3.3**

### Property 6: Battle Entry Cost Enforcement
*For any* battle room entry, the correct coin amount should be deducted: War Room (1 Silver), Battle Arena (10 Bronze)
**Validates: Requirements 5.5, 6.3**

### Property 7: Real-time Leaderboard Consistency
*For any* XP change, the leaderboard should update immediately via Supabase subscription without data inconsistency
**Validates: Requirements 8.2**

### Property 8: Feedback Response Time
*For any* XP gain event, the visual/audio/haptic feedback should trigger within 200ms
**Validates: Requirements 9.1**

### Property 9: Automatic Conversion Trigger
*For any* accumulation of exactly 15 coins of lower tier, automatic conversion to higher tier should occur immediately
**Validates: Requirements 10.1**

### Property 10: Badge Unlock Notification
*For any* achievement milestone reached, real-time notification should be sent and badge should appear in profile
**Validates: Requirements 7.5**

## Error Handling

### Coin Transaction Failures
- Insufficient coins: Clear error message with current balance
- Network failures: Retry mechanism with exponential backoff
- Concurrent transactions: Optimistic locking with conflict resolution

### Battle Synchronization Issues
- Connection drops: Grace period with reconnection attempts
- Latency spikes: Question buffer and time adjustment
- Cheating detection: Automatic flagging and temporary restrictions

### Real-time Subscription Failures
- Supabase connection loss: Automatic reconnection with state sync
- Message delivery failures: Polling fallback mechanism
- Data inconsistency: Periodic reconciliation jobs

## Testing Strategy

### Unit Testing Approach
- Component isolation testing for coin calculations
- Mock Supabase client for database operations
- Jest snapshots for UI component rendering
- Error boundary testing for graceful failures

### Property-Based Testing Requirements
The system will use **fast-check** library for property-based testing with minimum 100 iterations per property. Each property-based test must be tagged with comments explicitly referencing the correctness property from this design document using the format: **Feature: enhanced-gamification-system, Property {number}: {property_text}**

**Property Test Examples:**
```typescript
// Feature: enhanced-gamification-system, Property 1: XP Award Consistency
test('XP awards match difficulty levels', () => {
  fc.assert(fc.property(
    fc.oneof(fc.constant('easy'), fc.constant('medium'), fc.constant('hots')),
    (difficulty) => {
      const expectedXP = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50;
      const actualXP = calculateXP(difficulty);
      return actualXP === expectedXP;
    }
  ), { numRuns: 100 });
});

// Feature: enhanced-gamification-system, Property 4: Coin Conversion Integrity  
test('coin conversion maintains 15:1 ratio', () => {
  fc.assert(fc.property(
    fc.integer({ min: 15, max: 300 }),
    (bronzeAmount) => {
      const silverExpected = Math.floor(bronzeAmount / 15);
      const { silver, remainingBronze } = convertCoins(bronzeAmount, 'bronze');
      return silver === silverExpected && remainingBronze === (bronzeAmount % 15);
    }
  ), { numRuns: 100 });
});
```

### Integration Testing
- End-to-end battle flows with multiple users
- Real-time synchronization testing
- Database transaction integrity testing
- Performance testing under load

### Security Testing
- Anti-cheat mechanism validation
- Server-side calculation verification
- Input sanitization and validation
- Rate limiting effectiveness

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns (user_id, created_at, status)
- Materialized views for leaderboard calculations
- Connection pooling for concurrent users
- Query optimization for real-time features

### Real-time Performance
- Supabase subscription filtering to reduce bandwidth
- Client-side caching for static data
- Debounced updates for rapid changes
- WebSocket connection management

### Mobile Optimization
- Lazy loading for non-critical components
- Image optimization for badges and icons
- Touch-friendly interface design
- Offline capability for core features

## Security Measures

### Server-Side Authority
- All coin calculations performed server-side
- Transaction validation before database commits
- Anti-tampering measures for client requests
- Audit logging for all economic transactions

### Anti-Cheat Systems
- Pattern detection for rapid-fire answering
- Statistical analysis of performance outliers
- IP-based rate limiting
- Behavioral analysis for suspicious activity

### Data Privacy
- Supabase RLS policies for user data isolation
- GDPR compliance for user information
- Encrypted sensitive data storage
- Secure session management

## Deployment Strategy

### Database Migrations
1. Create new coin economy tables
2. Migrate existing user data to new schema
3. Set up indexes and constraints
4. Configure RLS policies

### Feature Rollout
1. Deploy coin system with existing users
2. Enable daily challenges gradually
3. Launch cohort system for beta users
4. Full battle system deployment
5. Monitor and optimize performance

### Monitoring & Analytics
- Real-time dashboards for system health
- User engagement metrics tracking
- Economic balance monitoring
- Performance bottleneck identification

This design provides a comprehensive foundation for implementing the Enhanced Gamification System while maintaining compatibility with the existing Kognisia platform and ensuring scalability for future growth.