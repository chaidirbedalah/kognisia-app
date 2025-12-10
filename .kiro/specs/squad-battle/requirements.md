# Squad Battle - Requirements Specification

## Overview
Squad Battle adalah fitur kompetisi real-time dimana 2-8 siswa mengerjakan soal yang sama secara bersamaan dan berkompetisi untuk mendapatkan skor tertinggi.

## User Stories

### US-1: Create Squad
**As a** student  
**I want to** create a squad and invite friends  
**So that** we can compete together in Squad Battle

**Acceptance Criteria:**
- Squad name (3-30 characters)
- Squad capacity: 2-8 members
- Invite via code (6-digit alphanumeric)
- Creator becomes squad leader

### US-2: Join Squad
**As a** student  
**I want to** join a squad using invite code  
**So that** I can participate in Squad Battles

**Acceptance Criteria:**
- Enter 6-digit invite code
- See squad name and member count before joining
- Confirm to join
- Cannot join if squad is full

### US-3: Start Squad Battle
**As a** squad leader  
**I want to** start a Squad Battle session  
**So that** all members can compete together

**Acceptance Criteria:**
- Only squad leader can start battle
- Minimum 2 members must be online
- Select difficulty: Easy, Medium, Hard
- 10 questions per battle
- 15 minutes time limit
- All members get same questions in same order

### US-4: Participate in Squad Battle
**As a** squad member  
**I want to** answer questions in real-time  
**So that** I can compete with my squad

**Acceptance Criteria:**
- See live leaderboard (updated after each question)
- See own rank and score
- See other members' progress (questions answered)
- Cannot see other members' answers
- Timer countdown visible
- Auto-submit when time expires

### US-5: View Squad Battle Results
**As a** squad member  
**I want to** see final results after battle  
**So that** I know my rank and performance

**Acceptance Criteria:**
- Final leaderboard with all members
- Own score, accuracy, rank
- Correct answers revealed
- Time taken per question
- Option to review all questions
- Save to history

### US-6: Squad Battle History
**As a** student  
**I want to** see my Squad Battle history  
**So that** I can track my performance over time

**Acceptance Criteria:**
- List of all battles participated
- Date, squad name, rank, score
- Filter by date range
- Sort by date, score, rank
- Click to view detailed results

## Technical Requirements

### Database Schema

```sql
-- Squads table
CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  leader_id UUID REFERENCES users(id) NOT NULL,
  max_members INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Squad members table
CREATE TABLE squad_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

-- Squad battles table
CREATE TABLE squad_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID REFERENCES squads(id) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT CHECK (status IN ('waiting', 'active', 'completed')) DEFAULT 'waiting',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Squad battle participants table
CREATE TABLE squad_battle_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES squad_battles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) NOT NULL,
  score INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  rank INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(battle_id, user_id)
);

-- Squad battle questions table (links battle to questions)
CREATE TABLE squad_battle_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES squad_battles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id) NOT NULL,
  question_order INTEGER NOT NULL,
  UNIQUE(battle_id, question_order)
);
```

### API Endpoints

```
POST   /api/squad/create          - Create new squad
POST   /api/squad/join             - Join squad with invite code
GET    /api/squad/:id              - Get squad details
DELETE /api/squad/:id/leave        - Leave squad
POST   /api/squad/:id/battle/start - Start new battle (leader only)
GET    /api/squad/battle/:id       - Get battle details
POST   /api/squad/battle/:id/answer - Submit answer
GET    /api/squad/battle/:id/leaderboard - Get live leaderboard
POST   /api/squad/battle/:id/complete - Complete battle
GET    /api/squad/battle/history   - Get user's battle history
```

### Real-time Features (Supabase Realtime)

```typescript
// Subscribe to battle updates
supabase
  .channel(`battle:${battleId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'squad_battle_participants'
  }, (payload) => {
    // Update leaderboard in real-time
  })
  .subscribe()
```

## MVP Scope (Phase 1)

**Include:**
- ✅ Create squad
- ✅ Join squad via invite code
- ✅ Start battle (10 questions, 15 minutes)
- ✅ Real-time leaderboard
- ✅ Battle results
- ✅ Battle history

**Exclude (Future):**
- ❌ Squad chat
- ❌ Squad badges/achievements
- ❌ School-wide leaderboard
- ❌ Custom battle settings
- ❌ Squad statistics

## Success Metrics

- Squad adoption ≥40% (40% students create/join squad)
- Squad retention ≥60% (participate in ≥2 battles/week)
- Average battle completion rate ≥80%
- Average members per battle ≥3

## Timeline

- **Day 1-2:** Database schema & API endpoints
- **Day 3-4:** Squad creation & management UI
- **Day 5-7:** Battle session & real-time features
- **Day 8-9:** Results & history
- **Day 10:** Testing & bug fixes

**Total:** 10 days
