-- ============================================
-- Migration Script: Fix date column names
-- Run this if you already created tables with 'date' column
-- ============================================

-- If tables were created with 'date' column, rename them to 'log_date'
-- Run this ONLY if you get errors about 'date' column

DO $$
BEGIN
    -- Health metrics
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'health_metrics' AND column_name = 'date') THEN
        ALTER TABLE health_metrics RENAME COLUMN date TO log_date;
    END IF;

    -- Sleep logs
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sleep_logs' AND column_name = 'date') THEN
        ALTER TABLE sleep_logs RENAME COLUMN date TO log_date;
    END IF;

    -- Water intake
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'water_intake' AND column_name = 'date') THEN
        ALTER TABLE water_intake RENAME COLUMN date TO log_date;
    END IF;

    -- Nutrition logs
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'nutrition_logs' AND column_name = 'date') THEN
        ALTER TABLE nutrition_logs RENAME COLUMN date TO log_date;
    END IF;

    -- Mood logs
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'mood_logs' AND column_name = 'date') THEN
        ALTER TABLE mood_logs RENAME COLUMN date TO log_date;
    END IF;

    -- Motivation logs
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'motivation_logs' AND column_name = 'date') THEN
        ALTER TABLE motivation_logs RENAME COLUMN date TO log_date;
    END IF;

    -- Meditation sessions
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'meditation_sessions' AND column_name = 'date') THEN
        ALTER TABLE meditation_sessions RENAME COLUMN date TO log_date;
    END IF;

    -- Journal entries
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'journal_entries' AND column_name = 'date') THEN
        ALTER TABLE journal_entries RENAME COLUMN date TO log_date;
    END IF;

    -- Pomodoro sessions
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'pomodoro_sessions' AND column_name = 'date') THEN
        ALTER TABLE pomodoro_sessions RENAME COLUMN date TO log_date;
    END IF;

    -- Focus sessions (add if missing)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'focus_sessions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'focus_sessions' AND column_name = 'log_date') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'focus_sessions' AND column_name = 'date') THEN
                ALTER TABLE focus_sessions RENAME COLUMN date TO log_date;
            ELSE
                ALTER TABLE focus_sessions ADD COLUMN log_date DATE NOT NULL DEFAULT CURRENT_DATE;
            END IF;
        END IF;
    END IF;

    -- Expenses
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'expenses' AND column_name = 'date') THEN
        ALTER TABLE expenses RENAME COLUMN date TO log_date;
    END IF;

    -- Income
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'income' AND column_name = 'date') THEN
        ALTER TABLE income RENAME COLUMN date TO log_date;
    END IF;
END $$;

-- Recreate indexes with correct column names (only if tables exist)
DO $$
BEGIN
    -- Drop old indexes if they exist
    DROP INDEX IF EXISTS idx_health_metrics_user_date;
    DROP INDEX IF EXISTS idx_sleep_logs_user_date;
    DROP INDEX IF EXISTS idx_water_intake_user_date;
    DROP INDEX IF EXISTS idx_nutrition_logs_user_date;
    DROP INDEX IF EXISTS idx_mood_logs_user_date;
    DROP INDEX IF EXISTS idx_motivation_logs_user_date;
    DROP INDEX IF EXISTS idx_meditation_sessions_user_date;
    DROP INDEX IF EXISTS idx_journal_entries_user_date;
    DROP INDEX IF EXISTS idx_pomodoro_sessions_user_date;
    DROP INDEX IF EXISTS idx_focus_sessions_user_date;
    DROP INDEX IF EXISTS idx_expenses_user_date;
    DROP INDEX IF EXISTS idx_income_user_date;

    -- Create indexes only if tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sleep_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'water_intake') THEN
        CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nutrition_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mood_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'motivation_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_motivation_logs_user_date ON motivation_logs(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meditation_sessions') THEN
        CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_date ON meditation_sessions(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entries') THEN
        CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pomodoro_sessions') THEN
        CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'focus_sessions') THEN
        CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON focus_sessions(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
        CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, log_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'income') THEN
        CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, log_date);
    END IF;
END $$;

