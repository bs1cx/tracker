-- ============================================
-- CLEANUP: Remove All Demo/Test Data
-- This script deletes ALL data from ALL tables
-- WARNING: This will delete ALL data, not just demo data!
-- Run this ONLY if you want to start fresh with a clean database
-- ============================================

-- IMPORTANT: This script deletes ALL data from all tables
-- Make sure you have a backup if you need to keep any data!

-- Disable foreign key checks temporarily for faster deletion
SET session_replication_role = 'replica';

-- Delete in order (respecting foreign key constraints)

-- 1. Delete all logs (child table)
DELETE FROM logs;

-- 2. Delete all trackables
DELETE FROM trackables;

-- 3. Delete all health module data
DELETE FROM daily_health_summary;
DELETE FROM smoking_logs;
DELETE FROM steps_logs;
DELETE FROM exercise_logs;
DELETE FROM alcohol_logs;
DELETE FROM caffeine_logs;
DELETE FROM energy_logs;
DELETE FROM stress_logs;
DELETE FROM medication_logs;
DELETE FROM pain_logs;
DELETE FROM symptom_logs;
DELETE FROM body_measurements;
DELETE FROM nutrition_logs;
DELETE FROM water_intake;
DELETE FROM sleep_logs;
DELETE FROM health_metrics;

-- 4. Delete all mental health module data
DELETE FROM journal_entries;
DELETE FROM meditation_sessions;
DELETE FROM motivation_logs;
DELETE FROM mood_logs;

-- 5. Delete all productivity module data
DELETE FROM focus_sessions;
DELETE FROM pomodoro_sessions;
DELETE FROM goals;

-- 6. Delete all finance module data
DELETE FROM budget_categories;
DELETE FROM income;
DELETE FROM expenses;

-- 7. Delete nutrition goals
DELETE FROM nutrition_goals;

-- 8. Delete profiles (keep auth.users intact - managed by Supabase Auth)
-- Note: We don't delete from auth.users as that's managed by Supabase Auth
-- DELETE FROM profiles; -- Uncomment if you want to delete profiles too

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'All demo/test data has been deleted successfully!';
    RAISE NOTICE 'Database is now clean and ready for real user data.';
END $$;

