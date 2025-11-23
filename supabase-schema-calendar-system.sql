-- ============================================
-- Calendar System Schema Updates
-- Adds scheduled_date, is_recurring, and recurrence_rule
-- Run this AFTER the main supabase-schema.sql
-- ============================================

-- Add scheduled_date column (timestamptz for timezone-aware scheduling)
ALTER TABLE trackables
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ;

-- Add is_recurring column
ALTER TABLE trackables
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Add recurrence_rule column (JSONB for flexible recurrence patterns)
ALTER TABLE trackables
ADD COLUMN IF NOT EXISTS recurrence_rule JSONB;

-- Create index for scheduled_date queries (essential for calendar filtering)
CREATE INDEX IF NOT EXISTS idx_trackables_scheduled_date 
ON trackables(user_id, scheduled_date) 
WHERE scheduled_date IS NOT NULL;

-- Create index for recurring tasks
CREATE INDEX IF NOT EXISTS idx_trackables_recurring 
ON trackables(user_id, is_recurring) 
WHERE is_recurring = TRUE;

-- Create composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_trackables_user_date_range 
ON trackables(user_id, scheduled_date, start_date);

-- Add comments for documentation
COMMENT ON COLUMN trackables.scheduled_date IS 'Specific date/time when task should appear (timestamptz for timezone support)';
COMMENT ON COLUMN trackables.is_recurring IS 'Whether this task/habit repeats on a schedule';
COMMENT ON COLUMN trackables.recurrence_rule IS 'JSON rule for recurrence: {"frequency": "daily|weekly|monthly", "interval": 1, "daysOfWeek": [1,3,5], "endDate": "2025-12-31"}';

-- Migration: Set scheduled_date for existing tasks based on start_date
-- This ensures backward compatibility
UPDATE trackables
SET scheduled_date = (start_date || ' 00:00:00')::TIMESTAMPTZ
WHERE scheduled_date IS NULL 
  AND start_date IS NOT NULL;

-- For tasks with selected_days, set is_recurring = true
UPDATE trackables
SET is_recurring = TRUE,
    recurrence_rule = jsonb_build_object(
      'frequency', 'weekly',
      'daysOfWeek', (
        SELECT array_agg(
          CASE 
            WHEN value = 'Pazartesi' OR value = 'monday' THEN 1
            WHEN value = 'Salı' OR value = 'tuesday' THEN 2
            WHEN value = 'Çarşamba' OR value = 'wednesday' THEN 3
            WHEN value = 'Perşembe' OR value = 'thursday' THEN 4
            WHEN value = 'Cuma' OR value = 'friday' THEN 5
            WHEN value = 'Cumartesi' OR value = 'saturday' THEN 6
            WHEN value = 'Pazar' OR value = 'sunday' THEN 0
            ELSE NULL
          END
        )
        FROM unnest(selected_days) AS value
        WHERE value IS NOT NULL
      )
    )
WHERE selected_days IS NOT NULL 
  AND array_length(selected_days, 1) > 0
  AND is_recurring IS NULL;

