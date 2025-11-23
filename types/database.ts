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

