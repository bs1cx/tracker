-- Fix mental health tables: Add missing columns
-- This script adds missing columns to meditation_sessions and journal_entries tables

-- ============================================
-- Fix meditation_sessions table
-- ============================================

-- Check if 'session_type' column exists and is NOT NULL, make it nullable or set default
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'meditation_sessions' 
        AND column_name = 'session_type'
        AND is_nullable = 'NO'
    ) THEN
        -- Make session_type nullable or add default
        ALTER TABLE meditation_sessions 
        ALTER COLUMN session_type DROP NOT NULL;
        
        -- Set default value for existing NULL rows
        UPDATE meditation_sessions 
        SET session_type = 'other' 
        WHERE session_type IS NULL;
        
        RAISE NOTICE 'Made session_type nullable in meditation_sessions';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'meditation_sessions' 
        AND column_name = 'session_type'
    ) THEN
        -- Add session_type column if it doesn't exist
        ALTER TABLE meditation_sessions ADD COLUMN session_type TEXT DEFAULT 'other';
        
        -- Add check constraint
        ALTER TABLE meditation_sessions 
        ADD CONSTRAINT meditation_sessions_session_type_check 
        CHECK (session_type IS NULL OR session_type IN ('breathing', 'mindfulness', 'guided', 'other'));
        
        RAISE NOTICE 'Added session_type column to meditation_sessions';
    ELSE
        RAISE NOTICE 'session_type column already exists in meditation_sessions';
    END IF;
END $$;

-- Check if 'type' column exists, if not add it (for backward compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'meditation_sessions' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE meditation_sessions ADD COLUMN type TEXT;
        
        -- Add check constraint
        ALTER TABLE meditation_sessions 
        ADD CONSTRAINT meditation_sessions_type_check 
        CHECK (type IS NULL OR type IN ('breathing', 'mindfulness', 'guided', 'other'));
        
        RAISE NOTICE 'Added type column to meditation_sessions';
    ELSE
        RAISE NOTICE 'type column already exists in meditation_sessions';
    END IF;
END $$;

-- ============================================
-- Fix journal_entries table
-- ============================================

-- Check if 'mood_after' column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'journal_entries' 
        AND column_name = 'mood_after'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN mood_after INTEGER;
        
        -- Add check constraint
        ALTER TABLE journal_entries 
        ADD CONSTRAINT journal_entries_mood_after_check 
        CHECK (mood_after IS NULL OR (mood_after >= 1 AND mood_after <= 10));
        
        RAISE NOTICE 'Added mood_after column to journal_entries';
    ELSE
        RAISE NOTICE 'mood_after column already exists in journal_entries';
    END IF;
END $$;

-- Check if 'mood_before' column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'journal_entries' 
        AND column_name = 'mood_before'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN mood_before INTEGER;
        
        -- Add check constraint
        ALTER TABLE journal_entries 
        ADD CONSTRAINT journal_entries_mood_before_check 
        CHECK (mood_before IS NULL OR (mood_before >= 1 AND mood_before <= 10));
        
        RAISE NOTICE 'Added mood_before column to journal_entries';
    ELSE
        RAISE NOTICE 'mood_before column already exists in journal_entries';
    END IF;
END $$;

-- Check if 'tags' column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'journal_entries' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN tags TEXT[];
        
        RAISE NOTICE 'Added tags column to journal_entries';
    ELSE
        RAISE NOTICE 'tags column already exists in journal_entries';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Mental health tables fixed successfully!';
    RAISE NOTICE 'All required columns have been added.';
END $$;

