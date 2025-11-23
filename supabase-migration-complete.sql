-- ============================================
-- Complete Migration Script
-- Run this AFTER the main supabase-schema.sql
-- This combines priority, scheduled_time, and selected_days migrations
-- ============================================

-- ============================================
-- 1. Add Priority and Scheduled Time
-- ============================================

-- Add priority column (low, medium, high)
ALTER TABLE trackables 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- Add scheduled_time column (TIME type for daily reminders)
ALTER TABLE trackables 
ADD COLUMN IF NOT EXISTS scheduled_time TIME;

-- Create index for priority filtering
CREATE INDEX IF NOT EXISTS idx_trackables_priority ON trackables(user_id, priority);

-- Create index for scheduled time queries
CREATE INDEX IF NOT EXISTS idx_trackables_scheduled_time ON trackables(user_id, scheduled_time);

-- ============================================
-- 2. Add Calendar and Selected Days
-- ============================================

-- Add selected_days column (array of day names: monday, tuesday, etc.)
ALTER TABLE trackables 
ADD COLUMN IF NOT EXISTS selected_days TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for day-based queries
CREATE INDEX IF NOT EXISTS idx_trackables_selected_days ON trackables USING GIN(selected_days);

-- Add comment for documentation
COMMENT ON COLUMN trackables.selected_days IS 'Array of selected days for recurring tasks (monday, tuesday, wednesday, thursday, friday, saturday, sunday)';

-- ============================================
-- Migration Complete
-- ============================================

