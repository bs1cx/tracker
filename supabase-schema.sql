-- ============================================
-- Life Tracker Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Trackable type enum
CREATE TYPE trackable_type AS ENUM ('DAILY_HABIT', 'ONE_TIME', 'PROGRESS');

-- Reset frequency enum
CREATE TYPE reset_frequency AS ENUM ('daily', 'weekly', 'none');

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trackables table (main table for items)
CREATE TABLE IF NOT EXISTS trackables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type trackable_type NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
    current_value INTEGER DEFAULT 0, -- For series/counters
    target_value INTEGER, -- Optional target (e.g., total episodes)
    last_completed_at TIMESTAMPTZ,
    reset_frequency reset_frequency DEFAULT 'none',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_progress_values CHECK (
        (type = 'PROGRESS' AND current_value >= 0) OR
        (type != 'PROGRESS')
    )
);

-- Logs table (track history of completions)
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trackable_id UUID NOT NULL REFERENCES trackables(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'completed', 'incremented', 'decremented', 'reset'
    previous_value INTEGER,
    new_value INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_trackables_user_id ON trackables(user_id);
CREATE INDEX IF NOT EXISTS idx_trackables_type ON trackables(type);
CREATE INDEX IF NOT EXISTS idx_trackables_status ON trackables(status);
CREATE INDEX IF NOT EXISTS idx_logs_trackable_id ON logs(trackable_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for trackables updated_at
CREATE TRIGGER update_trackables_updated_at
    BEFORE UPDATE ON trackables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to handle daily reset for habits
CREATE OR REPLACE FUNCTION reset_daily_habits()
RETURNS void AS $$
BEGIN
    UPDATE trackables
    SET 
        status = 'active',
        last_completed_at = NULL
    WHERE 
        type = 'DAILY_HABIT' 
        AND reset_frequency = 'daily'
        AND (
            last_completed_at IS NULL 
            OR last_completed_at < DATE_TRUNC('day', NOW())
        );
END;
$$ LANGUAGE plpgsql;

-- Function to handle weekly reset for habits
CREATE OR REPLACE FUNCTION reset_weekly_habits()
RETURNS void AS $$
BEGIN
    UPDATE trackables
    SET 
        status = 'active',
        last_completed_at = NULL
    WHERE 
        type = 'DAILY_HABIT' 
        AND reset_frequency = 'weekly'
        AND (
            last_completed_at IS NULL 
            OR last_completed_at < DATE_TRUNC('week', NOW())
        );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trackables ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trackables policies
CREATE POLICY "Users can view own trackables"
    ON trackables FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trackables"
    ON trackables FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trackables"
    ON trackables FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trackables"
    ON trackables FOR DELETE
    USING (auth.uid() = user_id);

-- Logs policies
CREATE POLICY "Users can view own logs"
    ON logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
    ON logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS FOR APPLICATION
-- ============================================

-- Function to get trackables with reset logic applied
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
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_completed_today BOOLEAN
) AS $$
BEGIN
    -- Reset daily habits if needed
    PERFORM reset_daily_habits();
    
    -- Reset weekly habits if needed
    PERFORM reset_weekly_habits();
    
    -- Return trackables with completion status
    RETURN QUERY
    SELECT 
        t.id,
        t.user_id,
        t.title,
        t.type,
        CASE 
            WHEN t.type = 'DAILY_HABIT' AND t.last_completed_at >= DATE_TRUNC('day', NOW()) THEN 'completed'
            WHEN t.type = 'ONE_TIME' AND t.status = 'completed' THEN 'completed'
            ELSE 'active'
        END as status,
        t.current_value,
        t.target_value,
        t.last_completed_at,
        t.reset_frequency,
        t.created_at,
        t.updated_at,
        CASE 
            WHEN t.type = 'DAILY_HABIT' AND t.last_completed_at >= DATE_TRUNC('day', NOW()) THEN true
            WHEN t.type = 'ONE_TIME' AND t.status = 'completed' THEN true
            ELSE false
        END as is_completed_today
    FROM trackables t
    WHERE t.user_id = p_user_id
    ORDER BY 
        CASE t.type
            WHEN 'DAILY_HABIT' THEN 1
            WHEN 'ONE_TIME' THEN 2
            WHEN 'PROGRESS' THEN 3
        END,
        t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a trackable (handles both daily habits and one-time tasks)
CREATE OR REPLACE FUNCTION complete_trackable(p_trackable_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_trackable RECORD;
    v_user_id UUID;
    v_is_completed BOOLEAN;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Get trackable
    SELECT * INTO v_trackable
    FROM trackables
    WHERE id = p_trackable_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trackable not found';
    END IF;

    -- Determine if currently completed
    IF v_trackable.type = 'DAILY_HABIT' THEN
        v_is_completed := v_trackable.last_completed_at >= DATE_TRUNC('day', NOW());
    ELSIF v_trackable.type = 'ONE_TIME' THEN
        v_is_completed := v_trackable.status = 'completed';
    ELSE
        RAISE EXCEPTION 'Invalid trackable type for completion';
    END IF;

    -- Update trackable
    IF v_trackable.type = 'DAILY_HABIT' THEN
        -- Toggle completion for daily habits
        UPDATE trackables
        SET last_completed_at = CASE 
            WHEN v_is_completed THEN NULL 
            ELSE NOW() 
        END,
        updated_at = NOW()
        WHERE id = p_trackable_id AND user_id = v_user_id;
    ELSIF v_trackable.type = 'ONE_TIME' THEN
        -- Toggle completion for one-time tasks
        UPDATE trackables
        SET status = CASE 
            WHEN v_is_completed THEN 'active' 
            ELSE 'completed' 
        END,
        updated_at = NOW()
        WHERE id = p_trackable_id AND user_id = v_user_id;
    END IF;

    -- Log the action
    INSERT INTO logs (trackable_id, user_id, action, previous_value, new_value)
    VALUES (p_trackable_id, v_user_id, 'completed', v_trackable.current_value, v_trackable.current_value);

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment progress
CREATE OR REPLACE FUNCTION increment_progress(p_trackable_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS JSONB AS $$
DECLARE
    v_trackable RECORD;
    v_user_id UUID;
    v_new_value INTEGER;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Get trackable
    SELECT * INTO v_trackable
    FROM trackables
    WHERE id = p_trackable_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trackable not found';
    END IF;

    IF v_trackable.type != 'PROGRESS' THEN
        RAISE EXCEPTION 'Trackable is not a progress type';
    END IF;

    -- Calculate new value
    v_new_value := v_trackable.current_value + p_amount;

    -- Update trackable
    UPDATE trackables
    SET current_value = v_new_value,
        updated_at = NOW()
    WHERE id = p_trackable_id AND user_id = v_user_id;

    -- Log the action
    INSERT INTO logs (trackable_id, user_id, action, previous_value, new_value)
    VALUES (p_trackable_id, v_user_id, 'incremented', v_trackable.current_value, v_new_value);

    RETURN jsonb_build_object('success', true, 'new_value', v_new_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement progress
CREATE OR REPLACE FUNCTION decrement_progress(p_trackable_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_trackable RECORD;
    v_user_id UUID;
    v_new_value INTEGER;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Get trackable
    SELECT * INTO v_trackable
    FROM trackables
    WHERE id = p_trackable_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trackable not found';
    END IF;

    IF v_trackable.type != 'PROGRESS' THEN
        RAISE EXCEPTION 'Trackable is not a progress type';
    END IF;

    -- Calculate new value (ensure it doesn't go below 0)
    v_new_value := GREATEST(0, v_trackable.current_value - 1);

    -- Update trackable
    UPDATE trackables
    SET current_value = v_new_value,
        updated_at = NOW()
    WHERE id = p_trackable_id AND user_id = v_user_id;

    -- Log the action
    INSERT INTO logs (trackable_id, user_id, action, previous_value, new_value)
    VALUES (p_trackable_id, v_user_id, 'decremented', v_trackable.current_value, v_new_value);

    RETURN jsonb_build_object('success', true, 'new_value', v_new_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

