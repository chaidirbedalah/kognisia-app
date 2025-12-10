-- Setup Cron Job for Auto-Start Battles (SIMPLE VERSION)
-- Run this in Supabase SQL Editor AFTER deploying edge function

-- ============================================================================
-- STEP 1: Enable extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- STEP 2: Create cron job
-- ============================================================================

-- IMPORTANT: Replace these values before running:
-- 1. YOUR_PROJECT_REF: Get from Supabase Dashboard → Settings → General → Reference ID
-- 2. YOUR_SERVICE_ROLE_KEY: Get from Supabase Dashboard → Settings → API → service_role key

SELECT cron.schedule(
  'auto-start-battles',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-start-battles',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- STEP 3: Verify cron job created
-- ============================================================================

SELECT * FROM cron.job;

-- Expected: You should see a row with jobname = 'auto-start-battles'
