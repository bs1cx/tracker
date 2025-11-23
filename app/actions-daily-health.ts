"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentISODate } from "@/lib/date-utils"
import { DailyHealthSummary } from "@/types/database"

// Serialize summary data to ensure all values are JSON-serializable
function serializeSummary(data: any): DailyHealthSummary {
  return {
    id: String(data.id || ""),
    user_id: String(data.user_id || ""),
    summary_date: data.summary_date ? String(data.summary_date) : getCurrentISODate(),
    overall_wellness_score: data.overall_wellness_score != null ? Number(data.overall_wellness_score) : null,
    notes: data.notes ? String(data.notes) : null,
    ongoing_conditions: Array.isArray(data.ongoing_conditions) ? data.ongoing_conditions.map(String) : null,
    symptoms: Array.isArray(data.symptoms) ? data.symptoms.map(String) : null,
    medications_taken: Array.isArray(data.medications_taken) ? data.medications_taken.map(String) : null,
    total_steps: Number(data.total_steps ?? 0),
    total_exercise_minutes: Number(data.total_exercise_minutes ?? 0),
    total_water_ml: Number(data.total_water_ml ?? 0),
    total_calories: Number(data.total_calories ?? 0),
    sleep_hours: data.sleep_hours != null ? Number(data.sleep_hours) : null,
    sleep_quality: data.sleep_quality || null,
    avg_heart_rate: data.avg_heart_rate != null ? Number(data.avg_heart_rate) : null,
    avg_energy_level: data.avg_energy_level != null ? Number(data.avg_energy_level) : null,
    avg_stress_level: data.avg_stress_level != null ? Number(data.avg_stress_level) : null,
    cigarettes_count: Number(data.cigarettes_count ?? 0),
    alcohol_drinks: Number(data.alcohol_drinks ?? 0),
    caffeine_mg: Number(data.caffeine_mg ?? 0),
    is_completed: Boolean(data.is_completed ?? false),
    carried_over_conditions: Boolean(data.carried_over_conditions ?? false),
    created_at: data.created_at ? (data.created_at instanceof Date ? data.created_at.toISOString() : String(data.created_at)) : new Date().toISOString(),
    updated_at: data.updated_at ? (data.updated_at instanceof Date ? data.updated_at.toISOString() : String(data.updated_at)) : new Date().toISOString(),
  }
}

// Get or create today's health summary
export async function getOrCreateTodaySummary() {
  try {
    console.log("[SERVER ACTION] getOrCreateTodaySummary - START")
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] getOrCreateTodaySummary - Auth error:", authError)
      throw new Error("Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.")
    }

    // Check if today's summary exists
    const today = getCurrentISODate()
    console.log("[SERVER ACTION] getOrCreateTodaySummary - Checking for existing summary for date:", today)
    
    const { data: existing, error: fetchError } = await supabase
      .from("daily_health_summary")
      .select("*")
      .eq("user_id", user.id)
      .eq("summary_date", today)
      .maybeSingle()

    if (fetchError) {
      // Check if table doesn't exist
      if (fetchError.code === "42P01") {
        console.error("[SERVER ACTION] getOrCreateTodaySummary - Table doesn't exist:", fetchError)
        throw new Error("Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-daily-health-summary.sql' dosyasını çalıştırın.")
      }
      // Check if column doesn't exist
      if (fetchError.code === "42703") {
        console.error("[SERVER ACTION] getOrCreateTodaySummary - Column doesn't exist:", fetchError)
        throw new Error("Veritabanı kolonu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-daily-health-summary.sql' dosyasını çalıştırın.")
      }
      // Only throw if it's not a "not found" error
      if (fetchError.code !== "PGRST116") {
        console.error("[SERVER ACTION] getOrCreateTodaySummary - Fetch error:", fetchError)
        throw new Error(`Günlük özet getirilirken bir hata oluştu: ${fetchError.message || "Bilinmeyen hata"}`)
      }
    }

    // If exists, return it (with proper serialization)
    if (existing) {
      console.log("[SERVER ACTION] getOrCreateTodaySummary - Found existing summary:", existing.id)
      return serializeSummary(existing)
    }

    // Check if yesterday had ongoing conditions
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    console.log("[SERVER ACTION] getOrCreateTodaySummary - Checking yesterday's summary:", yesterdayStr)
    
    const { data: yesterdaySummary, error: yesterdayError } = await supabase
      .from("daily_health_summary")
      .select("ongoing_conditions")
      .eq("user_id", user.id)
      .eq("summary_date", yesterdayStr)
      .maybeSingle()

    if (yesterdayError && yesterdayError.code !== "PGRST116" && yesterdayError.code !== "42703") {
      console.error("[SERVER ACTION] getOrCreateTodaySummary - Error fetching yesterday's summary:", yesterdayError)
      // Don't throw, just continue without carry-over
    }

    // Create new summary for today
    console.log("[SERVER ACTION] getOrCreateTodaySummary - Creating new summary")
    
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
      console.error("[SERVER ACTION] getOrCreateTodaySummary - Create error:", createError)
      console.error("Error code:", createError.code)
      console.error("Error message:", createError.message)
      
      if (createError.code === "42P01") {
        throw new Error("Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-daily-health-summary.sql' dosyasını çalıştırın.")
      }
      if (createError.code === "42703") {
        throw new Error("Veritabanı kolonu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-daily-health-summary.sql' dosyasını çalıştırın.")
      }
      if (createError.code === "42501") {
        throw new Error("İzin hatası. RLS politikaları kontrol edilmeli.")
      }
      
      throw new Error(`Günlük özet oluşturulurken bir hata oluştu: ${createError.message || "Bilinmeyen hata"}`)
    }

    console.log("[SERVER ACTION] getOrCreateTodaySummary - SUCCESS:", newSummary?.id)
    return serializeSummary(newSummary)
  } catch (error: any) {
    console.error("[SERVER ACTION] getOrCreateTodaySummary - EXCEPTION:", error)
    throw error // Re-throw to let client handle it
  }
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
  try {
    console.log("[SERVER ACTION] calculateTodaySummary - START")
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] calculateTodaySummary - Auth error:", authError)
      throw new Error("Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.")
    }

    const today = getCurrentISODate()

    // Get or create today's summary
    const summary = await getOrCreateTodaySummary()
    
    if (!summary || !summary.id) {
      console.error("[SERVER ACTION] calculateTodaySummary - No summary found")
      throw new Error("Günlük özet bulunamadı")
    }

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
    Promise.resolve(
      supabase
        .from("steps_logs")
        .select("steps_count")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error) return { total: 0 }
      const total = data?.reduce((sum, log) => {
        const count = Number(log?.steps_count ?? 0)
        return sum + (isNaN(count) ? 0 : count)
      }, 0) ?? 0
      return { total: Number(total) || 0 }
    }).catch(() => ({ total: 0 })),

    // Exercise
    Promise.resolve(
      supabase
        .from("exercise_logs")
        .select("duration_minutes")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error) return { total: 0 }
      const total = data?.reduce((sum, log) => {
        const minutes = Number(log?.duration_minutes ?? 0)
        return sum + (isNaN(minutes) ? 0 : minutes)
      }, 0) ?? 0
      return { total: Number(total) || 0 }
    }).catch(() => ({ total: 0 })),

    // Water
    Promise.resolve(
      supabase
        .from("water_intake")
        .select("amount_ml")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error) return { total: 0 }
      const total = data?.reduce((sum, log) => {
        const ml = Number(log?.amount_ml ?? 0)
        return sum + (isNaN(ml) ? 0 : ml)
      }, 0) ?? 0
      return { total: Number(total) || 0 }
    }).catch(() => ({ total: 0 })),

    // Nutrition
    Promise.resolve(
      supabase
        .from("nutrition_logs")
        .select("calories")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error) return { total: 0 }
      const total = data?.reduce((sum, log) => {
        const calories = Number(log?.calories ?? 0)
        return sum + (isNaN(calories) ? 0 : calories)
      }, 0) ?? 0
      return { total: Number(total) || 0 }
    }).catch(() => ({ total: 0 })),

    // Sleep
    Promise.resolve(
      supabase
        .from("sleep_logs")
        .select("sleep_duration, sleep_quality")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).then(({ data, error }) => {
      if (error) return { hours: null, quality: null }
      const hours = data?.sleep_duration != null ? Number(data.sleep_duration) : null
      return {
        hours: hours != null && !isNaN(hours) ? hours : null,
        quality: data?.sleep_quality || null,
      }
    }).catch(() => ({ hours: null, quality: null })),

    // Heart Rate
    Promise.resolve(
      supabase
        .from("health_metrics")
        .select("heart_rate")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error || !data || data.length === 0) return { avg: null }
      const validRates = data
        .map(log => Number(log?.heart_rate ?? 0))
        .filter(rate => !isNaN(rate) && rate > 0)
      if (validRates.length === 0) return { avg: null }
      const sum = validRates.reduce((acc, rate) => acc + rate, 0)
      return { avg: Math.round(sum / validRates.length) }
    }).catch(() => ({ avg: null })),

    // Energy
    Promise.resolve(
      supabase
        .from("energy_logs")
        .select("energy_level")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error || !data || data.length === 0) return { avg: null }
      const validLevels = data
        .map(log => Number(log?.energy_level ?? 0))
        .filter(level => !isNaN(level))
      if (validLevels.length === 0) return { avg: null }
      const sum = validLevels.reduce((acc, level) => acc + level, 0)
      return { avg: Math.round((sum / validLevels.length) * 10) / 10 }
    }).catch(() => ({ avg: null })),

    // Stress
    Promise.resolve(
      supabase
        .from("stress_logs")
        .select("stress_level")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error || !data || data.length === 0) return { avg: null }
      const validLevels = data
        .map(log => Number(log?.stress_level ?? 0))
        .filter(level => !isNaN(level))
      if (validLevels.length === 0) return { avg: null }
      const sum = validLevels.reduce((acc, level) => acc + level, 0)
      return { avg: Math.round((sum / validLevels.length) * 10) / 10 }
    }).catch(() => ({ avg: null })),

    // Smoking
    Promise.resolve(
      supabase
        .from("smoking_logs")
        .select("cigarettes_count")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error) return { total: 0 }
      const total = data?.reduce((sum, log) => {
        const count = Number(log?.cigarettes_count ?? 0)
        return sum + (isNaN(count) ? 0 : count)
      }, 0) ?? 0
      return { total: Number(total) || 0 }
    }).catch(() => ({ total: 0 })),

    // Alcohol
    Promise.resolve(
      supabase
        .from("alcohol_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error) return { total: 0 }
      return { total: Array.isArray(data) ? data.length : 0 }
    }).catch(() => ({ total: 0 })),

    // Caffeine
    Promise.resolve(
      supabase
        .from("caffeine_logs")
        .select("caffeine_mg")
        .eq("user_id", user.id)
        .eq("log_date", today)
    ).then(({ data, error }) => {
      if (error) return { total: 0 }
      const total = data?.reduce((sum, log) => {
        const mg = Number(log?.caffeine_mg ?? 0)
        return sum + (isNaN(mg) ? 0 : mg)
      }, 0) ?? 0
      return { total: Number(total) || 0 }
    }).catch(() => ({ total: 0 })),
  ])

  // Update summary with calculated values (ensure all are numbers, not null/undefined)
  const updateData: any = {
    total_steps: Number(stepsResult?.total ?? 0) || 0,
    total_exercise_minutes: Number(exerciseResult?.total ?? 0) || 0,
    total_water_ml: Number(waterResult?.total ?? 0) || 0,
    total_calories: Number(nutritionResult?.total ?? 0) || 0,
    sleep_hours: sleepResult?.hours != null ? Number(sleepResult.hours) : null,
    sleep_quality: sleepResult?.quality || null,
    avg_heart_rate: heartRateResult?.avg != null ? Number(heartRateResult.avg) : null,
    avg_energy_level: energyResult?.avg != null ? Number(energyResult.avg) : null,
    avg_stress_level: stressResult?.avg != null ? Number(stressResult.avg) : null,
    cigarettes_count: Number(smokingResult?.total ?? 0) || 0,
    alcohol_drinks: Number(alcoholResult?.total ?? 0) || 0,
    caffeine_mg: Number(caffeineResult?.total ?? 0) || 0,
    updated_at: new Date().toISOString(),
  }

  console.log("[SERVER ACTION] calculateTodaySummary - Updating with data:", updateData)

  const { error } = await supabase
    .from("daily_health_summary")
    .update(updateData)
    .eq("id", summary.id)
    .eq("user_id", user.id)

  if (error) {
    console.error("[SERVER ACTION] calculateTodaySummary - Update error:", error)
    console.error("Error code:", error.code)
    console.error("Error message:", error.message)
    
    if (error.code === "42P01") {
      throw new Error("Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-daily-health-summary.sql' dosyasını çalıştırın.")
    }
    if (error.code === "42703") {
      throw new Error("Veritabanı kolonu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-daily-health-summary.sql' dosyasını çalıştırın.")
    }
    
    throw new Error(`Günlük özet hesaplanırken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`)
  }

  console.log("[SERVER ACTION] calculateTodaySummary - SUCCESS")
  revalidatePath("/health")
  return { success: true }
  } catch (error: any) {
    console.error("[SERVER ACTION] calculateTodaySummary - EXCEPTION:", error)
    console.error("Error stack:", error?.stack)
    throw error // Re-throw to let client handle it
  }
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

