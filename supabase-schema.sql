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

