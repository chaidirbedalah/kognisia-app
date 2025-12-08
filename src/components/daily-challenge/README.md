# Daily Challenge Components

## Overview

This directory contains components for the UTBK 2026 Daily Challenge feature with mode selection:

1. **DailyChallengeModeSelectorComponent**: Choose between Balanced and Focus modes
2. **SubtestSelectorComponent**: Select a specific subtest for Focus mode

### Daily Challenge Modes

1. **Balanced Mode (Mode Seimbang)**: 18 questions (3 from each of 6 subtests)
2. **Focus Mode (Mode Fokus)**: 10 questions (all from one selected subtest)

## Features

- ✅ Two visually distinct mode cards with icons and descriptions
- ✅ Clear display of question counts and estimated duration
- ✅ Detailed feature lists for each mode
- ✅ Callback handler for mode selection
- ✅ Responsive design (mobile and desktop)
- ✅ Hover effects and smooth transitions
- ✅ Helpful tips section

## Usage

```tsx
import { DailyChallengeModeSelectorComponent } from '@/components/daily-challenge/DailyChallengeModeSelectorComponent'
import { DailyChallengeMode } from '@/lib/types'

function DailyChallengePage() {
  const handleModeSelect = (mode: DailyChallengeMode) => {
    if (mode === 'balanced') {
      // Fetch 18 questions (3 from each subtest)
      // Navigate to question screen
    } else if (mode === 'focus') {
      // Show subtest selector
      // Then fetch 10 questions from selected subtest
    }
  }

  return (
    <DailyChallengeModeSelectorComponent 
      onModeSelect={handleModeSelect}
    />
  )
}
```

## Props

### `DailyChallengeModeSelectorProps`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onModeSelect` | `(mode: DailyChallengeMode) => void` | Yes | Callback function called when user selects a mode |

## Mode Details

### Balanced Mode (⚖️)
- **Question Count**: 18 soal
- **Distribution**: 3 soal dari setiap subtes
- **Subtests**: All 6 UTBK 2026 subtests
- **Duration**: ~27 minutes (estimated)
- **Use Case**: Daily routine practice, maintaining well-rounded preparation

### Focus Mode (🎯)
- **Question Count**: 10 soal
- **Distribution**: All from one selected subtest
- **Subtests**: User chooses 1 of 6 subtests
- **Duration**: ~15 minutes (estimated)
- **Use Case**: Strengthening weak areas, deep practice in specific subject

## Requirements Validation

This component satisfies the following requirements from the UTBK 2026 Compliance spec:

- ✅ **Requirement 2.1**: Display two mode options before showing questions
- ✅ **Requirement 2.2**: Provide "Balanced Mode" option with 18 questions (3 from each of 6 subtests)
- ✅ **Requirement 2.3**: Provide "Focus Mode" option with 10 questions from one subtest

## Design Decisions

1. **Visual Hierarchy**: Large icons and clear titles make mode selection intuitive
2. **Information Architecture**: Question count is prominently displayed with estimated duration
3. **Feature Lists**: Checkmark lists help users understand what each mode offers
4. **Call-to-Action**: Large, gradient buttons encourage selection
5. **Educational Content**: Tips section helps users make informed choices
6. **Responsive Layout**: Grid layout adapts from 2 columns (desktop) to 1 column (mobile)

## Styling

The component uses:
- Tailwind CSS for styling
- Gradient backgrounds for visual appeal
- Hover effects for interactivity
- Card components from shadcn/ui
- Smooth transitions for professional feel

## Next Steps

After mode selection:
1. **Balanced Mode**: Proceed directly to fetch 18 questions
2. **Focus Mode**: Show `SubtestSelectorComponent` (Task 7) to choose subtest

## Testing

The component can be tested by:
1. Visual inspection in browser
2. Verifying callback is called with correct mode
3. Checking responsive behavior on different screen sizes
4. Ensuring accessibility (keyboard navigation, screen readers)

---

# Subtest Selector Component

## Overview

The `SubtestSelectorComponent` provides a user interface for students to choose one of the 6 UTBK 2026 subtests for Focus Mode practice.

## Features

- ✅ Display all 6 UTBK 2026 subtests with icons and descriptions
- ✅ Fetch subtest data from database (with fallback to constants)
- ✅ Show UTBK question count and duration for each subtest
- ✅ Loading state while fetching data
- ✅ Error handling with retry option
- ✅ Back button to return to mode selection
- ✅ Responsive grid layout (1-3 columns)
- ✅ Hover effects and smooth transitions
- ✅ Helpful tips section

## Usage

```tsx
import { SubtestSelectorComponent } from '@/components/daily-challenge/SubtestSelectorComponent'

function DailyChallengePage() {
  const handleSubtestSelect = (subtestCode: string) => {
    // Fetch 10 questions from selected subtest
    // Navigate to question screen
    console.log('Selected subtest:', subtestCode)
  }

  const handleBack = () => {
    // Return to mode selection
    console.log('Going back to mode selection')
  }

  return (
    <SubtestSelectorComponent 
      onSelect={handleSubtestSelect}
      onBack={handleBack}
    />
  )
}
```

## Props

### `SubtestSelectorProps`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSelect` | `(subtestCode: string) => void` | Yes | Callback function called when user selects a subtest |
| `onBack` | `() => void` | No | Optional callback to return to previous screen (mode selector) |

## Subtest Display

Each subtest card shows:
- **Icon**: Visual identifier (emoji)
- **Name**: Full subtest name in Indonesian
- **Description**: Brief explanation of what the subtest covers
- **Question Count**: "10 Soal" for Focus Mode
- **UTBK Info**: Official UTBK question count and duration

### UTBK 2026 Subtests

1. **PPU** 🌍 - Pengetahuan & Pemahaman Umum
2. **PBM** 📖 - Pemahaman Bacaan & Menulis
3. **PK** 🔢 - Pengetahuan Kuantitatif
4. **LIT_INDO** 📚 - Literasi Bahasa Indonesia
5. **LIT_ING** 🌐 - Literasi Bahasa Inggris
6. **PM** 🧮 - Penalaran Matematika

## Data Fetching

The component fetches subtest data from the database using `fetchSubtests()` from `@/lib/subtests-api`:

```typescript
// Fetches from database, falls back to constants if unavailable
const subtests = await fetchSubtests()
```

### States

1. **Loading**: Shows spinner while fetching data
2. **Error**: Shows error message with back button
3. **Success**: Shows subtest cards for selection

## Requirements Validation

This component satisfies the following requirements from the UTBK 2026 Compliance spec:

- ✅ **Requirement 2.4**: Display all 6 subtests as selectable options when Focus mode is selected
- ✅ **Requirement 4.1**: Show subtest selection screen for Focus mode
- ✅ **Requirement 4.2**: Display subtests with descriptive names and icons

## Design Decisions

1. **Data Source**: Fetches from database to ensure consistency with backend
2. **Fallback Strategy**: Uses constants if database is unavailable
3. **Visual Design**: Matches mode selector styling for consistency
4. **Information Display**: Shows both Focus mode (10 questions) and UTBK context
5. **Navigation**: Optional back button for better UX
6. **Grid Layout**: 3 columns on large screens, 2 on medium, 1 on mobile
7. **Loading States**: Clear feedback during data fetching

## Integration Flow

```
Mode Selector → Focus Mode Selected → Subtest Selector → Subtest Selected → Questions
```

Complete example in `example-integration.tsx`.

## Related Components

- `DailyChallengeModeSelectorComponent`: Shown before subtest selection
- Daily Challenge question screen: Shown after subtest selection
