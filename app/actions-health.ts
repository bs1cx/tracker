"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation schemas
const heartRateSchema = z.object({
  heart_rate: z.number().int().min(30).max(220),
  notes: z.string().optional(),
})

const waterLogSchema = z.object({
  amount_ml: z.number().int().positive(),
})

const sleepLogSchema = z.object({
  sleep_duration: z.number().positive().max(24),
  sleep_quality: z.enum(["poor", "fair", "good", "excellent"]).optional(),
  rem_duration: z.number().positive().optional(),
  light_sleep_duration: z.number().positive().optional(),
  deep_sleep_duration: z.number().positive().optional(),
  sleep_efficiency: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
})

const nutritionLogSchema = z.object({
  calories: z.number().int().min(0),
  carbs_grams: z.number().positive().optional(),
  protein_grams: z.number().positive().optional(),
  fat_grams: z.number().positive().optional(),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  food_name: z.string().optional(),
})

// ============================================
// SMOKING TRACKING
// ============================================

export async function addSmokingLog(data: {
  cigarettes_count: number
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addSmokingLog - START", { cigarettes_count: data.cigarettes_count })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addSmokingLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addSmokingLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("smoking_logs")
      .insert({
        user_id: user.id,
        cigarettes_count: data.cigarettes_count,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addSmokingLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error details:", error.details)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Sigara kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addSmokingLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addSmokingLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Sigara kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

export async function getSmokingLogs(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("smoking_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_time", { ascending: false })

  if (date) {
    query = query.eq("log_date", date)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching smoking logs:", error)
    return []
  }

  return data || []
}

// ============================================
// GET FUNCTIONS FOR ALL HEALTH LOGS
// ============================================

export async function getAlcoholLogs(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("alcohol_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_time", { ascending: false })

  if (date) {
    query = query.eq("log_date", date)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching alcohol logs:", error)
    return []
  }
  return data || []
}

export async function getCaffeineLogs(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("caffeine_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_time", { ascending: false })

  if (date) {
    query = query.eq("log_date", date)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching caffeine logs:", error)
    return []
  }
  return data || []
}

export async function getStepsLogs(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("steps_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })

  if (date) {
    query = query.eq("log_date", date)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching steps logs:", error)
    return []
  }
  return data || []
}

export async function getExerciseLogs(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("exercise_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_time", { ascending: false })

  if (date) {
    query = query.eq("log_date", date)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching exercise logs:", error)
    return []
  }
  return data || []
}

export async function getEnergyLogs(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("energy_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_time", { ascending: false })

  if (date) {
    query = query.eq("log_date", date)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching energy logs:", error)
    return []
  }
  return data || []
}

export async function getStressLogs(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("stress_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_time", { ascending: false })

  if (date) {
    query = query.eq("log_date", date)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching stress logs:", error)
    return []
  }
  return data || []
}

export async function getWaterLogs(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("water_intake")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })

  if (date) {
    query = query.eq("log_date", date)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching water logs:", error)
    return []
  }
  return data || []
}

export async function getSleepLogs(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("sleep_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })

  if (date) {
    query = query.eq("log_date", date)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching sleep logs:", error)
    return []
  }
  return data || []
}

// ============================================
// WATER INTAKE TRACKING
// ============================================

export async function addWaterLog(data: {
  amount_ml: number
}) {
  try {
    // Validate input
    const validated = waterLogSchema.parse({
      amount_ml: typeof data.amount_ml === 'string' ? parseInt(data.amount_ml) : data.amount_ml,
    })

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

    const { data: insertedData, error } = await supabase
      .from("water_intake")
      .insert({
        user_id: user.id,
        amount_ml: validated.amount_ml,
      })
      .select()

    if (error) {
      console.error("Error adding water log:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false, 
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-fix-health-tables-rls.sql' dosyasını çalıştırın." 
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
        error: `Su kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addWaterLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("Error in addWaterLog:", error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { 
        success: false, 
        error: `Geçersiz veri: ${errorMessages}` 
      }
    }
    
    return { 
      success: false, 
      error: error?.message || "Su kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// HEART RATE TRACKING
// ============================================

export async function addHeartRateLog(data: {
  heart_rate: number
  notes?: string
}) {
  try {
    // Validate input
    const validated = heartRateSchema.parse({
      heart_rate: typeof data.heart_rate === 'string' ? parseInt(data.heart_rate) : data.heart_rate,
      notes: data.notes,
    })

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

    const { data: insertedData, error } = await supabase
      .from("health_metrics")
      .insert({
        user_id: user.id,
        heart_rate: validated.heart_rate,
        log_date: new Date().toISOString().split("T")[0],
      })
      .select()

    if (error) {
      console.error("Error adding heart rate log:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error details:", error.details)
      console.error("Error hint:", error.hint)
      
      // Check for specific error types
      if (error.code === "42P01") {
        return { 
          success: false, 
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-fix-health-tables-rls.sql' dosyasını çalıştırın." 
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
        error: `Nabız kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addHeartRateLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("Error in addHeartRateLog:", error)
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { 
        success: false, 
        error: `Geçersiz veri: ${errorMessages}` 
      }
    }
    
    // Handle other errors
    return { 
      success: false, 
      error: error?.message || "Nabız kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// SLEEP TRACKING
// ============================================

export async function addSleepLog(data: {
  sleep_duration: number
  sleep_quality?: string
  rem_duration?: number
  light_sleep_duration?: number
  deep_sleep_duration?: number
  sleep_efficiency?: number
  notes?: string
}) {
  try {
    // Validate input
    const validated = sleepLogSchema.parse({
      sleep_duration: typeof data.sleep_duration === 'string' ? parseFloat(data.sleep_duration) : data.sleep_duration,
      sleep_quality: data.sleep_quality,
      rem_duration: data.rem_duration,
      light_sleep_duration: data.light_sleep_duration,
      deep_sleep_duration: data.deep_sleep_duration,
      sleep_efficiency: data.sleep_efficiency,
      notes: data.notes,
    })

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

    // Ensure sleep_duration is not null or undefined
    if (!validated.sleep_duration || isNaN(validated.sleep_duration)) {
      return {
        success: false,
        data: null,
        error: "Uyku süresi gereklidir ve geçerli bir sayı olmalıdır."
      }
    }

    const { data: insertedData, error } = await supabase
      .from("sleep_logs")
      .insert({
        user_id: user.id,
        sleep_duration: Number(validated.sleep_duration),
        sleep_quality: validated.sleep_quality || null,
        rem_duration: validated.rem_duration ? Number(validated.rem_duration) : null,
        light_sleep_duration: validated.light_sleep_duration ? Number(validated.light_sleep_duration) : null,
        deep_sleep_duration: validated.deep_sleep_duration ? Number(validated.deep_sleep_duration) : null,
        sleep_efficiency: validated.sleep_efficiency ? Number(validated.sleep_efficiency) : null,
      })
      .select()

    if (error) {
      console.error("Error adding sleep log:", error)
      console.error("Error code:", error.code)
      
      if (error.code === "42P01") {
        return { 
          success: false, 
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-fix-health-tables-rls.sql' dosyasını çalıştırın." 
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
        error: `Uyku kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addSleepLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("Error in addSleepLog:", error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { 
        success: false, 
        error: `Geçersiz veri: ${errorMessages}` 
      }
    }
    
    return { 
      success: false, 
      error: error?.message || "Uyku kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// NUTRITION TRACKING
// ============================================

export async function addNutritionLog(data: {
  calories: number
  carbs_grams?: number
  protein_grams?: number
  fat_grams?: number
  meal_type?: string
  food_name?: string
}) {
  try {
    // Validate input
    const validated = nutritionLogSchema.parse({
      calories: typeof data.calories === 'string' ? parseInt(data.calories) : data.calories,
      carbs_grams: data.carbs_grams,
      protein_grams: data.protein_grams,
      fat_grams: data.fat_grams,
      meal_type: data.meal_type as any,
      food_name: data.food_name,
    })

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

    const { data: insertedData, error } = await supabase
      .from("nutrition_logs")
      .insert({
        user_id: user.id,
        calories: validated.calories,
        carbs_grams: validated.carbs_grams || null,
        protein_grams: validated.protein_grams || null,
        fat_grams: validated.fat_grams || null,
        meal_type: validated.meal_type || null,
        food_name: validated.food_name || null,
      })
      .select()

    if (error) {
      console.error("Error adding nutrition log:", error)
      console.error("Error code:", error.code)
      
      if (error.code === "42P01") {
        return { 
          success: false, 
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-fix-health-tables-rls.sql' dosyasını çalıştırın." 
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
        error: `Beslenme kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addNutritionLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("Error in addNutritionLog:", error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { 
        success: false, 
        error: `Geçersiz veri: ${errorMessages}` 
      }
    }
    
    return { 
      success: false, 
      error: error?.message || "Beslenme kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// ALCOHOL TRACKING
// ============================================

export async function addAlcoholLog(data: {
  drink_type: string
  amount_ml: number
  alcohol_percentage?: number
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addAlcoholLog - START", { drink_type: data.drink_type, amount_ml: data.amount_ml })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addAlcoholLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addAlcoholLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("alcohol_logs")
      .insert({
        user_id: user.id,
        drink_type: data.drink_type,
        amount_ml: data.amount_ml,
        alcohol_percentage: data.alcohol_percentage || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addAlcoholLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Alkol kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addAlcoholLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addAlcoholLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Alkol kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// CAFFEINE TRACKING
// ============================================

export async function addCaffeineLog(data: {
  source: string
  caffeine_mg: number
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addCaffeineLog - START", { source: data.source, caffeine_mg: data.caffeine_mg })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addCaffeineLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addCaffeineLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("caffeine_logs")
      .insert({
        user_id: user.id,
        source: data.source,
        caffeine_mg: data.caffeine_mg,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addCaffeineLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Kafein kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addCaffeineLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addCaffeineLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Kafein kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// STEPS TRACKING
// ============================================

export async function addStepsLog(data: {
  steps_count: number
  distance_km?: number
  calories_burned?: number
}) {
  try {
    console.log("[SERVER ACTION] addStepsLog - START", { steps_count: data.steps_count })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addStepsLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addStepsLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("steps_logs")
      .insert({
        user_id: user.id,
        steps_count: data.steps_count,
        distance_km: data.distance_km || null,
        calories_burned: data.calories_burned || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addStepsLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Adım kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addStepsLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addStepsLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Adım kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// EXERCISE TRACKING
// ============================================

export async function addExerciseLog(data: {
  exercise_type: string
  duration_minutes: number
  intensity?: string
  calories_burned?: number
  distance_km?: number
  heart_rate_avg?: number
  heart_rate_max?: number
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addExerciseLog - START", { exercise_type: data.exercise_type, duration_minutes: data.duration_minutes })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addExerciseLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addExerciseLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("exercise_logs")
      .insert({
        user_id: user.id,
        exercise_type: data.exercise_type,
        duration_minutes: data.duration_minutes,
        intensity: data.intensity || null,
        calories_burned: data.calories_burned || null,
        distance_km: data.distance_km || null,
        heart_rate_avg: data.heart_rate_avg || null,
        heart_rate_max: data.heart_rate_max || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addExerciseLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Egzersiz kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addExerciseLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addExerciseLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Egzersiz kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// BODY MEASUREMENTS
// ============================================

export async function addBodyMeasurement(data: {
  weight_kg?: number
  height_cm?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  waist_cm?: number
  chest_cm?: number
  hip_cm?: number
  neck_cm?: number
}) {
  try {
    console.log("[SERVER ACTION] addBodyMeasurement - START", { weight_kg: data.weight_kg, height_cm: data.height_cm })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addBodyMeasurement - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    // Calculate BMI if weight and height are provided
    let bmi: number | null = null
    if (data.weight_kg && data.height_cm) {
      const height_m = data.height_cm / 100
      bmi = data.weight_kg / (height_m * height_m)
    }

    console.log("[SERVER ACTION] addBodyMeasurement - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("body_measurements")
      .insert({
        user_id: user.id,
        weight_kg: data.weight_kg || null,
        height_cm: data.height_cm || null,
        bmi: bmi,
        body_fat_percentage: data.body_fat_percentage || null,
        muscle_mass_kg: data.muscle_mass_kg || null,
        waist_cm: data.waist_cm || null,
        chest_cm: data.chest_cm || null,
        hip_cm: data.hip_cm || null,
        neck_cm: data.neck_cm || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addBodyMeasurement - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Vücut ölçüsü eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addBodyMeasurement - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addBodyMeasurement - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Vücut ölçüsü eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// MEDICATION TRACKING
// ============================================

export async function addMedicationLog(data: {
  medication_name: string
  dosage?: string
  frequency?: string
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addMedicationLog - START", { medication_name: data.medication_name })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addMedicationLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addMedicationLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("medication_logs")
      .insert({
        user_id: user.id,
        medication_name: data.medication_name,
        dosage: data.dosage || null,
        frequency: data.frequency || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addMedicationLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `İlaç kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addMedicationLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addMedicationLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "İlaç kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// SYMPTOM TRACKING
// ============================================

export async function addSymptomLog(data: {
  symptom_type: string
  severity?: number
  location?: string
  duration_minutes?: number
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addSymptomLog - START", { symptom_type: data.symptom_type })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addSymptomLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addSymptomLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("symptom_logs")
      .insert({
        user_id: user.id,
        symptom_type: data.symptom_type,
        severity: data.severity || null,
        location: data.location || null,
        duration_minutes: data.duration_minutes || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addSymptomLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Semptom kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addSymptomLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addSymptomLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Semptom kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// PAIN TRACKING
// ============================================

export async function addPainLog(data: {
  pain_level: number
  pain_type?: string
  location: string
  duration_minutes?: number
  triggers?: string
  relief_method?: string
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addPainLog - START", { pain_level: data.pain_level, location: data.location })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addPainLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addPainLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("pain_logs")
      .insert({
        user_id: user.id,
        pain_level: data.pain_level,
        pain_type: data.pain_type || null,
        location: data.location,
        duration_minutes: data.duration_minutes || null,
        triggers: data.triggers || null,
        relief_method: data.relief_method || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addPainLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Ağrı kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addPainLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addPainLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Ağrı kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// ENERGY LEVEL TRACKING
// ============================================

export async function addEnergyLog(data: {
  energy_level: number
  time_of_day?: string
  factors?: string
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addEnergyLog - START", { energy_level: data.energy_level })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addEnergyLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addEnergyLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("energy_logs")
      .insert({
        user_id: user.id,
        energy_level: data.energy_level,
        time_of_day: data.time_of_day || null,
        factors: data.factors || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addEnergyLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Enerji seviyesi kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addEnergyLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addEnergyLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Enerji seviyesi kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

// ============================================
// STRESS LEVEL TRACKING
// ============================================

export async function addStressLog(data: {
  stress_level: number
  stress_source?: string
  coping_method?: string
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addStressLog - START", { stress_level: data.stress_level })
    
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addStressLog - Auth error:", authError)
      return { 
        success: false, 
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın." 
      }
    }

    console.log("[SERVER ACTION] addStressLog - Before DB insert")
    const { data: insertedData, error } = await supabase
      .from("stress_logs")
      .insert({
        user_id: user.id,
        stress_level: data.stress_level,
        stress_source: data.stress_source || null,
        coping_method: data.coping_method || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[SERVER ACTION] addStressLog - DB error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      if (error.code === "42P01") {
        return { 
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-health-extended.sql' dosyasını çalıştırın." 
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
        error: `Stres seviyesi kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}` 
      }
    }

    console.log("[SERVER ACTION] addStressLog - SUCCESS:", insertedData)
    revalidatePath("/health")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addStressLog - EXCEPTION:", error)
    return { 
      success: false, 
      data: null,
      error: error?.message || "Stres seviyesi kaydı eklenirken beklenmeyen bir hata oluştu" 
    }
  }
}

