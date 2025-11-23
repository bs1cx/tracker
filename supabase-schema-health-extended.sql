-- ============================================
-- Extended Health Tracking Schema
-- Run this AFTER supabase-schema-complete.sql
-- ============================================

-- ============================================
-- SUBSTANCE TRACKING TABLES
-- ============================================

-- Smoking tracking (Sigara takibi)
CREATE TABLE IF NOT EXISTS smoking_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cigarettes_count INTEGER NOT NULL DEFAULT 1,
    log_time TIMESTAMPTZ DEFAULT NOW(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_cigarettes CHECK (cigarettes_count > 0 AND cigarettes_count <= 200)
);

-- Alcohol consumption tracking (Alkol tüketimi)
CREATE TABLE IF NOT EXISTS alcohol_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    drink_type TEXT NOT NULL, -- 'beer', 'wine', 'spirits', 'cocktail', 'other'
    amount_ml DECIMAL(6,2) NOT NULL,
    alcohol_percentage DECIMAL(5,2), -- Alcohol by volume (ABV)
    log_time TIMESTAMPTZ DEFAULT NOW(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_amount CHECK (amount_ml > 0)
);

-- Caffeine tracking (Kafein takibi)
CREATE TABLE IF NOT EXISTS caffeine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- 'coffee', 'tea', 'energy_drink', 'soda', 'chocolate', 'supplement', 'other'
    caffeine_mg DECIMAL(6,2) NOT NULL,
    log_time TIMESTAMPTZ DEFAULT NOW(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_caffeine CHECK (caffeine_mg > 0 AND caffeine_mg <= 1000)
);

-- ============================================
-- ACTIVITY & FITNESS TABLES
-- ============================================

-- Steps tracking (Adım sayısı)
CREATE TABLE IF NOT EXISTS steps_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    steps_count INTEGER NOT NULL,
    distance_km DECIMAL(6,2), -- Calculated distance
    calories_burned INTEGER,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_steps CHECK (steps_count >= 0)
);

-- Exercise tracking (Egzersiz takibi)
CREATE TABLE IF NOT EXISTS exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_type TEXT NOT NULL, -- 'running', 'cycling', 'swimming', 'weightlifting', 'yoga', 'pilates', 'walking', 'hiking', 'dancing', 'sports', 'other'
    duration_minutes INTEGER NOT NULL,
    intensity TEXT CHECK (intensity IN ('low', 'moderate', 'high', 'very_high')),
    calories_burned INTEGER,
    distance_km DECIMAL(6,2),
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    log_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 600)
);

-- ============================================
-- BODY METRICS TABLES
-- ============================================

-- Body measurements (Vücut ölçüleri)
CREATE TABLE IF NOT EXISTS body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(4,2), -- Body Mass Index (calculated)
    body_fat_percentage DECIMAL(5,2),
    muscle_mass_kg DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    hip_cm DECIMAL(5,2),
    neck_cm DECIMAL(5,2),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDICATION & SYMPTOMS TABLES
-- ============================================

-- Medication tracking (İlaç takibi)
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT, -- e.g., "500mg", "1 tablet"
    frequency TEXT, -- 'once_daily', 'twice_daily', 'three_times_daily', 'as_needed', 'other'
    taken_at TIMESTAMPTZ DEFAULT NOW(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptoms tracking (Semptom takibi)
CREATE TABLE IF NOT EXISTS symptom_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symptom_type TEXT NOT NULL, -- 'headache', 'fever', 'cough', 'nausea', 'fatigue', 'pain', 'dizziness', 'other'
    severity INTEGER CHECK (severity >= 1 AND severity <= 10), -- 1-10 scale
    location TEXT, -- For pain: 'head', 'chest', 'back', 'joint', 'muscle', 'other'
    duration_minutes INTEGER,
    notes TEXT,
    log_time TIMESTAMPTZ DEFAULT NOW(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pain tracking (Ağrı takibi)
CREATE TABLE IF NOT EXISTS pain_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pain_level INTEGER NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10), -- 0-10 scale
    pain_type TEXT, -- 'sharp', 'dull', 'burning', 'throbbing', 'aching', 'stabbing', 'other'
    location TEXT NOT NULL, -- 'head', 'neck', 'shoulder', 'back', 'chest', 'stomach', 'arm', 'leg', 'joint', 'other'
    duration_minutes INTEGER,
    triggers TEXT, -- What caused the pain
    relief_method TEXT, -- How it was relieved
    notes TEXT,
    log_time TIMESTAMPTZ DEFAULT NOW(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WELLNESS & VITALITY TABLES
-- ============================================

-- Energy level tracking (Enerji seviyesi)
CREATE TABLE IF NOT EXISTS energy_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
    time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
    factors TEXT, -- What affected energy level
    notes TEXT,
    log_time TIMESTAMPTZ DEFAULT NOW(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stress level tracking (Stres seviyesi)
CREATE TABLE IF NOT EXISTS stress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
    stress_source TEXT, -- 'work', 'family', 'health', 'financial', 'relationship', 'other'
    coping_method TEXT, -- How user coped with stress
    notes TEXT,
    log_time TIMESTAMPTZ DEFAULT NOW(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WOMEN'S HEALTH (Optional)
-- ============================================

-- Menstrual cycle tracking (Adet döngüsü takibi)
CREATE TABLE IF NOT EXISTS menstrual_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cycle_day INTEGER, -- Day of menstrual cycle
    flow_level TEXT CHECK (flow_level IN ('none', 'light', 'medium', 'heavy')),
    symptoms TEXT[], -- Array of symptoms
    mood TEXT,
    notes TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTH GOALS & TARGETS
-- ============================================

-- Health goals table
CREATE TABLE IF NOT EXISTS health_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- 'weight_loss', 'weight_gain', 'quit_smoking', 'reduce_alcohol', 'increase_steps', 'exercise_more', 'other'
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit TEXT, -- 'kg', 'cigarettes', 'drinks', 'steps', 'minutes', etc.
    start_date DATE NOT NULL,
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_smoking_logs_user_date ON smoking_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_alcohol_logs_user_date ON alcohol_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_caffeine_logs_user_date ON caffeine_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_steps_logs_user_date ON steps_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON body_measurements(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_date ON medication_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date ON symptom_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_pain_logs_user_date ON pain_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date ON energy_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_stress_logs_user_date ON stress_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_menstrual_logs_user_date ON menstrual_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_health_goals_user_status ON health_goals(user_id, status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE smoking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alcohol_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE caffeine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE menstrual_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;

-- Smoking logs policies
DROP POLICY IF EXISTS "Users can manage own smoking_logs" ON smoking_logs;
CREATE POLICY "Users can manage own smoking_logs" ON smoking_logs FOR ALL USING (auth.uid() = user_id);

-- Alcohol logs policies
DROP POLICY IF EXISTS "Users can manage own alcohol_logs" ON alcohol_logs;
CREATE POLICY "Users can manage own alcohol_logs" ON alcohol_logs FOR ALL USING (auth.uid() = user_id);

-- Caffeine logs policies
DROP POLICY IF EXISTS "Users can manage own caffeine_logs" ON caffeine_logs;
CREATE POLICY "Users can manage own caffeine_logs" ON caffeine_logs FOR ALL USING (auth.uid() = user_id);

-- Steps logs policies
DROP POLICY IF EXISTS "Users can manage own steps_logs" ON steps_logs;
CREATE POLICY "Users can manage own steps_logs" ON steps_logs FOR ALL USING (auth.uid() = user_id);

-- Exercise logs policies
DROP POLICY IF EXISTS "Users can manage own exercise_logs" ON exercise_logs;
CREATE POLICY "Users can manage own exercise_logs" ON exercise_logs FOR ALL USING (auth.uid() = user_id);

-- Body measurements policies
DROP POLICY IF EXISTS "Users can manage own body_measurements" ON body_measurements;
CREATE POLICY "Users can manage own body_measurements" ON body_measurements FOR ALL USING (auth.uid() = user_id);

-- Medication logs policies
DROP POLICY IF EXISTS "Users can manage own medication_logs" ON medication_logs;
CREATE POLICY "Users can manage own medication_logs" ON medication_logs FOR ALL USING (auth.uid() = user_id);

-- Symptom logs policies
DROP POLICY IF EXISTS "Users can manage own symptom_logs" ON symptom_logs;
CREATE POLICY "Users can manage own symptom_logs" ON symptom_logs FOR ALL USING (auth.uid() = user_id);

-- Pain logs policies
DROP POLICY IF EXISTS "Users can manage own pain_logs" ON pain_logs;
CREATE POLICY "Users can manage own pain_logs" ON pain_logs FOR ALL USING (auth.uid() = user_id);

-- Energy logs policies
DROP POLICY IF EXISTS "Users can manage own energy_logs" ON energy_logs;
CREATE POLICY "Users can manage own energy_logs" ON energy_logs FOR ALL USING (auth.uid() = user_id);

-- Stress logs policies
DROP POLICY IF EXISTS "Users can manage own stress_logs" ON stress_logs;
CREATE POLICY "Users can manage own stress_logs" ON stress_logs FOR ALL USING (auth.uid() = user_id);

-- Menstrual logs policies
DROP POLICY IF EXISTS "Users can manage own menstrual_logs" ON menstrual_logs;
CREATE POLICY "Users can manage own menstrual_logs" ON menstrual_logs FOR ALL USING (auth.uid() = user_id);

-- Health goals policies
DROP POLICY IF EXISTS "Users can manage own health_goals" ON health_goals;
CREATE POLICY "Users can manage own health_goals" ON health_goals FOR ALL USING (auth.uid() = user_id);

