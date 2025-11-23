-- ============================================
-- Add Calendar and Selected Days to Trackables
-- Run this AFTER the main supabase-schema.sql
-- ============================================

-- Add selected_days column (array of day names: monday, tuesday, etc.)
ALTER TABLE trackables 
ADD COLUMN IF NOT EXISTS selected_days TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for day-based queries
CREATE INDEX IF NOT EXISTS idx_trackables_selected_days ON trackables USING GIN(selected_days);

-- Add comment for documentation
COMMENT ON COLUMN trackables.selected_days IS 'Array of selected days for recurring tasks (monday, tuesday, wednesday, thursday, friday, saturday, sunday)';

