-- ============================================
-- Fix budget_categories table - Add month_year column if missing
-- Run this if you get "column month_year does not exist" error
-- ============================================

-- Check if table exists and add month_year column if it doesn't exist
DO $$ 
BEGIN
    -- Check if budget_categories table exists
    IF EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'budget_categories') THEN
        
        -- Add month_year column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'budget_categories' 
                      AND column_name = 'month_year') THEN
            ALTER TABLE budget_categories 
            ADD COLUMN month_year TEXT;
            
            -- Set default value for existing rows
            UPDATE budget_categories 
            SET month_year = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
            WHERE month_year IS NULL;
            
            -- Make it NOT NULL after setting defaults
            ALTER TABLE budget_categories 
            ALTER COLUMN month_year SET NOT NULL;
            
            RAISE NOTICE 'Added month_year column to budget_categories table';
        ELSE
            RAISE NOTICE 'month_year column already exists in budget_categories table';
        END IF;
        
        -- Recreate unique constraint if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_constraint 
                      WHERE conname = 'budget_categories_user_id_category_name_month_year_key') THEN
            ALTER TABLE budget_categories 
            ADD CONSTRAINT budget_categories_user_id_category_name_month_year_key 
            UNIQUE(user_id, category_name, month_year);
            
            RAISE NOTICE 'Added unique constraint on (user_id, category_name, month_year)';
        END IF;
        
        -- Recreate index if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_indexes 
                      WHERE indexname = 'idx_budget_categories_user_month') THEN
            CREATE INDEX idx_budget_categories_user_month 
            ON budget_categories(user_id, month_year);
            
            RAISE NOTICE 'Created index idx_budget_categories_user_month';
        END IF;
        
    ELSE
        RAISE NOTICE 'budget_categories table does not exist. Please run supabase-schema-complete.sql first.';
    END IF;
END $$;

