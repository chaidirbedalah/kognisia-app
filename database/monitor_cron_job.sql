-- Monitor Cron Job Status
-- Run these queries to check if cron job is working

-- ============================================================================
-- 1. Check if cron job exists
-- ============================================================================

SELECT 
  jobid,
  jobname,
  schedule,
  active
FROM cron.job;

-- ============================================================================
-- 2. View recent cron job runs (last 10)
-- ============================================================================

SELECT 
  runid,
  job_pid,
  status,
  return_message,
  start_time,
  end_time,
  (end_time - start_time) as duration
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;

-- ============================================================================
-- 3. Count success vs failed runs
-- ============================================================================

SELECT 
  status,
  COUNT(*) as count,
  MAX(start_time) as last_run
FROM cron.job_run_details
GROUP BY status;

-- ============================================================================
-- 4. Check scheduled battles (should auto-start)
-- ============================================================================

SELECT 
  id,
  squad_id,
  status,
  scheduled_start_at,
  started_at,
  CASE 
    WHEN scheduled_start_at <= NOW() AND status = 'scheduled' 
    THEN 'SHOULD HAVE STARTED!'
    ELSE 'OK'
  END as check_status
FROM squad_battles
WHERE status IN ('scheduled', 'active')
ORDER BY scheduled_start_at DESC;

-- ============================================================================
-- 5. Check battle notifications sent
-- ============================================================================

SELECT 
  notification_type,
  COUNT(*) as count,
  MAX(created_at) as last_sent
FROM battle_notifications
GROUP BY notification_type
ORDER BY last_sent DESC;

-- ============================================================================
-- MANAGEMENT COMMANDS
-- ============================================================================

-- Pause cron job
-- UPDATE cron.job SET active = false WHERE jobname = 'auto-start-battles';

-- Resume cron job
-- UPDATE cron.job SET active = true WHERE jobname = 'auto-start-battles';

-- Delete cron job
-- SELECT cron.unschedule('auto-start-battles');
