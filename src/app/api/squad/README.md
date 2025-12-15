# Squad Battle API Documentation

## Overview
API endpoints untuk Squad Battle feature. Semua endpoints require authentication.

## Authentication
Semua endpoint memprioritaskan autentikasi via SSR cookies (Next.js + `@supabase/ssr`) untuk validasi sesi di server. Untuk kompatibilitas mundur, header `Authorization: Bearer <token>` tetap didukung sebagai fallback.

## Endpoints

### Squad Management

#### Create Squad
```
POST /api/squad/create
```

**Request Body:**
```json
{
  "name": "Squad Juara",
  "max_members": 8
}
```

**Response:**
```json
{
  "success": true,
  "squad": {
    "id": "uuid",
    "name": "Squad Juara",
    "invite_code": "ABC123",
    "leader_id": "uuid",
    "max_members": 8,
    "is_active": true,
    "created_at": "2025-12-08T...",
    "updated_at": "2025-12-08T..."
  },
  "invite_code": "ABC123"
}
```

#### Join Squad
```
POST /api/squad/join
```

**Request Body:**
```json
{
  "invite_code": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "squad": { ... },
  "member": { ... }
}
```

#### List User's Squads
```
GET /api/squad/list
```

**Response:**
```json
{
  "success": true,
  "squads": [
    {
      "id": "uuid",
      "name": "Squad Juara",
      "invite_code": "ABC123",
      "leader_id": "uuid",
      "max_members": 8,
      "is_active": true,
      "created_at": "2025-12-08T...",
      "updated_at": "2025-12-08T..."
    }
  ]
}
```

#### Get Squad Details
```
GET /api/squad/[id]
```

**Response:**
```json
{
  "success": true,
  "squad": { ... },
  "members": [
    {
      "id": "uuid",
      "squad_id": "uuid",
      "user_id": "uuid",
      "role": "leader",
      "is_active": true,
      "joined_at": "2025-12-08T...",
      "user_name": "John Doe",
      "user_email": "john@example.com"
    }
  ]
}
```

#### Leave Squad
```
POST /api/squad/[id]/leave
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully left the squad"
}
```

### Battle Management

#### Start Battle
```
POST /api/squad/battle/start
```

**Request Body:**
```json
{
  "squad_id": "uuid",
  "difficulty": "medium",
  "total_questions": 10,
  "time_limit_minutes": 15
}
```

**Response:**
```json
{
  "success": true,
  "battle": {
    "id": "uuid",
    "squad_id": "uuid",
    "difficulty": "medium",
    "status": "active",
    "total_questions": 10,
    "time_limit_minutes": 15,
    "started_at": "2025-12-08T...",
    "created_at": "2025-12-08T..."
  },
  "questions": [
    {
      "id": "uuid",
      "order": 1,
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "option_e": "...",
      "difficulty": "medium",
      "subtest_utbk": "PM",
      "hint_text": "..."
    }
  ]
}
```

#### Get Battle Details
```
GET /api/squad/battle/[id]
```

**Response:**
```json
{
  "success": true,
  "battle": { ... },
  "questions": [ ... ]
}
```

#### Submit Answer
```
POST /api/squad/battle/[id]/answer
```

**Request Body:**
```json
{
  "question_id": "uuid",
  "selected_answer": "A",
  "time_spent_seconds": 45
}
```

**Response:**
```json
{
  "success": true,
  "is_correct": true,
  "correct_answer": "A"
}
```

#### Get Leaderboard
```
GET /api/squad/battle/[id]/leaderboard
```

**Response:**
```json
{
  "success": true,
  "leaderboard": {
    "battle_id": "uuid",
    "participants": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "user_name": "John Doe",
        "score": 8,
        "correct_answers": 8,
        "total_questions": 10,
        "accuracy": 80.00,
        "rank": 1,
        "is_current_user": true
      }
    ],
    "current_user_rank": 1,
    "total_participants": 4,
    "updated_at": "2025-12-08T..."
  }
}
```

#### Complete Battle
```
POST /api/squad/battle/[id]/complete
```

**Response:**
```json
{
  "success": true,
  "final_rank": 1,
  "final_score": 8,
  "accuracy": 80.00,
  "leaderboard": { ... }
}
```

#### Get Battle History
```
GET /api/squad/battle/history
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "battle_id": "uuid",
      "squad_name": "Squad Juara",
      "date": "2025-12-08T...",
      "rank": 1,
      "score": 8,
      "accuracy": 80.00,
      "total_participants": 4,
      "difficulty": "medium"
    }
  ]
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not allowed)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Squad Name
- Minimum 3 characters
- Maximum 30 characters

### Invite Code
- Exactly 6 alphanumeric characters (uppercase)
- Auto-generated, unique

### Max Members
- Minimum 2
- Maximum 8

### Difficulty
- Must be: `easy`, `medium`, or `hard`

### Total Questions
- Minimum 5
- Maximum 20
- Default: 10

### Time Limit
- Minimum 5 minutes
- Maximum 30 minutes
- Default: 15 minutes

### Answer Format
- Must be: `A`, `B`, `C`, `D`, or `E`

## Real-time Updates

For real-time leaderboard updates, use Supabase Realtime:

```typescript
supabase
  .channel(`battle:${battleId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'squad_battle_participants'
  }, (payload) => {
    // Refresh leaderboard
  })
  .subscribe()
```

## Testing

Use these test accounts:
- Student: test@kognisia.com / test123456
- Teacher: guru@kognisia.com / guru123456

## Notes

- Only squad leaders can start battles
- Minimum 2 members must be in squad to start battle
- Correct answers are not sent to client during active battle
- Leaderboard updates in real-time as participants answer
- Battle auto-completes when all participants finish
