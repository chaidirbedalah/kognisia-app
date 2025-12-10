# Squad Battle Components

## Overview
UI components untuk Squad Battle feature.

## Components Created

### 1. Main Pages
- `src/app/squad/page.tsx` - Squad list & battle history ✅
- `src/app/squad/[id]/page.tsx` - Squad details & start battle ✅
- `src/app/squad/battle/[id]/page.tsx` - Battle session ✅
- `src/app/squad/battle/[id]/results/page.tsx` - Battle results ✅

### 2. Components
- `CreateSquadDialog.tsx` - Dialog untuk create squad ✅
- `JoinSquadDialog.tsx` - Dialog untuk join squad dengan invite code ✅
- `SquadCard.tsx` - Card untuk display squad info ✅
- `BattleHistoryList.tsx` - List battle history ✅
- `StartBattleDialog.tsx` - Dialog untuk start battle ✅
- `BattleQuestion.tsx` - Display question during battle ✅
- `BattleLeaderboard.tsx` - Live leaderboard with real-time updates ✅

## Features Implemented

### ✅ Completed
1. Squad creation with invite code
2. Join squad via invite code
3. List user's squads
4. Squad card with copy invite code
5. Leave squad
6. Battle history list
7. Squad details page with members list
8. Start battle dialog with difficulty selection
9. Battle session interface with timer
10. Question navigation and answer selection
11. Live leaderboard with real-time updates (Supabase Realtime)
12. Battle results page with final rankings
13. Responsive design
14. Loading states
15. Error handling

### ⏳ TODO
1. Database migration execution
2. Testing all flows
3. Squad chat (optional)
4. Squad statistics
5. Battle replay (optional)

## Usage

### Create Squad
```tsx
import { CreateSquadDialog } from '@/components/squad/CreateSquadDialog'

<CreateSquadDialog
  open={open}
  onOpenChange={setOpen}
  onSquadCreated={() => {
    // Refresh squad list
  }}
/>
```

### Join Squad
```tsx
import { JoinSquadDialog } from '@/components/squad/JoinSquadDialog'

<JoinSquadDialog
  open={open}
  onOpenChange={setOpen}
  onSquadJoined={() => {
    // Refresh squad list
  }}
/>
```

### Squad Card
```tsx
import { SquadCard } from '@/components/squad/SquadCard'

<SquadCard
  squad={squad}
  onSquadUpdated={() => {
    // Refresh data
  }}
/>
```

### Battle History
```tsx
import { BattleHistoryList } from '@/components/squad/BattleHistoryList'

<BattleHistoryList history={history} />
```

### Start Battle
```tsx
import { StartBattleDialog } from '@/components/squad/StartBattleDialog'

<StartBattleDialog
  open={open}
  onOpenChange={setOpen}
  squadId={squadId}
  onBattleStarted={(battleId) => {
    router.push(`/squad/battle/${battleId}`)
  }}
/>
```

### Battle Question
```tsx
import { BattleQuestion } from '@/components/squad/BattleQuestion'

<BattleQuestion
  question={question}
  selectedAnswer={selectedAnswer}
  onAnswerSelect={(questionId, answer) => {
    // Handle answer selection
  }}
  questionNumber={1}
  totalQuestions={10}
/>
```

### Live Leaderboard
```tsx
import { BattleLeaderboard } from '@/components/squad/BattleLeaderboard'

<BattleLeaderboard battleId={battleId} />
// Auto-refreshes every 5 seconds + real-time Supabase updates
```

## Styling
- Uses Tailwind CSS
- shadcn/ui components
- Purple theme for Squad Battle
- Responsive design (mobile-first)

## Navigation Flow
```
/squad
  ├── Create Squad → Show invite code
  ├── Join Squad → Enter code → Success
  └── View Squad → /squad/[id]
      ├── View Members
      ├── Start Battle → /squad/battle/[id]
      │   ├── Answer Questions
      │   ├── Live Leaderboard
      │   └── Complete → /squad/battle/[id]/results
      └── Leave Squad
```

## Next Steps
1. Create squad details page
2. Implement battle session
3. Add real-time features
4. Testing & bug fixes
