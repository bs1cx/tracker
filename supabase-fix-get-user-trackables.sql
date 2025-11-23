-- Fix get_user_trackables function return type issue
-- This script drops the old function and recreates it with the updated return type

-- Create trackable_priority enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE trackable_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_user_trackables(uuid);

-- Recreate the function with the updated return type
CREATE OR REPLACE FUNCTION get_user_trackables(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    type trackable_type,
    status TEXT,
    current_value INTEGER,
    target_value INTEGER,
    last_completed_at TIMESTAMPTZ,
    reset_frequency reset_frequency,
    priority trackable_priority,
    scheduled_time TIME,
    selected_days TEXT[],
    category TEXT,
    start_date DATE,
    scheduled_date TIMESTAMPTZ,
    is_recurring BOOLEAN,
    recurrence_rule JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_completed_today BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.user_id,
        t.title,
        t.type,
        t.status,
        t.current_value,
        t.target_value,
        t.last_completed_at,
        t.reset_frequency,
        t.priority,
        t.scheduled_time,
        t.selected_days,
        t.category,
        t.start_date,
        t.scheduled_date,
        t.is_recurring,
        t.recurrence_rule,
        t.created_at,
        t.updated_at,
        CASE 
            WHEN t.type = 'DAILY_HABIT' THEN
                (t.last_completed_at IS NOT NULL AND DATE(t.last_completed_at) = CURRENT_DATE)
            WHEN t.type = 'ONE_TIME' THEN
                (t.status = 'completed')
            ELSE
                FALSE
        END as is_completed_today
    FROM trackables t
    WHERE t.user_id = p_user_id
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION get_user_trackables(uuid) IS 'Returns all trackables for a user with completion status for today';

