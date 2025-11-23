"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentISODate } from "@/lib/date-utils"

// Get or create today's health summary
export async function getOrCreateTodaySummary() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if today's summary exists
  const today = getCurrentISODate()
  const { data: existing, error: fetchError } = await supabase
    .from("daily_health_summary")
    .select("*")
    .eq("user_id", user.id)
    .eq("summary_date", today)
    .maybeSingle()

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching today's summary:", fetchError)
    throw new Error("Günlük özet getirilirken bir hata oluştu")
  }

  // If exists, return it
  if (existing) {
    return existing
  }

  // Check if yesterday had ongoing conditions
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  const { data: yesterdaySummary } = await supabase
    .from("daily_health_summary")
    .select("ongoing_conditions")
    .eq("user_id", user.id)
    .eq("summary_date", yesterdayStr)
    .maybeSingle()

  // Create new summary for today
  const { data: newSummary, error: createError } = await supabase
    .from("daily_health_summary")
    .insert({
      user_id: user.id,
      summary_date: today,
      ongoing_conditions: yesterdaySummary?.ongoing_conditions || null,
      carried_over_conditions: !!yesterdaySummary?.ongoing_conditions?.length,
    })
    .select()
    .single()

  if (createError) {
    console.error("Error creating today's summary:", createError)
    throw new Error("Günlük özet oluşturulurken bir hata oluştu")
  }

  return newSummary
}

// Update daily health summary
export async function updateDailyHealthSummary(data: {
  id: string
  overall_wellness_score?: number | null
  notes?: string | null
  ongoing_conditions?: string[] | null
  symptoms?: string[] | null
  medications_taken?: string[] | null
  is_completed?: boolean
  carried_over_conditions?: boolean
  // Basic metrics
  total_steps?: number
  total_exercise_minutes?: number
  total_water_ml?: number
  total_calories?: number
  sleep_hours?: number | null
  sleep_quality?: "poor" | "fair" | "good" | "excellent" | null
  avg_heart_rate?: number | null
  avg_energy_level?: number | null
  avg_stress_level?: number | null
  cigarettes_count?: number
  alcohol_drinks?: number
  caffeine_mg?: number
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      return { 
        success: false, 
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.overall_wellness_score !== undefined)
      updateData.overall_wellness_score = data.overall_wellness_score
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.ongoing_conditions !== undefined)
      updateData.ongoing_conditions = data.ongoing_conditions
    if (data.symptoms !== undefined) updateData.symptoms = data.symptoms
    if (data.medications_taken !== undefined)
      updateData.medications_taken = data.medications_taken
    if (data.is_completed !== undefined) updateData.is_completed = data.is_completed
    if (data.carried_over_conditions !== undefined)
      updateData.carried_over_conditions = data.carried_over_conditions
    
    // Basic metrics
    if (data.total_steps !== undefined) updateData.total_steps = data.total_steps
    if (data.total_exercise_minutes !== undefined) updateData.total_exercise_minutes = data.total_exercise_minutes
    if (data.total_water_ml !== undefined) updateData.total_water_ml = data.total_water_ml
    if (data.total_calories !== undefined) updateData.total_calories = data.total_calories
    if (data.sleep_hours !== undefined) updateData.sleep_hours = data.sleep_hours
    if (data.sleep_quality !== undefined) updateData.sleep_quality = data.sleep_quality
    if (data.avg_heart_rate !== undefined) updateData.avg_heart_rate = data.avg_heart_rate
    if (data.avg_energy_level !== undefined) updateData.avg_energy_level = data.avg_energy_level
    if (data.avg_stress_level !== undefined) updateData.avg_stress_level = data.avg_stress_level
    if (data.cigarettes_count !== undefined) updateData.cigarettes_count = data.cigarettes_count
    if (data.alcohol_drinks !== undefined) updateData.alcohol_drinks = data.alcohol_drinks
    if (data.caffeine_mg !== undefined) updateData.caffeine_mg = data.caffeine_mg

    const { data: updatedData, error } = await supabase
      .from("daily_health_summary")
      .update(updateData)
      .eq("id", data.id)
      .eq("user_id", user.id)
      .select()

    if (error) {
      console.error("Error updating daily health summary:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false, 
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-daily-health-summary.sql' dosyasını çalıştırın." 
        }
      }
      if (error.code === "42501") {
        return { 
          success: false, 
          error: "İzin hatası. RLS politikaları kontrol edilmeli." 
        }
      }
      
      return { 
        success: false, 
        error: `Günlük özet güncellenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("Daily health summary updated successfully:", updatedData)
    revalidatePath("/health")
    return { success: true }
  } catch (error: any) {
    console.error("Error in updateDailyHealthSummary:", error)
    return { 
      success: false, 
      error: error?.message || "Günlük özet güncellenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// Auto-calculate and update today's summary from logs
export async function calculateTodaySummary() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const today = getCurrentISODate()

  // Get or create today's summary
  const summary = await getOrCreateTodaySummary()

  // Calculate totals from logs
  const [
    stepsResult,
    exerciseResult,
    waterResult,
    nutritionResult,
    sleepResult,
    heartRateResult,
    energyResult,
    stressResult,
    smokingResult,
    alcoholResult,
    caffeineResult,
  ] = await Promise.all([
    // Steps
    supabase
      .from("steps_logs")
      .select("steps_count")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => ({
        total: data?.reduce((sum, log) => sum + (log.steps_count || 0), 0) || 0,
      })),

    // Exercise
    supabase
      .from("exercise_logs")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => ({
        total: data?.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) || 0,
      })),

    // Water
    supabase
      .from("water_intake")
      .select("amount_ml")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => ({
        total: data?.reduce((sum, log) => sum + (log.amount_ml || 0), 0) || 0,
      })),

    // Nutrition
    supabase
      .from("nutrition_logs")
      .select("calories")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => ({
        total: data?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0,
      })),

    // Sleep
    supabase
      .from("sleep_logs")
      .select("sleep_duration, sleep_quality")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => ({
        hours: data?.sleep_duration || null,
        quality: data?.sleep_quality || null,
      })),

    // Heart Rate
    supabase
      .from("health_metrics")
      .select("heart_rate")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => {
        if (!data || data.length === 0) return { avg: null }
        const sum = data.reduce((acc, log) => acc + (log.heart_rate || 0), 0)
        return { avg: Math.round(sum / data.length) }
      }),

    // Energy
    supabase
      .from("energy_logs")
      .select("energy_level")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => {
        if (!data || data.length === 0) return { avg: null }
        const sum = data.reduce((acc, log) => acc + (log.energy_level || 0), 0)
        return { avg: Math.round((sum / data.length) * 10) / 10 }
      }),

    // Stress
    supabase
      .from("stress_logs")
      .select("stress_level")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => {
        if (!data || data.length === 0) return { avg: null }
        const sum = data.reduce((acc, log) => acc + (log.stress_level || 0), 0)
        return { avg: Math.round((sum / data.length) * 10) / 10 }
      }),

    // Smoking
    supabase
      .from("smoking_logs")
      .select("cigarettes_count")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => ({
        total: data?.reduce((sum, log) => sum + (log.cigarettes_count || 0), 0) || 0,
      })),

    // Alcohol
    supabase
      .from("alcohol_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => ({
        total: data?.length || 0,
      })),

    // Caffeine
    supabase
      .from("caffeine_logs")
      .select("caffeine_mg")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => ({
        total: data?.reduce((sum, log) => sum + (log.caffeine_mg || 0), 0) || 0,
      })),
  ])

  // Update summary with calculated values
  const { error } = await supabase
    .from("daily_health_summary")
    .update({
      total_steps: stepsResult.total,
      total_exercise_minutes: exerciseResult.total,
      total_water_ml: waterResult.total,
      total_calories: nutritionResult.total,
      sleep_hours: sleepResult.hours,
      sleep_quality: sleepResult.quality,
      avg_heart_rate: heartRateResult.avg,
      avg_energy_level: energyResult.avg,
      avg_stress_level: stressResult.avg,
      cigarettes_count: smokingResult.total,
      alcohol_drinks: alcoholResult.total,
      caffeine_mg: caffeineResult.total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", summary.id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error updating calculated summary:", error)
    throw new Error("Günlük özet hesaplanırken bir hata oluştu")
  }

  revalidatePath("/health")
  return { success: true }
}

// Get summary for a specific date
export async function getSummaryForDate(date: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("daily_health_summary")
    .select("*")
    .eq("user_id", user.id)
    .eq("summary_date", date)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching summary:", error)
    throw new Error("Özet getirilirken bir hata oluştu")
  }

  return data
}

// Get recent summaries
export async function getRecentSummaries(limit: number = 7) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("daily_health_summary")
    .select("*")
    .eq("user_id", user.id)
    .order("summary_date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent summaries:", error)
    throw new Error("Özetler getirilirken bir hata oluştu")
  }

  return data || []
}

// Delete daily health summary
export async function deleteDailyHealthSummary(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("daily_health_summary")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting daily health summary:", error)
    throw new Error("Günlük özet silinirken bir hata oluştu")
  }

  revalidatePath("/health")
  return { success: true }
}

