-- ============================================
-- Extended Schema for Advanced Features
-- Run this AFTER the main supabase-schema.sql
-- ============================================

-- ============================================
-- HEALTH TRACKING TABLES
-- ============================================

-- Heart Rate (Nabız) tracking
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'heart_rate', 'sleep', 'water', 'calories'
    value NUMERIC NOT NULL,
    unit TEXT, -- 'bpm', 'hours', 'ml', 'kcal'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Sleep tracking
CREATE TABLE IF NOT EXISTS sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sleep_duration_hours NUMERIC NOT NULL, -- Total sleep hours
    sleep_quality TEXT, -- 'poor', 'fair', 'good', 'excellent'
    rem_minutes INTEGER,
    light_minutes INTEGER,
    deep_minutes INTEGER,
    sleep_efficiency NUMERIC, -- Percentage (0-100)
    wake_times INTEGER, -- Number of times woke up
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water intake tracking
CREATE TABLE IF NOT EXISTS water_intake (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calorie and macro tracking
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    carbs_g NUMERIC DEFAULT 0,
    protein_g NUMERIC DEFAULT 0,
    fat_g NUMERIC DEFAULT 0,
    barcode TEXT, -- For barcode scanner
    meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily nutrition goals
CREATE TABLE IF NOT EXISTS nutrition_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calories_goal INTEGER,
    carbs_goal_g NUMERIC,
    protein_goal_g NUMERIC,
    fat_goal_g NUMERIC,
    water_goal_ml INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- MENTAL HEALTH TABLES
-- ============================================

-- Mood tracking
CREATE TABLE IF NOT EXISTS mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
    mood_label TEXT, -- 'happy', 'sad', 'anxious', 'calm', 'energetic', etc.
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Motivation score
CREATE TABLE IF NOT EXISTS motivation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    motivation_score INTEGER NOT NULL CHECK (motivation_score >= 1 AND motivation_score <= 10),
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Breathing exercises / Meditation sessions
CREATE TABLE IF NOT EXISTS meditation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL, -- 'breathing', 'meditation', 'mindfulness'
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood_score INTEGER,
    tags TEXT[], -- Array of tags
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTIVITY TABLES
-- ============================================

-- Pomodoro sessions
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_name TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 25,
    completed BOOLEAN DEFAULT false,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Focus mode sessions (notification blocking)
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly and monthly goals
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT NOT NULL, -- 'weekly', 'monthly', 'yearly'
    target_value NUMERIC,
    current_value NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FINANCE TABLES
-- ============================================

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL, -- 'food', 'transport', 'entertainment', 'bills', etc.
    description TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income
CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    source TEXT, -- 'salary', 'freelance', 'investment', etc.
    description TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget categories
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    monthly_limit NUMERIC NOT NULL,
    current_spent NUMERIC DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR NEW TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_motivation_logs_user_date ON motivation_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_date ON meditation_sessions(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON focus_sessions(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_budget_categories_user ON budget_categories(user_id);

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

-- Health metrics
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own health metrics"
    ON health_metrics FOR ALL
    USING (auth.uid() = user_id);

-- Sleep logs
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sleep logs"
    ON sleep_logs FOR ALL
    USING (auth.uid() = user_id);

-- Water intake
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own water intake"
    ON water_intake FOR ALL
    USING (auth.uid() = user_id);

-- Nutrition logs
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own nutrition logs"
    ON nutrition_logs FOR ALL
    USING (auth.uid() = user_id);

-- Nutrition goals
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own nutrition goals"
    ON nutrition_goals FOR ALL
    USING (auth.uid() = user_id);

-- Mood logs
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own mood logs"
    ON mood_logs FOR ALL
    USING (auth.uid() = user_id);

-- Motivation logs
ALTER TABLE motivation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own motivation logs"
    ON motivation_logs FOR ALL
    USING (auth.uid() = user_id);

-- Meditation sessions
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meditation sessions"
    ON meditation_sessions FOR ALL
    USING (auth.uid() = user_id);

-- Journal entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own journal entries"
    ON journal_entries FOR ALL
    USING (auth.uid() = user_id);

-- Pomodoro sessions
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pomodoro sessions"
    ON pomodoro_sessions FOR ALL
    USING (auth.uid() = user_id);

-- Focus sessions
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own focus sessions"
    ON focus_sessions FOR ALL
    USING (auth.uid() = user_id);

-- Goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own goals"
    ON goals FOR ALL
    USING (auth.uid() = user_id);

-- Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own expenses"
    ON expenses FOR ALL
    USING (auth.uid() = user_id);

-- Income
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own income"
    ON income FOR ALL
    USING (auth.uid() = user_id);

-- Budget categories
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own budget categories"
    ON budget_categories FOR ALL
    USING (auth.uid() = user_id);

