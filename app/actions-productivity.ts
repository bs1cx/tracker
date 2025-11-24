"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentISODate } from "@/lib/date-utils"
import { format } from "date-fns"

// Validation schemas
const pomodoroSessionSchema = z.object({
  duration_minutes: z.number().int().positive().max(60),
  task_title: z.string().optional(),
  completed: z.boolean().default(true),
})

const focusSessionSchema = z.object({
  duration_minutes: z.number().int().positive(),
  distractions: z.number().int().min(0).optional(),
  notes: z.string().optional(),
})

const goalSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  description: z.string().optional(),
  goal_type: z.enum(["weekly", "monthly", "yearly"]),
  target_date: z.string().optional(),
  progress_percentage: z.number().int().min(0).max(100).optional(),
})

// Add Pomodoro session
export async function addPomodoroSession(data: {
  duration_minutes: number
  task_title?: string
  completed?: boolean
}) {
  try {
    console.log("[SERVER ACTION] addPomodoroSession - START")
    
    const validated = pomodoroSessionSchema.parse({
      duration_minutes: typeof data.duration_minutes === 'string' ? parseInt(data.duration_minutes) : data.duration_minutes,
      task_title: data.task_title,
      completed: data.completed !== undefined ? data.completed : true,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addPomodoroSession - Auth error:", authError)
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const { data: insertedData, error } = await supabase
      .from("pomodoro_sessions")
      .insert({
        user_id: user.id,
        duration_minutes: validated.duration_minutes,
        task_title: validated.task_title || null,
        completed: validated.completed,
        log_date: getCurrentISODate(),
      })
      .select()

    if (error) {
      console.error("[SERVER ACTION] addPomodoroSession - DB error:", error)
      
      if (error.code === "42P01") {
        return {
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-complete.sql' dosyasını çalıştırın."
        }
      }
      if (error.code === "42501") {
        return {
          success: false,
          data: null,
          error: "İzin hatası. RLS politikaları kontrol edilmeli."
        }
      }
      
      return {
        success: false,
        data: null,
        error: `Pomodoro kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    console.log("[SERVER ACTION] addPomodoroSession - SUCCESS:", insertedData)
    revalidatePath("/productivity")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addPomodoroSession - EXCEPTION:", error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return {
        success: false,
        data: null,
        error: `Geçersiz veri: ${errorMessages}`
      }
    }
    
    return {
      success: false,
      data: null,
      error: error?.message || "Pomodoro kaydı eklenirken beklenmeyen bir hata oluştu"
    }
  }
}

// Add Focus session
export async function addFocusSession(data: {
  duration_minutes: number
  distractions?: number
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addFocusSession - START")
    
    const validated = focusSessionSchema.parse({
      duration_minutes: typeof data.duration_minutes === 'string' ? parseInt(data.duration_minutes) : data.duration_minutes,
      distractions: data.distractions,
      notes: data.notes,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addFocusSession - Auth error:", authError)
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const { data: insertedData, error } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: user.id,
        duration_minutes: validated.duration_minutes,
        distractions: validated.distractions || 0,
        notes: validated.notes || null,
        log_date: getCurrentISODate(),
      })
      .select()

    if (error) {
      console.error("[SERVER ACTION] addFocusSession - DB error:", error)
      
      if (error.code === "42P01") {
        return {
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-complete.sql' dosyasını çalıştırın."
        }
      }
      if (error.code === "42501") {
        return {
          success: false,
          data: null,
          error: "İzin hatası. RLS politikaları kontrol edilmeli."
        }
      }
      
      return {
        success: false,
        data: null,
        error: `Odak seansı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    console.log("[SERVER ACTION] addFocusSession - SUCCESS:", insertedData)
    revalidatePath("/productivity")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addFocusSession - EXCEPTION:", error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return {
        success: false,
        data: null,
        error: `Geçersiz veri: ${errorMessages}`
      }
    }
    
    return {
      success: false,
      data: null,
      error: error?.message || "Odak seansı eklenirken beklenmeyen bir hata oluştu"
    }
  }
}

// Create Goal
export async function createGoal(data: {
  title: string
  description?: string
  goal_type: "weekly" | "monthly" | "yearly"
  target_date?: string
  progress_percentage?: number
}) {
  try {
    console.log("[SERVER ACTION] createGoal - START")
    
    const validated = goalSchema.parse({
      title: data.title,
      description: data.description,
      goal_type: data.goal_type,
      target_date: data.target_date,
      progress_percentage: data.progress_percentage || 0,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] createGoal - Auth error:", authError)
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const { data: insertedData, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: validated.title,
        description: validated.description || null,
        goal_type: validated.goal_type,
        target_date: validated.target_date || null,
        progress_percentage: validated.progress_percentage || 0,
        status: "active",
      })
      .select()

    if (error) {
      console.error("[SERVER ACTION] createGoal - DB error:", error)
      
      if (error.code === "42P01") {
        return {
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-complete.sql' dosyasını çalıştırın."
        }
      }
      if (error.code === "42501") {
        return {
          success: false,
          data: null,
          error: "İzin hatası. RLS politikaları kontrol edilmeli."
        }
      }
      
      return {
        success: false,
        data: null,
        error: `Hedef oluşturulurken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    console.log("[SERVER ACTION] createGoal - SUCCESS:", insertedData)
    revalidatePath("/productivity")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] createGoal - EXCEPTION:", error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return {
        success: false,
        data: null,
        error: `Geçersiz veri: ${errorMessages}`
      }
    }
    
    return {
      success: false,
      data: null,
      error: error?.message || "Hedef oluşturulurken beklenmeyen bir hata oluştu"
    }
  }
}

// Update Goal
export async function updateGoal(data: {
  id: string
  title?: string
  description?: string
  progress_percentage?: number
  status?: "active" | "completed" | "archived"
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.progress_percentage !== undefined) updateData.progress_percentage = data.progress_percentage
    if (data.status !== undefined) updateData.status = data.status
    updateData.updated_at = new Date().toISOString()

    const { data: updatedData, error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", data.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        data: null,
        error: `Hedef güncellenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    revalidatePath("/productivity")
    return { success: true, data: updatedData, error: null }
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || "Hedef güncellenirken beklenmeyen bir hata oluştu"
    }
  }
}

// Delete Goal
export async function deleteGoal(goalId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", user.id)

    if (error) {
      return {
        success: false,
        error: `Hedef silinirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    revalidatePath("/productivity")
    return { success: true, error: null }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Hedef silinirken beklenmeyen bir hata oluştu"
    }
  }
}

// Get today's Pomodoro sessions
export async function getTodayPomodoroSessions() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const today = getCurrentISODate()
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching today's pomodoro sessions:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getTodayPomodoroSessions:", error)
    return []
  }
}

// Get today's Focus sessions
export async function getTodayFocusSessions() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const today = getCurrentISODate()
    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching today's focus sessions:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getTodayFocusSessions:", error)
    return []
  }
}

// Get active goals
export async function getActiveGoals() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching active goals:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getActiveGoals:", error)
    return []
  }
}

// Get weekly productivity data
export async function getWeeklyProductivityData() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { getStartOfWeek, getEndOfWeek, getDaysInInterval } = await import("@/lib/date-utils")
    const startOfWeek = getStartOfWeek()
    const endOfWeek = getEndOfWeek()
    const days = getDaysInInterval(startOfWeek, endOfWeek)

    // Fetch pomodoro sessions
    const { data: pomodoroData, error: pomodoroError } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", format(startOfWeek, "yyyy-MM-dd"))
      .lte("log_date", format(endOfWeek, "yyyy-MM-dd"))
      .order("log_date", { ascending: true })

    // Fetch focus sessions
    const { data: focusData, error: focusError } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", format(startOfWeek, "yyyy-MM-dd"))
      .lte("log_date", format(endOfWeek, "yyyy-MM-dd"))
      .order("log_date", { ascending: true })

    if (pomodoroError || focusError) {
      console.error("Error fetching weekly productivity data:", pomodoroError || focusError)
      return null
    }

    // Group data by day
    const pomodoroByDay: Record<string, { sessions: number; minutes: number }> = {}
    const focusByDay: Record<string, { sessions: number; minutes: number }> = {}

    days.forEach(day => {
      const dayStr = format(day, "yyyy-MM-dd")
      pomodoroByDay[dayStr] = { sessions: 0, minutes: 0 }
      focusByDay[dayStr] = { sessions: 0, minutes: 0 }
    })

    pomodoroData?.forEach(session => {
      const dayStr = session.log_date
      if (pomodoroByDay[dayStr]) {
        pomodoroByDay[dayStr].sessions++
        pomodoroByDay[dayStr].minutes += session.duration_minutes || 0
      }
    })

    focusData?.forEach(session => {
      const dayStr = session.log_date
      if (focusByDay[dayStr]) {
        focusByDay[dayStr].sessions++
        focusByDay[dayStr].minutes += session.duration_minutes || 0
      }
    })

    // Format for charts
    const pomodoroChart = days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd")
      return {
        date: format(day, "dd/MM"),
        sessions: pomodoroByDay[dayStr]?.sessions || 0,
        minutes: pomodoroByDay[dayStr]?.minutes || 0,
      }
    })

    const focusChart = days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd")
      return {
        date: format(day, "dd/MM"),
        sessions: focusByDay[dayStr]?.sessions || 0,
        minutes: focusByDay[dayStr]?.minutes || 0,
      }
    })

    const totalMinutes = days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd")
      return {
        date: format(day, "dd/MM"),
        minutes: (pomodoroByDay[dayStr]?.minutes || 0) + (focusByDay[dayStr]?.minutes || 0),
      }
    })

    // Calculate averages
    const totalPomodoroMinutes = pomodoroData?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
    const totalFocusMinutes = focusData?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
    const totalPomodoroSessions = pomodoroData?.length || 0
    const totalFocusSessions = focusData?.length || 0

    return {
      pomodoro: pomodoroChart,
      focus: focusChart,
      total: totalMinutes,
      averages: {
        pomodoroMinutes: totalPomodoroMinutes / 7,
        focusMinutes: totalFocusMinutes / 7,
        pomodoroSessions: totalPomodoroSessions / 7,
        focusSessions: totalFocusSessions / 7,
      },
      totals: {
        pomodoroMinutes: totalPomodoroMinutes,
        focusMinutes: totalFocusMinutes,
        pomodoroSessions: totalPomodoroSessions,
        focusSessions: totalFocusSessions,
        totalMinutes: totalPomodoroMinutes + totalFocusMinutes,
      },
    }
  } catch (error) {
    console.error("Error in getWeeklyProductivityData:", error)
    return null
  }
}

// Get monthly productivity data
export async function getMonthlyProductivityData() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { getStartOfMonth, getEndOfMonth, getStartOfWeek, getEndOfWeek } = await import("@/lib/date-utils")
    const startOfMonth = getStartOfMonth()
    const endOfMonth = getEndOfMonth()

    // Fetch all sessions for the month
    const { data: pomodoroData, error: pomodoroError } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", format(startOfMonth, "yyyy-MM-dd"))
      .lte("log_date", format(endOfMonth, "yyyy-MM-dd"))
      .order("log_date", { ascending: true })

    const { data: focusData, error: focusError } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", format(startOfMonth, "yyyy-MM-dd"))
      .lte("log_date", format(endOfMonth, "yyyy-MM-dd"))
      .order("log_date", { ascending: true })

    if (pomodoroError || focusError) {
      console.error("Error fetching monthly productivity data:", pomodoroError || focusError)
      return null
    }

    // Group by weeks
    const weeks: Array<{ start: Date; end: Date; weekNum: number }> = []
    let currentWeekStart = getStartOfWeek(startOfMonth)
    let weekNum = 1

    while (currentWeekStart <= endOfMonth) {
      const weekEnd = getEndOfWeek(currentWeekStart)
      weeks.push({
        start: currentWeekStart,
        end: weekEnd > endOfMonth ? endOfMonth : weekEnd,
        weekNum,
      })
      weekNum++
      currentWeekStart = new Date(weekEnd)
      currentWeekStart.setDate(currentWeekStart.getDate() + 1)
    }

    const pomodoroByWeek = weeks.map(week => {
      const weekPomodoro = pomodoroData?.filter(s => {
        const logDate = new Date(s.log_date)
        return logDate >= week.start && logDate <= week.end
      }) || []
      return {
        week: `Hafta ${week.weekNum}`,
        sessions: weekPomodoro.length,
        minutes: weekPomodoro.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
      }
    })

    const focusByWeek = weeks.map(week => {
      const weekFocus = focusData?.filter(s => {
        const logDate = new Date(s.log_date)
        return logDate >= week.start && logDate <= week.end
      }) || []
      return {
        week: `Hafta ${week.weekNum}`,
        sessions: weekFocus.length,
        minutes: weekFocus.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
      }
    })

    const totalByWeek = weeks.map((week, idx) => ({
      week: `Hafta ${week.weekNum}`,
      minutes: pomodoroByWeek[idx].minutes + focusByWeek[idx].minutes,
    }))

    // Calculate totals and averages
    const totalPomodoroMinutes = pomodoroData?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
    const totalFocusMinutes = focusData?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
    const totalPomodoroSessions = pomodoroData?.length || 0
    const totalFocusSessions = focusData?.length || 0
    const daysInMonth = Math.ceil((endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return {
      pomodoro: pomodoroByWeek,
      focus: focusByWeek,
      total: totalByWeek,
      averages: {
        pomodoroMinutes: totalPomodoroMinutes / daysInMonth,
        focusMinutes: totalFocusMinutes / daysInMonth,
        pomodoroSessions: totalPomodoroSessions / daysInMonth,
        focusSessions: totalFocusSessions / daysInMonth,
      },
      totals: {
        pomodoroMinutes: totalPomodoroMinutes,
        focusMinutes: totalFocusMinutes,
        pomodoroSessions: totalPomodoroSessions,
        focusSessions: totalFocusSessions,
        totalMinutes: totalPomodoroMinutes + totalFocusMinutes,
      },
    }
  } catch (error) {
    console.error("Error in getMonthlyProductivityData:", error)
    return null
  }
}

// Get recent sessions (last 10)
export async function getRecentSessions() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { pomodoro: [], focus: [] }

    const { data: pomodoroData, error: pomodoroError } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    const { data: focusData, error: focusError } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (pomodoroError || focusError) {
      console.error("Error fetching recent sessions:", pomodoroError || focusError)
      return { pomodoro: [], focus: [] }
    }

    return {
      pomodoro: pomodoroData || [],
      focus: focusData || [],
    }
  } catch (error) {
    console.error("Error in getRecentSessions:", error)
    return { pomodoro: [], focus: [] }
  }
}

