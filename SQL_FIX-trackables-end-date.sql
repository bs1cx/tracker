-- ============================================
-- Migration: Add end_date column to trackables
-- ============================================

-- Add end_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trackables' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE trackables ADD COLUMN end_date DATE;
        
        -- Add comment
        COMMENT ON COLUMN trackables.end_date IS 'End date for the task/habit (optional)';
    END IF;
END $$;

