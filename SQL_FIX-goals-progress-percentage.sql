-- ============================================
-- Fix: Add progress_percentage and target_date columns to goals table
-- ============================================

-- Add progress_percentage column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goals' 
        AND column_name = 'progress_percentage'
    ) THEN
        ALTER TABLE goals 
        ADD COLUMN progress_percentage INTEGER DEFAULT 0 
        CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
        
        -- Update existing records to have 0% progress if they don't have a value
        UPDATE goals 
        SET progress_percentage = 0 
        WHERE progress_percentage IS NULL;
    END IF;
END $$;

-- Add target_date column if it doesn't exist (code uses target_date, not end_date)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goals' 
        AND column_name = 'target_date'
    ) THEN
        ALTER TABLE goals 
        ADD COLUMN target_date DATE;
        
        -- If end_date exists, copy its values to target_date for existing records
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'goals' 
            AND column_name = 'end_date'
        ) THEN
            UPDATE goals 
            SET target_date = end_date 
            WHERE end_date IS NOT NULL AND target_date IS NULL;
        END IF;
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'goals' 
AND column_name IN ('progress_percentage', 'target_date')
ORDER BY column_name;

