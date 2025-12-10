-- Setup Cron Job for Auto-Start Battles
-- Run this in Supabase SQL Editor AFTER deploying edge function

-- ============================================================================
-- STEP 1: Enable pg_cron extension
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- STEP 2: Enable pg_net extension (for HTTP requests)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- STEP 3: Create cron job
-- ============================================================================

-- IMPORTANT: Replace these values before running:
-- 1. YOUR_PROJECT_REF: Get from Supabase Dashboard → Settings → General → Reference ID
-- 2. YOUR_SERVICE_ROLE_KEY: Get from Supabase Dashboard → Settings → API → service_role key

SELECT cron.schedule(
  'auto-start-battles',           -- Job name
  '* * * * *',                    -- Schedule: every minute
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-start-battles',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if cron job was created
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'auto-start-battles';

-- Expected output:
-- jobid | jobname              | schedule    | active | command
-- ------|----------------------|-------------|--------|----------
-- 1     | auto-start-battles   | * * * * *   | true   | SELECT net.http_post...

-- ============================================================================
-- MONITORING QUERIES
-- ============================================================================

-- View recent cron job runs
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;

-- Count successful vs failed runs (for the most recent job)
SELECT 
  status,
  COUNT(*) as count
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'auto-start-battles')
GROUP BY status;

-- ============================================================================
-- MANAGEMENT QUERIES
-- ============================================================================

-- Pause cron job (if needed)
-- UPDATE cron.job SET active = false WHERE jobname = 'auto-start-battles';

-- Resume cron job
-- UPDATE cron.job SET active = true WHERE jobname = 'auto-start-battles';

-- Delete cron job (if needed)
-- SELECT cron.unschedule('auto-start-battles');

-- ============================================================================
-- NOTES
-- ============================================================================

-- Cron Schedule Format: * * * * *
-- ┬ ┬ ┬ ┬ ┬
-- │ │ │ │ │
-- │ │ │ │ └─── day of week (0 - 7) (Sunday = 0 or 7)
-- │ │ │ └───── month (1 - 12)
-- │ │ └─────── day of month (1 - 31)
-- │ └───────── hour (0 - 23)
-- └─────────── minute (0 - 59)

-- Examples:
-- * * * * *        Every minute
-- */5 * * * *      Every 5 minutes
-- 0 * * * *        Every hour
-- 0 0 * * *        Every day at midnight
-- 0 9 * * 1        Every Monday at 9 AM

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If cron job fails, check:
-- 1. Edge function is deployed: supabase functions list
-- 2. Function URL is correct
-- 3. Service role key is correct (not anon key!)
-- 4. pg_cron and pg_net extensions are enabled
-- 5. Check function logs in Supabase Dashboard

-- Test edge function manually:
-- curl -X POST \
--   'https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-start-battles' \
--   -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
