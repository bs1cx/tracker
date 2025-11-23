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

// Extended Health Module Types
export interface SmokingLog {
  id: string
  user_id: string
  cigarettes_count: number
  log_time: string
  log_date: string
  notes?: string | null
  created_at: string
}

export interface AlcoholLog {
  id: string
  user_id: string
  drink_type: string
  amount_ml: number
  alcohol_percentage?: number | null
  log_time: string
  log_date: string
  notes?: string | null
  created_at: string
}

export interface CaffeineLog {
  id: string
  user_id: string
  source: string
  caffeine_mg: number
  log_time: string
  log_date: string
  notes?: string | null
  created_at: string
}

export interface StepsLog {
  id: string
  user_id: string
  steps_count: number
  distance_km?: number | null
  calories_burned?: number | null
  log_date: string
  created_at: string
}

export interface ExerciseLog {
  id: string
  user_id: string
  exercise_type: string
  duration_minutes: number
  intensity?: "low" | "moderate" | "high" | "very_high" | null
  calories_burned?: number | null
  distance_km?: number | null
  heart_rate_avg?: number | null
  heart_rate_max?: number | null
  notes?: string | null
  log_date: string
  log_time: string
  created_at: string
}

export interface BodyMeasurement {
  id: string
  user_id: string
  weight_kg?: number | null
  height_cm?: number | null
  bmi?: number | null
  body_fat_percentage?: number | null
  muscle_mass_kg?: number | null
  waist_cm?: number | null
  chest_cm?: number | null
  hip_cm?: number | null
  neck_cm?: number | null
  log_date: string
  created_at: string
}

export interface MedicationLog {
  id: string
  user_id: string
  medication_name: string
  dosage?: string | null
  frequency?: string | null
  taken_at: string
  log_date: string
  notes?: string | null
  created_at: string
}

export interface SymptomLog {
  id: string
  user_id: string
  symptom_type: string
  severity?: number | null
  location?: string | null
  duration_minutes?: number | null
  notes?: string | null
  log_time: string
  log_date: string
  created_at: string
}

export interface PainLog {
  id: string
  user_id: string
  pain_level: number
  pain_type?: string | null
  location: string
  duration_minutes?: number | null
  triggers?: string | null
  relief_method?: string | null
  notes?: string | null
  log_time: string
  log_date: string
  created_at: string
}

export interface EnergyLog {
  id: string
  user_id: string
  energy_level: number
  time_of_day?: "morning" | "afternoon" | "evening" | "night" | null
  factors?: string | null
  notes?: string | null
  log_time: string
  log_date: string
  created_at: string
}

export interface StressLog {
  id: string
  user_id: string
  stress_level: number
  stress_source?: string | null
  coping_method?: string | null
  notes?: string | null
  log_time: string
  log_date: string
  created_at: string
}

export interface MenstrualLog {
  id: string
  user_id: string
  cycle_day?: number | null
  flow_level?: "none" | "light" | "medium" | "heavy" | null
  symptoms?: string[] | null
  mood?: string | null
  notes?: string | null
  log_date: string
  created_at: string
}

export interface DailyHealthSummary {
  id: string
  user_id: string
  summary_date: string // DATE
  overall_wellness_score: number | null // 0-10
  notes: string | null
  ongoing_conditions: string[] | null // Devam eden hastalıklar
  symptoms: string[] | null // Belirtiler
  medications_taken: string[] | null // Alınan ilaçlar
  total_steps: number
  total_exercise_minutes: number
  total_water_ml: number
  total_calories: number
  sleep_hours: number | null
  sleep_quality: "poor" | "fair" | "good" | "excellent" | null
  avg_heart_rate: number | null
  avg_energy_level: number | null // 0-10
  avg_stress_level: number | null // 0-10
  cigarettes_count: number
  alcohol_drinks: number
  caffeine_mg: number
  is_completed: boolean
  carried_over_conditions: boolean
  created_at: string
  updated_at: string
}

export interface HealthGoal {
  id: string
  user_id: string
  goal_type: string
  target_value?: number | null
  current_value: number
  unit?: string | null
  start_date: string
  target_date?: string | null
  status: "active" | "completed" | "archived"
  notes?: string | null
  created_at: string
  updated_at: string
}

