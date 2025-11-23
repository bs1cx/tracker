-- ============================================
-- HEALTH MODULE TABLES & RLS FIX
-- Safe migration script with IF NOT EXISTS
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    CONSTRAINT valid_heart_rate CHECK (heart_rate IS NULL OR (heart_rate > 0 AND heart_rate < 300)),
    CONSTRAINT valid_weight CHECK (weight IS NULL OR (weight > 0 AND weight < 1000))
);

-- Sleep logs table
CREATE TABLE IF NOT EXISTS sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sleep_duration DECIMAL(4,2), -- Hours
    sleep_quality TEXT CHECK (sleep_quality IS NULL OR sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
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
    meal_type TEXT CHECK (meal_type IS NULL OR meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_name TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR HEALTH TABLES
-- ============================================

-- Health metrics policies
DROP POLICY IF EXISTS "Users can view own health_metrics" ON health_metrics;
CREATE POLICY "Users can view own health_metrics" ON health_metrics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own health_metrics" ON health_metrics;
CREATE POLICY "Users can insert own health_metrics" ON health_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own health_metrics" ON health_metrics;
CREATE POLICY "Users can update own health_metrics" ON health_metrics
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own health_metrics" ON health_metrics;
CREATE POLICY "Users can delete own health_metrics" ON health_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- Sleep logs policies
DROP POLICY IF EXISTS "Users can view own sleep_logs" ON sleep_logs;
CREATE POLICY "Users can view own sleep_logs" ON sleep_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sleep_logs" ON sleep_logs;
CREATE POLICY "Users can insert own sleep_logs" ON sleep_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sleep_logs" ON sleep_logs;
CREATE POLICY "Users can update own sleep_logs" ON sleep_logs
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sleep_logs" ON sleep_logs;
CREATE POLICY "Users can delete own sleep_logs" ON sleep_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Water intake policies
DROP POLICY IF EXISTS "Users can view own water_intake" ON water_intake;
CREATE POLICY "Users can view own water_intake" ON water_intake
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own water_intake" ON water_intake;
CREATE POLICY "Users can insert own water_intake" ON water_intake
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own water_intake" ON water_intake;
CREATE POLICY "Users can update own water_intake" ON water_intake
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own water_intake" ON water_intake;
CREATE POLICY "Users can delete own water_intake" ON water_intake
    FOR DELETE USING (auth.uid() = user_id);

-- Nutrition logs policies
DROP POLICY IF EXISTS "Users can view own nutrition_logs" ON nutrition_logs;
CREATE POLICY "Users can view own nutrition_logs" ON nutrition_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own nutrition_logs" ON nutrition_logs;
CREATE POLICY "Users can insert own nutrition_logs" ON nutrition_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own nutrition_logs" ON nutrition_logs;
CREATE POLICY "Users can update own nutrition_logs" ON nutrition_logs
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own nutrition_logs" ON nutrition_logs;
CREATE POLICY "Users can delete own nutrition_logs" ON nutrition_logs
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date DESC);

