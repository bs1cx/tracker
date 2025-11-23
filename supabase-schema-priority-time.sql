-- ============================================
-- Add Priority and Scheduled Time to Trackables
-- Run this AFTER the main supabase-schema.sql
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

