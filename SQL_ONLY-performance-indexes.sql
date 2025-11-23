-- Performance Optimization: Database Indexes
-- Run this in Supabase SQL Editor to improve query performance
-- IMPORTANT: Copy ONLY this SQL content, NOT the TypeScript files!

-- Indexes for health module tables (frequently queried by user_id and log_date)
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_smoking_logs_user_date ON smoking_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_steps_logs_user_date ON steps_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_alcohol_logs_user_date ON alcohol_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_caffeine_logs_user_date ON caffeine_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date ON energy_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_stress_logs_user_date ON stress_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_date ON medication_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_pain_logs_user_date ON pain_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date ON symptom_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON body_measurements(user_id, log_date DESC);

-- Index for daily_health_summary (frequently queried by user_id and summary_date)
CREATE INDEX IF NOT EXISTS idx_daily_health_summary_user_date ON daily_health_summary(user_id, summary_date DESC);

-- Indexes for trackables table (frequently queried by user_id and type)
CREATE INDEX IF NOT EXISTS idx_trackables_user_type ON trackables(user_id, type);
CREATE INDEX IF NOT EXISTS idx_trackables_user_status ON trackables(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trackables_user_created ON trackables(user_id, created_at DESC);

-- Composite index for calendar queries
CREATE INDEX IF NOT EXISTS idx_trackables_user_scheduled ON trackables(user_id, scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trackables_user_start_date ON trackables(user_id, start_date) WHERE start_date IS NOT NULL;

-- Indexes for finance module
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, income_date DESC);
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_month ON budget_categories(user_id, month_year);

-- Indexes for productivity module
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON focus_sessions(user_id, log_date DESC);

-- Indexes for mental health module
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_date ON meditation_sessions(user_id, session_date DESC);

-- Analyze tables to update statistics (helps query planner)
ANALYZE health_metrics;
ANALYZE sleep_logs;
ANALYZE water_intake;
ANALYZE nutrition_logs;
ANALYZE smoking_logs;
ANALYZE steps_logs;
ANALYZE exercise_logs;
ANALYZE alcohol_logs;
ANALYZE caffeine_logs;
ANALYZE energy_logs;
ANALYZE stress_logs;
ANALYZE daily_health_summary;
ANALYZE trackables;
ANALYZE expenses;
ANALYZE income;
ANALYZE budget_categories;
ANALYZE pomodoro_sessions;
ANALYZE focus_sessions;
ANALYZE mood_logs;
ANALYZE journal_entries;
ANALYZE meditation_sessions;

