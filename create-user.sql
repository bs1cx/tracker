-- ============================================
-- Create User: dogu
-- Email: dogu@example.com (or your preferred email)
-- Password: 0407aylo
-- ============================================
-- 
-- IMPORTANT: This script creates a user directly in Supabase Auth
-- Run this in Supabase SQL Editor after setting up your database
--
-- Note: You can also create the user through Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User" > "Create New User"
-- 3. Email: dogu@example.com (or your preferred email)
-- 4. Password: 0407aylo
-- 5. Auto Confirm User: ON
-- 6. Click "Create User"
-- ============================================

-- Option 1: Create user via Supabase Auth (recommended - use Dashboard)
-- Go to Supabase Dashboard > Authentication > Users > Add User

-- Option 2: Create user via SQL (if you have admin access)
-- Note: This requires direct database access and is more complex
-- It's easier to use the Dashboard method above

-- If you want to create a profile entry after user is created:
-- (Run this AFTER creating the user via Dashboard)

-- First, get the user ID from auth.users table:
-- SELECT id FROM auth.users WHERE email = 'dogu@example.com';

-- Then create profile (replace USER_ID with actual UUID):
-- INSERT INTO profiles (id, email, full_name, created_at, updated_at)
-- VALUES (
--   'USER_ID_FROM_ABOVE',  -- Replace with actual user ID
--   'dogu@example.com',
--   'Dogu',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO NOTHING;

