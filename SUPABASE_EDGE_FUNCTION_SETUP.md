# Supabase Edge Function Setup Guide

## Overview

Edge Function untuk auto-start scheduled battles dan send reminders setiap menit.

## Prerequisites

1. Supabase CLI installed
2. Supabase project created
3. Migrations 014 & 015 already run

## Step-by-Step Setup

### 1. Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

**Or via NPM:**
```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

Ini akan membuka browser untuk authenticate.

### 3. Link Project

```bash
cd kognisia-app
supabase link --project-ref YOUR_PROJECT_REF
```

**Cara dapat PROJECT_REF:**
1. Buka Supabase Dashboard
2. Pilih project Kognisia
3. Settings → General
4. Copy "Reference ID"

### 4. Deploy Edge Function

```bash
supabase functions deploy auto-start-battles
```

Output:
```
Deploying auto-start-battles (project ref: YOUR_PROJECT_REF)
✓ Deployed Function auto-start-battles
Function URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-start-battles
```

### 5. Test Edge Function Manually

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-start-battles' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

Expected response:
```json
{
  "success": true,
  "message": "Auto-start cron job completed successfully",
  "scheduled_battles": 0,
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

### 6. Setup Cron Schedule

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to Supabase Dashboard
2. Database → Cron Jobs (pg_cron extension)
3. Click "Create a new cron job"
4. Fill in:
   - **Name**: `auto-start-battles`
   - **Schedule**: `* * * * *` (every minute)
   - **Command**: 
     ```sql
     SELECT
       net.http_post(
         url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-start-battles',
         headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
       ) as request_id;
     ```
5. Click "Create"

**Option B: Via SQL**

Run this in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job to run every minute
SELECT cron.schedule(
  'auto-start-battles',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-start-battles',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

**Get YOUR_SERVICE_ROLE_KEY:**
1. Supabase Dashboard
2. Settings → API
3. Copy "service_role" key (secret!)

### 7. Verify Cron Job

Check if cron job is running:

```sql
SELECT * FROM cron.job;
```

Check cron job history:

```sql
SELECT * FROM cron.job_run_details 
WHERE jobname = 'auto-start-battles'
ORDER BY start_time DESC 
LIMIT 10;
```

### 8. Monitor Edge Function Logs

**Via Dashboard:**
1. Edge Functions → auto-start-battles
2. Click "Logs" tab
3. See real-time execution logs

**Via CLI:**
```bash
supabase functions logs auto-start-battles
```

## Troubleshooting

### Issue: Function not found
**Solution:** Make sure you deployed the function:
```bash
supabase functions deploy auto-start-battles
```

### Issue: Permission denied
**Solution:** Use service_role key, not anon key in cron job

### Issue: Cron not running
**Solution:** Check pg_cron extension is enabled:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

### Issue: Function timeout
**Solution:** Edge functions have 150s timeout by default. Our function should complete in <1s.

## Testing Flow

### 1. Create a test battle scheduled for 2 minutes from now

```sql
-- In Supabase SQL Editor
INSERT INTO squad_battles (
  squad_id,
  difficulty,
  battle_type,
  total_questions,
  time_limit_minutes,
  status,
  scheduled_start_at
)
SELECT 
  id,
  'medium',
  'subtest',
  10,
  15,
  'scheduled',
  NOW() + INTERVAL '2 minutes'
FROM squads
LIMIT 1;
```

### 2. Wait 2 minutes and check

```sql
-- Check if battle auto-started
SELECT id, status, scheduled_start_at, started_at
FROM squad_battles
WHERE status = 'active'
ORDER BY started_at DESC
LIMIT 1;
```

### 3. Check notifications sent

```sql
-- Check if notifications were created
SELECT * FROM battle_notifications
WHERE notification_type = 'battle_started'
ORDER BY created_at DESC
LIMIT 10;
```

## Cost Estimation

**Free Tier:**
- 500,000 invocations/month
- Our usage: 43,200 calls/month (1 per minute)
- **Usage: 8.6%** of free tier
- **Cost: $0/month** ✅

**Pro Tier ($25/month):**
- 2,000,000 invocations/month
- **Usage: 2.16%** of pro tier
- Still **$0 extra** for edge functions

## Maintenance

### Update Function Code

1. Edit `supabase/functions/auto-start-battles/index.ts`
2. Deploy:
   ```bash
   supabase functions deploy auto-start-battles
   ```

### Delete Cron Job

```sql
SELECT cron.unschedule('auto-start-battles');
```

### Pause Cron Job

```sql
-- Disable
UPDATE cron.job SET active = false WHERE jobname = 'auto-start-battles';

-- Enable
UPDATE cron.job SET active = true WHERE jobname = 'auto-start-battles';
```

## Security Notes

- ✅ Service role key is stored securely in Supabase
- ✅ Edge function runs in isolated environment
- ✅ No public endpoint exposure needed
- ✅ All communication internal to Supabase

## Next Steps

After setup:
1. ✅ Test with a 2-minute scheduled battle
2. ✅ Monitor logs for first few runs
3. ✅ Verify notifications are sent
4. ✅ Check auto-start works correctly
5. ✅ Let it run and forget it! 🚀

## Support

If issues persist:
1. Check Supabase status: https://status.supabase.com
2. View function logs in dashboard
3. Check cron job history
4. Review database function logs
