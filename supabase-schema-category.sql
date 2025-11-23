-- ============================================
-- Add Category to Trackables
-- Run this AFTER the main supabase-schema.sql
-- ============================================

-- Add category column (task or habit)
ALTER TABLE trackables 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'habit' CHECK (category IN ('task', 'habit'));

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_trackables_category ON trackables(user_id, category);

-- Add comment for documentation
COMMENT ON COLUMN trackables.category IS 'Category of trackable: task (görev) or habit (alışkanlık)';

