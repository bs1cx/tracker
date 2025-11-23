-- Fix sleep_logs table: Handle both sleep_duration and sleep_duration_hours column names
-- This script checks which column exists and creates/renames as needed

DO $$
BEGIN
    -- Check if sleep_duration_hours exists (old schema)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sleep_logs' 
        AND column_name = 'sleep_duration_hours'
    ) THEN
        -- Rename sleep_duration_hours to sleep_duration if sleep_duration doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'sleep_logs' 
            AND column_name = 'sleep_duration'
        ) THEN
            ALTER TABLE sleep_logs RENAME COLUMN sleep_duration_hours TO sleep_duration;
            RAISE NOTICE 'Renamed sleep_duration_hours to sleep_duration';
        ELSE
            -- Both exist, drop the old one
            ALTER TABLE sleep_logs DROP COLUMN sleep_duration_hours;
            RAISE NOTICE 'Dropped duplicate sleep_duration_hours column';
        END IF;
    END IF;

    -- Ensure sleep_duration exists and is NOT NULL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sleep_logs' 
        AND column_name = 'sleep_duration'
    ) THEN
        ALTER TABLE sleep_logs ADD COLUMN sleep_duration DECIMAL(4,2);
        RAISE NOTICE 'Added sleep_duration column';
    END IF;

    -- Make sleep_duration NOT NULL if it's currently nullable
    -- First, set default for any NULL values
    UPDATE sleep_logs SET sleep_duration = 0 WHERE sleep_duration IS NULL;
    
    -- Then add NOT NULL constraint
    ALTER TABLE sleep_logs ALTER COLUMN sleep_duration SET NOT NULL;
    
    RAISE NOTICE 'sleep_logs table fixed successfully';
END $$;

