-- ============================================
-- FIX MISSING HEALTH COLUMNS
-- This script adds missing columns if they don't exist
-- Run this in Supabase SQL Editor
-- ============================================

-- Fix health_metrics table - ensure heart_rate column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'health_metrics' 
        AND column_name = 'heart_rate'
    ) THEN
        ALTER TABLE health_metrics ADD COLUMN heart_rate INTEGER;
        ALTER TABLE health_metrics ADD CONSTRAINT valid_heart_rate 
            CHECK (heart_rate IS NULL OR (heart_rate > 0 AND heart_rate < 300));
    END IF;
END $$;

-- Fix sleep_logs table - ensure sleep_duration column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sleep_logs' 
        AND column_name = 'sleep_duration'
    ) THEN
        ALTER TABLE sleep_logs ADD COLUMN sleep_duration DECIMAL(4,2);
    END IF;
END $$;

-- Ensure all other required columns exist in sleep_logs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sleep_logs' 
        AND column_name = 'sleep_quality'
    ) THEN
        ALTER TABLE sleep_logs ADD COLUMN sleep_quality TEXT 
            CHECK (sleep_quality IS NULL OR sleep_quality IN ('poor', 'fair', 'good', 'excellent'));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sleep_logs' 
        AND column_name = 'rem_duration'
    ) THEN
        ALTER TABLE sleep_logs ADD COLUMN rem_duration DECIMAL(4,2);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sleep_logs' 
        AND column_name = 'light_sleep_duration'
    ) THEN
        ALTER TABLE sleep_logs ADD COLUMN light_sleep_duration DECIMAL(4,2);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sleep_logs' 
        AND column_name = 'deep_sleep_duration'
    ) THEN
        ALTER TABLE sleep_logs ADD COLUMN deep_sleep_duration DECIMAL(4,2);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sleep_logs' 
        AND column_name = 'sleep_efficiency'
    ) THEN
        ALTER TABLE sleep_logs ADD COLUMN sleep_efficiency DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sleep_logs' 
        AND column_name = 'log_date'
    ) THEN
        ALTER TABLE sleep_logs ADD COLUMN log_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Ensure health_metrics has all required columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'health_metrics' 
        AND column_name = 'log_date'
    ) THEN
        ALTER TABLE health_metrics ADD COLUMN log_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'health_metrics' 
        AND column_name = 'blood_pressure_systolic'
    ) THEN
        ALTER TABLE health_metrics ADD COLUMN blood_pressure_systolic INTEGER;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'health_metrics' 
        AND column_name = 'blood_pressure_diastolic'
    ) THEN
        ALTER TABLE health_metrics ADD COLUMN blood_pressure_diastolic INTEGER;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'health_metrics' 
        AND column_name = 'weight'
    ) THEN
        ALTER TABLE health_metrics ADD COLUMN weight DECIMAL(5,2);
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date DESC);

-- Verify columns exist
DO $$ 
DECLARE
    heart_rate_exists BOOLEAN;
    sleep_duration_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'health_metrics' AND column_name = 'heart_rate'
    ) INTO heart_rate_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sleep_logs' AND column_name = 'sleep_duration'
    ) INTO sleep_duration_exists;
    
    IF heart_rate_exists THEN
        RAISE NOTICE '✓ health_metrics.heart_rate column exists';
    ELSE
        RAISE WARNING '✗ health_metrics.heart_rate column is missing';
    END IF;
    
    IF sleep_duration_exists THEN
        RAISE NOTICE '✓ sleep_logs.sleep_duration column exists';
    ELSE
        RAISE WARNING '✗ sleep_logs.sleep_duration column is missing';
    END IF;
END $$;

