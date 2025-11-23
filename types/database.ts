export type TrackableType = "DAILY_HABIT" | "ONE_TIME" | "PROGRESS"
export type ResetFrequency = "daily" | "weekly" | "none"
export type TrackableStatus = "active" | "completed" | "archived"

export interface Trackable {
  id: string
  user_id: string
  title: string
  type: TrackableType
  status: TrackableStatus
  current_value: number
  target_value: number | null
  last_completed_at: string | null
  reset_frequency: ResetFrequency
  priority?: "low" | "medium" | "high"
  scheduled_time?: string | null
  selected_days?: string[] | null
  category?: "task" | "habit"
  start_date?: string | null
  scheduled_date?: string | null // timestamptz: specific date/time when task should appear
  is_recurring?: boolean
  recurrence_rule?: {
    frequency?: "daily" | "weekly" | "monthly"
    interval?: number
    daysOfWeek?: number[]
    endDate?: string
  } | null
  created_at: string
  updated_at: string
  is_completed_today?: boolean
}

export interface Log {
  id: string
  trackable_id: string
  user_id: string
  action: "completed" | "incremented" | "decremented" | "reset"
  previous_value: number | null
  new_value: number | null
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Health Module Types
export interface HealthMetric {
  id: string
  user_id: string
  heart_rate?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  weight?: number
  log_date: string
  created_at: string
}

export interface SleepLog {
  id: string
  user_id: string
  sleep_duration: number
  sleep_quality?: "poor" | "fair" | "good" | "excellent"
  rem_duration?: number
  light_sleep_duration?: number
  deep_sleep_duration?: number
  sleep_efficiency?: number
  log_date: string
  created_at: string
}

export interface WaterIntake {
  id: string
  user_id: string
  amount_ml: number
  log_date: string
  created_at: string
}

export interface NutritionLog {
  id: string
  user_id: string
  calories?: number
  carbs_grams?: number
  protein_grams?: number
  fat_grams?: number
  meal_type?: "breakfast" | "lunch" | "dinner" | "snack"
  log_date: string
  created_at: string
}

export interface NutritionGoal {
  id: string
  user_id: string
  daily_calories?: number
  daily_carbs_grams?: number
  daily_protein_grams?: number
  daily_fat_grams?: number
  created_at: string
  updated_at: string
}

// Mental Health Module Types
export interface MoodLog {
  id: string
  user_id: string
  mood_score: number
  notes?: string
  log_date: string
  created_at: string
}

export interface MotivationLog {
  id: string
  user_id: string
  motivation_score: number
  notes?: string
  log_date: string
  created_at: string
}

export interface MeditationSession {
  id: string
  user_id: string
  duration_minutes: number
  type?: "breathing" | "mindfulness" | "guided" | "other"
  notes?: string
  log_date: string
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title?: string
  content: string
  mood_before?: number
  mood_after?: number
  log_date: string
  created_at: string
  updated_at: string
}

// Productivity Module Types
export interface PomodoroSession {
  id: string
  user_id: string
  duration_minutes: number
  completed: boolean
  task_title?: string
  log_date: string
  created_at: string
}

export interface FocusSession {
  id: string
  user_id: string
  duration_minutes: number
  distractions?: number
  notes?: string
  log_date: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  goal_type: "weekly" | "monthly" | "yearly"
  target_date?: string
  status: "active" | "completed" | "archived"
  progress_percentage: number
  created_at: string
  updated_at: string
}

// Finance Module Types
export interface Expense {
  id: string
  user_id: string
  amount: number
  category: string
  description?: string
  payment_method?: "cash" | "card" | "bank_transfer" | "other"
  log_date: string
  created_at: string
}

export interface Income {
  id: string
  user_id: string
  amount: number
  source: string
  description?: string
  log_date: string
  created_at: string
}

export interface BudgetCategory {
  id: string
  user_id: string
  category_name: string
  monthly_budget: number
  current_spent: number
  month_year: string
  created_at: string
  updated_at: string
}

