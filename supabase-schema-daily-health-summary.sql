-- ============================================
-- DAILY HEALTH SUMMARY SYSTEM
-- Günlük sağlık özeti sistemi
-- ============================================

-- Daily health summary table
-- Her gün için bir özet kaydı tutar
CREATE TABLE IF NOT EXISTS daily_health_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Günlük özet bilgileri
    overall_wellness_score INTEGER CHECK (overall_wellness_score >= 0 AND overall_wellness_score <= 10),
    notes TEXT,
    
    -- Hastalık/devam eden durumlar
    ongoing_conditions TEXT[], -- Devam eden hastalıklar/rahatsızlıklar
    symptoms TEXT[], -- Belirtiler
    medications_taken TEXT[], -- Alınan ilaçlar
    
    -- Günlük aktivite özeti
    total_steps INTEGER DEFAULT 0,
    total_exercise_minutes INTEGER DEFAULT 0,
    total_water_ml INTEGER DEFAULT 0,
    total_calories INTEGER DEFAULT 0,
    
    -- Uyku özeti
    sleep_hours DECIMAL(4,2),
    sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
    
    -- Vital signs
    avg_heart_rate INTEGER,
    avg_energy_level INTEGER CHECK (avg_energy_level >= 0 AND avg_energy_level <= 10),
    avg_stress_level INTEGER CHECK (avg_stress_level >= 0 AND avg_stress_level <= 10),
    
    -- Substance use
    cigarettes_count INTEGER DEFAULT 0,
    alcohol_drinks INTEGER DEFAULT 0,
    caffeine_mg INTEGER DEFAULT 0,
    
    -- Flags
    is_completed BOOLEAN DEFAULT FALSE, -- Günlük özet tamamlandı mı?
    carried_over_conditions BOOLEAN DEFAULT FALSE, -- Önceki günden devam eden durumlar var mı?
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Her kullanıcı için günde sadece bir özet olabilir
    UNIQUE(user_id, summary_date)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_health_summary_user_date 
ON daily_health_summary(user_id, summary_date DESC);

-- Function to check if user has completed today's summary
CREATE OR REPLACE FUNCTION has_completed_today_summary(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_completed BOOLEAN;
BEGIN
    SELECT is_completed INTO v_completed
    FROM daily_health_summary
    WHERE user_id = p_user_id 
    AND summary_date = CURRENT_DATE;
    
    RETURN COALESCE(v_completed, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create today's summary
CREATE OR REPLACE FUNCTION get_or_create_today_summary(p_user_id UUID)
RETURNS daily_health_summary AS $$
DECLARE
    v_summary daily_health_summary;
BEGIN
    -- Try to get today's summary
    SELECT * INTO v_summary
    FROM daily_health_summary
    WHERE user_id = p_user_id 
    AND summary_date = CURRENT_DATE;
    
    -- If not found, create a new one
    IF NOT FOUND THEN
        INSERT INTO daily_health_summary (user_id, summary_date)
        VALUES (p_user_id, CURRENT_DATE)
        RETURNING * INTO v_summary;
    END IF;
    
    RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to carry over conditions from previous day
CREATE OR REPLACE FUNCTION carry_over_conditions_to_today(p_user_id UUID)
RETURNS daily_health_summary AS $$
DECLARE
    v_yesterday_summary daily_health_summary;
    v_today_summary daily_health_summary;
BEGIN
    -- Get yesterday's summary
    SELECT * INTO v_yesterday_summary
    FROM daily_health_summary
    WHERE user_id = p_user_id 
    AND summary_date = CURRENT_DATE - INTERVAL '1 day';
    
    -- Get or create today's summary
    SELECT * INTO v_today_summary
    FROM get_or_create_today_summary(p_user_id);
    
    -- If yesterday had ongoing conditions, carry them over
    IF v_yesterday_summary.ongoing_conditions IS NOT NULL 
       AND array_length(v_yesterday_summary.ongoing_conditions, 1) > 0 THEN
        UPDATE daily_health_summary
        SET 
            ongoing_conditions = v_yesterday_summary.ongoing_conditions,
            carried_over_conditions = TRUE,
            updated_at = NOW()
        WHERE id = v_today_summary.id
        RETURNING * INTO v_today_summary;
    END IF;
    
    RETURN v_today_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE daily_health_summary ENABLE ROW LEVEL SECURITY;

-- Users can only see their own summaries
CREATE POLICY "Users can view own daily health summaries"
ON daily_health_summary FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own summaries
CREATE POLICY "Users can insert own daily health summaries"
ON daily_health_summary FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own summaries
CREATE POLICY "Users can update own daily health summaries"
ON daily_health_summary FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own summaries
CREATE POLICY "Users can delete own daily health summaries"
ON daily_health_summary FOR DELETE
USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE daily_health_summary IS 'Günlük sağlık özeti tablosu - Her gün için kullanıcının sağlık durumunu özetler';
COMMENT ON COLUMN daily_health_summary.carried_over_conditions IS 'Önceki günden devam eden hastalık/durumlar var mı?';
COMMENT ON COLUMN daily_health_summary.is_completed IS 'Günlük özet tamamlandı mı?';

