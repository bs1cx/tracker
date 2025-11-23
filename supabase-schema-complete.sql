-- ============================================
-- COMPLETE DATABASE SCHEMA - Yaşam Takipçisi
-- Run this script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Trackable type enum
DO $$ BEGIN
    CREATE TYPE trackable_type AS ENUM ('DAILY_HABIT', 'ONE_TIME', 'PROGRESS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Reset frequency enum
DO $$ BEGIN
    CREATE TYPE reset_frequency AS ENUM ('daily', 'weekly', 'none');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Priority enum
DO $$ BEGIN
    CREATE TYPE trackable_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- MAIN TABLES
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

-- Trackables table (main table for tasks/habits)
CREATE TABLE IF NOT EXISTS trackables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type trackable_type NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    current_value INTEGER DEFAULT 0,
    target_value INTEGER,
    last_completed_at TIMESTAMPTZ,
    reset_frequency reset_frequency DEFAULT 'none',
    
    -- Calendar system fields
    scheduled_date TIMESTAMPTZ, -- Specific date/time when task should appear
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSONB, -- {"frequency": "daily|weekly|monthly", "interval": 1, "daysOfWeek": [1,3,5], "endDate": "2025-12-31"}
    
    -- Legacy fields (for backward compatibility)
    priority trackable_priority DEFAULT 'medium',
    scheduled_time TIME, -- Time of day for reminder
    selected_days TEXT[], -- Days of week (legacy, use recurrence_rule instead)
    category TEXT CHECK (category IN ('task', 'habit')),
    start_date DATE, -- Start date for the task/habit
    
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
    action TEXT NOT NULL CHECK (action IN ('completed', 'incremented', 'decremented', 'reset')),
    previous_value INTEGER,
    new_value INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTH MODULE TABLES
-- ============================================

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    heart_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    weight DECIMAL(5,2),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_heart_rate CHECK (heart_rate > 0 AND heart_rate < 300),
    CONSTRAINT valid_weight CHECK (weight > 0 AND weight < 1000)
);

-- Sleep logs table
CREATE TABLE IF NOT EXISTS sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sleep_duration DECIMAL(4,2), -- Hours
    sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
    rem_duration DECIMAL(4,2), -- REM sleep in hours
    light_sleep_duration DECIMAL(4,2),
    deep_sleep_duration DECIMAL(4,2),
    sleep_efficiency DECIMAL(5,2), -- Percentage
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water intake table
CREATE TABLE IF NOT EXISTS water_intake (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_amount CHECK (amount_ml > 0)
);

-- Nutrition logs table
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calories INTEGER,
    carbs_grams DECIMAL(6,2),
    protein_grams DECIMAL(6,2),
    fat_grams DECIMAL(6,2),
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nutrition goals table
CREATE TABLE IF NOT EXISTS nutrition_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_calories INTEGER,
    daily_carbs_grams DECIMAL(6,2),
    daily_protein_grams DECIMAL(6,2),
    daily_fat_grams DECIMAL(6,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- MENTAL HEALTH MODULE TABLES
-- ============================================

-- Mood logs table
CREATE TABLE IF NOT EXISTS mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Motivation logs table
CREATE TABLE IF NOT EXISTS motivation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    motivation_score INTEGER CHECK (motivation_score >= 1 AND motivation_score <= 10),
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meditation sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    type TEXT CHECK (type IN ('breathing', 'mindfulness', 'guided', 'other')),
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0)
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTIVITY MODULE TABLES
-- ============================================

-- Pomodoro sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration_minutes INTEGER DEFAULT 25,
    completed BOOLEAN DEFAULT FALSE,
    task_title TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_pomodoro_duration CHECK (duration_minutes > 0 AND duration_minutes <= 60)
);

-- Focus sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    distractions INTEGER DEFAULT 0,
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_focus_duration CHECK (duration_minutes > 0)
);

-- Goals table (weekly/monthly goals)
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT CHECK (goal_type IN ('weekly', 'monthly', 'yearly')),
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FINANCE MODULE TABLES
-- ============================================

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'other')),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_expense_amount CHECK (amount > 0)
);

-- Income table
CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_income_amount CHECK (amount > 0)
);

-- Budget categories table
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    monthly_budget DECIMAL(10,2) NOT NULL,
    current_spent DECIMAL(10,2) DEFAULT 0,
    month_year TEXT NOT NULL, -- Format: "YYYY-MM"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_budget CHECK (monthly_budget > 0),
    UNIQUE(user_id, category_name, month_year)
);

-- ============================================
-- INDEXES
-- ============================================

-- Trackables indexes
CREATE INDEX IF NOT EXISTS idx_trackables_user_id ON trackables(user_id);
CREATE INDEX IF NOT EXISTS idx_trackables_user_status ON trackables(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trackables_scheduled_date ON trackables(user_id, scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trackables_recurring ON trackables(user_id, is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_trackables_user_date_range ON trackables(user_id, scheduled_date, start_date);
CREATE INDEX IF NOT EXISTS idx_trackables_category ON trackables(user_id, category);
CREATE INDEX IF NOT EXISTS idx_trackables_start_date ON trackables(user_id, start_date);

-- Logs indexes
CREATE INDEX IF NOT EXISTS idx_logs_trackable_id ON logs(trackable_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Health module indexes
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);

-- Mental health module indexes
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_motivation_logs_user_date ON motivation_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_date ON meditation_sessions(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, log_date);

-- Productivity module indexes
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON focus_sessions(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);

-- Finance module indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON expenses(user_id, category);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_month ON budget_categories(user_id, month_year);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trackables ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trackables policies
DROP POLICY IF EXISTS "Users can view own trackables" ON trackables;
CREATE POLICY "Users can view own trackables" ON trackables FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trackables" ON trackables;
CREATE POLICY "Users can insert own trackables" ON trackables FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trackables" ON trackables;
CREATE POLICY "Users can update own trackables" ON trackables FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trackables" ON trackables;
CREATE POLICY "Users can delete own trackables" ON trackables FOR DELETE USING (auth.uid() = user_id);

-- Logs policies
DROP POLICY IF EXISTS "Users can view own logs" ON logs;
CREATE POLICY "Users can view own logs" ON logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own logs" ON logs;
CREATE POLICY "Users can insert own logs" ON logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Health module policies
DROP POLICY IF EXISTS "Users can manage own health_metrics" ON health_metrics;
CREATE POLICY "Users can manage own health_metrics" ON health_metrics FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own sleep_logs" ON sleep_logs;
CREATE POLICY "Users can manage own sleep_logs" ON sleep_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own water_intake" ON water_intake;
CREATE POLICY "Users can manage own water_intake" ON water_intake FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own nutrition_logs" ON nutrition_logs;
CREATE POLICY "Users can manage own nutrition_logs" ON nutrition_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own nutrition_goals" ON nutrition_goals;
CREATE POLICY "Users can manage own nutrition_goals" ON nutrition_goals FOR ALL USING (auth.uid() = user_id);

-- Mental health module policies
DROP POLICY IF EXISTS "Users can manage own mood_logs" ON mood_logs;
CREATE POLICY "Users can manage own mood_logs" ON mood_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own motivation_logs" ON motivation_logs;
CREATE POLICY "Users can manage own motivation_logs" ON motivation_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own meditation_sessions" ON meditation_sessions;
CREATE POLICY "Users can manage own meditation_sessions" ON meditation_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own journal_entries" ON journal_entries;
CREATE POLICY "Users can manage own journal_entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);

-- Productivity module policies
DROP POLICY IF EXISTS "Users can manage own pomodoro_sessions" ON pomodoro_sessions;
CREATE POLICY "Users can manage own pomodoro_sessions" ON pomodoro_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own focus_sessions" ON focus_sessions;
CREATE POLICY "Users can manage own focus_sessions" ON focus_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- Finance module policies
DROP POLICY IF EXISTS "Users can manage own expenses" ON expenses;
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own income" ON income;
CREATE POLICY "Users can manage own income" ON income FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own budget_categories" ON budget_categories;
CREATE POLICY "Users can manage own budget_categories" ON budget_categories FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user trackables with completion status
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
        t.*,
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

-- Function to complete a trackable
CREATE OR REPLACE FUNCTION complete_trackable(
    p_trackable_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_trackable RECORD;
    v_is_completed BOOLEAN;
BEGIN
    -- Get trackable
    SELECT * INTO v_trackable
    FROM trackables
    WHERE id = p_trackable_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trackable not found';
    END IF;
    
    -- Check if currently completed
    IF v_trackable.type = 'DAILY_HABIT' THEN
        v_is_completed := (v_trackable.last_completed_at IS NOT NULL AND DATE(v_trackable.last_completed_at) = CURRENT_DATE);
        
        IF v_is_completed THEN
            -- Toggle off
            UPDATE trackables
            SET last_completed_at = NULL, updated_at = NOW()
            WHERE id = p_trackable_id;
        ELSE
            -- Toggle on
            UPDATE trackables
            SET last_completed_at = NOW(), updated_at = NOW()
            WHERE id = p_trackable_id;
            
            -- Log the action
            INSERT INTO logs (trackable_id, user_id, action, previous_value, new_value)
            VALUES (p_trackable_id, p_user_id, 'completed', NULL, NULL);
        END IF;
    ELSIF v_trackable.type = 'ONE_TIME' THEN
        v_is_completed := (v_trackable.status = 'completed');
        
        IF v_is_completed THEN
            -- Toggle off
            UPDATE trackables
            SET status = 'active', updated_at = NOW()
            WHERE id = p_trackable_id;
        ELSE
            -- Toggle on
            UPDATE trackables
            SET status = 'completed', last_completed_at = NOW(), updated_at = NOW()
            WHERE id = p_trackable_id;
            
            -- Log the action
            INSERT INTO logs (trackable_id, user_id, action, previous_value, new_value)
            VALUES (p_trackable_id, p_user_id, 'completed', NULL, NULL);
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment progress
CREATE OR REPLACE FUNCTION increment_progress(
    p_trackable_id UUID,
    p_user_id UUID,
    p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
    v_current_value INTEGER;
BEGIN
    SELECT current_value INTO v_current_value
    FROM trackables
    WHERE id = p_trackable_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trackable not found';
    END IF;
    
    UPDATE trackables
    SET current_value = current_value + p_amount, updated_at = NOW()
    WHERE id = p_trackable_id;
    
    INSERT INTO logs (trackable_id, user_id, action, previous_value, new_value)
    VALUES (p_trackable_id, p_user_id, 'incremented', v_current_value, v_current_value + p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement progress
CREATE OR REPLACE FUNCTION decrement_progress(
    p_trackable_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_current_value INTEGER;
BEGIN
    SELECT current_value INTO v_current_value
    FROM trackables
    WHERE id = p_trackable_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trackable not found';
    END IF;
    
    IF v_current_value > 0 THEN
        UPDATE trackables
        SET current_value = GREATEST(0, current_value - 1), updated_at = NOW()
        WHERE id = p_trackable_id;
        
        INSERT INTO logs (trackable_id, user_id, action, previous_value, new_value)
        VALUES (p_trackable_id, p_user_id, 'decremented', v_current_value, GREATEST(0, v_current_value - 1));
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE trackables IS 'Main table for tasks, habits, and progress trackers';
COMMENT ON COLUMN trackables.scheduled_date IS 'Specific date/time when task should appear (timestamptz for timezone support)';
COMMENT ON COLUMN trackables.is_recurring IS 'Whether this task/habit repeats on a schedule';
COMMENT ON COLUMN trackables.recurrence_rule IS 'JSON rule for recurrence: {"frequency": "daily|weekly|monthly", "interval": 1, "daysOfWeek": [1,3,5], "endDate": "2025-12-31"}';

