# 🏆 Squad Battle Leaderboard - Implementation Guide

## 📋 Overview

Implementasi lengkap Squad Battle Leaderboard system dengan real-time ranking, performance metrics, dan achievement badges.

## ✨ Features Implemented

### 1. **Real-time Leaderboard**
- Live ranking berdasarkan score dan accuracy
- Auto-refresh setiap 5 detik
- Menampilkan status (In Progress / Completed)

### 2. **Performance Metrics**
- Score (jumlah jawaban benar)
- Accuracy (persentase akurasi)
- Time taken (waktu yang digunakan)
- Correct answers (jumlah jawaban benar)

### 3. **Achievement Badges**
- 🥇 1st Place - Gold
- 🥈 2nd Place - Silver
- 🥉 3rd Place - Bronze

### 4. **Battle Statistics**
- Total participants
- Completed participants
- Average score
- Average accuracy

## 🗂️ Files Created

### **API Endpoints**
```
src/app/api/squad/battle/[id]/leaderboard/route.ts
```
- GET `/api/squad/battle/{battleId}/leaderboard`
- Returns: Leaderboard data dengan user info, stats, dan rankings

### **React Components**
```
src/components/squad/BattleLeaderboard.tsx
```
- Reusable leaderboard component
- Auto-refresh capability
- Responsive design
- Real-time updates

### **Pages**
```
src/app/squad/battle/[id]/leaderboard/page.tsx
```
- Dedicated leaderboard page
- Full-screen view
- Navigation controls

### **Hooks**
```
src/hooks/useLeaderboard.ts
```
- Custom hook untuk fetch leaderboard data
- Auto-refresh logic
- Error handling

### **Updated Files**
```
src/app/squad/battle/[id]/waiting/page.tsx
```
- Added leaderboard link button
- Trophy icon
- Direct navigation to leaderboard

## 🔧 Technical Implementation

### **Database Queries**
```sql
-- Get leaderboard dengan user info
SELECT 
  sbp.*,
  u.id, u.full_name, u.email, u.avatar_url
FROM squad_battle_participants sbp
JOIN users u ON sbp.user_id = u.id
WHERE sbp.battle_id = $1
ORDER BY sbp.score DESC, sbp.accuracy DESC, sbp.time_taken_seconds ASC
```

### **Scoring Algorithm**
```
Score = Correct Answers
Accuracy = Correct Answers / Total Questions
Ranking = ORDER BY score DESC, accuracy DESC, time_taken_seconds ASC
```

### **Real-time Updates**
- Auto-refresh interval: 5 seconds (configurable)
- Polling mechanism via fetch API
- Automatic cleanup on component unmount

## 📊 Data Structure

### **Leaderboard Entry**
```typescript
{
  id: string
  user_id: string
  score: number
  correct_answers: number
  total_questions: number
  accuracy: number (0-1)
  rank: number
  badge: string | null
  time_taken_seconds: number | null
  completed_at: string | null
  user: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  }
}
```

### **Battle Statistics**
```typescript
{
  total_participants: number
  completed_participants: number
  average_score: number
  average_accuracy: number
}
```

## 🎨 UI/UX Features

### **Leaderboard Table**
- Rank column dengan trophy icons
- User info dengan avatar
- Score display
- Accuracy progress bar
- Time taken display
- Status badge (In Progress / Completed)

### **Stats Cards**
- Total participants
- Completed participants
- Average score
- Average accuracy

### **Visual Hierarchy**
- 1st place: Yellow background
- 2nd place: Gray background
- 3rd place: Orange background
- Others: White background

### **Responsive Design**
- Mobile-friendly table
- Horizontal scroll on small screens
- Adaptive grid layout

## 🚀 Usage

### **Display Leaderboard Component**
```tsx
import { BattleLeaderboard } from '@/components/squad/BattleLeaderboard'

<BattleLeaderboard 
  battleId={battleId}
  autoRefresh={true}
  refreshInterval={5000}
/>
```

### **Use Leaderboard Hook**
```tsx
import { useLeaderboard } from '@/hooks/useLeaderboard'

const { leaderboard, stats, loading, error, refetch } = useLeaderboard(battleId)
```

### **Access Leaderboard Page**
```
/squad/battle/{battleId}/leaderboard
```

## 📈 Performance Considerations

### **Optimization**
- Efficient database queries dengan select specific fields
- Pagination ready (limit parameter)
- Caching potential dengan React Query
- Minimal re-renders dengan proper state management

### **Scalability**
- Supports unlimited participants
- Efficient sorting algorithm
- Configurable refresh interval
- Can handle high-frequency updates

## 🔐 Security

### **Authorization**
- API endpoint validates battle access
- User can only see leaderboard for battles they're part of
- Server-side validation

### **Data Privacy**
- Only necessary user info displayed (name, email, avatar)
- No sensitive data exposed
- Follows Supabase RLS policies

## 🧪 Testing Scenarios

### **Test Cases**
1. ✅ Load leaderboard dengan 0 participants
2. ✅ Load leaderboard dengan multiple participants
3. ✅ Real-time update saat participant menambah score
4. ✅ Ranking update otomatis
5. ✅ Badge assignment untuk top 3
6. ✅ Accuracy calculation
7. ✅ Time tracking
8. ✅ Status update (In Progress → Completed)

## 🎯 Future Enhancements

### **Priority 2 Features**
1. **Achievement System**
   - Unlock badges berdasarkan performance
   - Achievement history
   - Badge showcase di profile

2. **Advanced Leaderboard**
   - Weekly/monthly rankings
   - HOTS vs Regular comparison
   - Performance trends
   - Skill-based rankings

3. **Notifications**
   - Rank change alerts
   - Achievement unlocked notifications
   - Battle reminders

### **Priority 3 Features**
1. **Analytics Dashboard**
   - Performance analytics
   - Trend analysis
   - Comparison tools

2. **Social Features**
   - Share leaderboard
   - Challenge friends
   - Team rankings

## 📝 API Documentation

### **GET /api/squad/battle/{battleId}/leaderboard**

**Response:**
```json
{
  "success": true,
  "battle": {
    "id": "string",
    "name": "string",
    "status": "scheduled|active|completed",
    "total_questions": number,
    "scheduled_start_at": "ISO8601",
    "is_hots_mode": boolean
  },
  "stats": {
    "total_participants": number,
    "completed_participants": number,
    "average_score": number,
    "average_accuracy": number
  },
  "leaderboard": [
    {
      "id": "string",
      "user_id": "string",
      "score": number,
      "correct_answers": number,
      "total_questions": number,
      "accuracy": number,
      "rank": number,
      "badge": "string|null",
      "time_taken_seconds": "number|null",
      "completed_at": "ISO8601|null",
      "user": {
        "id": "string",
        "full_name": "string",
        "email": "string",
        "avatar_url": "string|null"
      }
    }
  ]
}
```

## 🎉 Summary

**Squad Battle Leaderboard** adalah fitur premium yang:
- ✅ Meningkatkan engagement dengan real-time competition
- ✅ Memberikan instant feedback tentang performance
- ✅ Memotivasi users dengan achievement badges
- ✅ Scalable dan performant
- ✅ User-friendly dan responsive

**Ready untuk production deployment!** 🚀

---

**Next Priority:** Achievement System & Gamification Features 🎯