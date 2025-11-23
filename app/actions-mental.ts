"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentISODate } from "@/lib/date-utils"

// Validation schemas
const moodLogSchema = z.object({
  mood_score: z.number().int().min(1).max(10),
  mood_label: z.string().optional(),
  notes: z.string().optional(),
})

const motivationLogSchema = z.object({
  motivation_score: z.number().int().min(1).max(10),
  notes: z.string().optional(),
})

const meditationSessionSchema = z.object({
  duration_minutes: z.number().int().positive(),
  type: z.enum(["breathing", "mindfulness", "guided", "other"]).optional(),
  notes: z.string().optional(),
})

const journalEntrySchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "İçerik gereklidir"),
  mood_before: z.number().int().min(1).max(10).optional(),
  mood_after: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string()).optional(),
})

// Add mood log
export async function addMoodLog(data: {
  mood_score: number
  mood_label?: string
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addMoodLog - START")
    
    const validated = moodLogSchema.parse({
      mood_score: typeof data.mood_score === 'string' ? parseInt(data.mood_score) : data.mood_score,
      mood_label: data.mood_label,
      notes: data.notes,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addMoodLog - Auth error:", authError)
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const { data: insertedData, error } = await supabase
      .from("mood_logs")
      .insert({
        user_id: user.id,
        mood_score: validated.mood_score,
        mood_label: validated.mood_label || null,
        notes: validated.notes || null,
        log_date: getCurrentISODate(),
      })
      .select()

    if (error) {
      console.error("[SERVER ACTION] addMoodLog - DB error:", error)
      
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
        error: `Ruh hali kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    console.log("[SERVER ACTION] addMoodLog - SUCCESS:", insertedData)
    revalidatePath("/mental")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addMoodLog - EXCEPTION:", error)
    
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
      error: error?.message || "Ruh hali kaydı eklenirken beklenmeyen bir hata oluştu"
    }
  }
}

// Add motivation log
export async function addMotivationLog(data: {
  motivation_score: number
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addMotivationLog - START")
    
    const validated = motivationLogSchema.parse({
      motivation_score: typeof data.motivation_score === 'string' ? parseInt(data.motivation_score) : data.motivation_score,
      notes: data.notes,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addMotivationLog - Auth error:", authError)
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const { data: insertedData, error } = await supabase
      .from("motivation_logs")
      .insert({
        user_id: user.id,
        motivation_score: validated.motivation_score,
        notes: validated.notes || null,
        log_date: getCurrentISODate(),
      })
      .select()

    if (error) {
      console.error("[SERVER ACTION] addMotivationLog - DB error:", error)
      
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
        error: `Motivasyon kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    console.log("[SERVER ACTION] addMotivationLog - SUCCESS:", insertedData)
    revalidatePath("/mental")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addMotivationLog - EXCEPTION:", error)
    
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
      error: error?.message || "Motivasyon kaydı eklenirken beklenmeyen bir hata oluştu"
    }
  }
}

// Add meditation session
export async function addMeditationSession(data: {
  duration_minutes: number
  type?: "breathing" | "mindfulness" | "guided" | "other"
  notes?: string
}) {
  try {
    console.log("[SERVER ACTION] addMeditationSession - START")
    
    const validated = meditationSessionSchema.parse({
      duration_minutes: typeof data.duration_minutes === 'string' ? parseInt(data.duration_minutes) : data.duration_minutes,
      type: data.type || "other",
      notes: data.notes,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addMeditationSession - Auth error:", authError)
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    // Map type to match database schema
    const sessionType = validated.type === "breathing" ? "breathing" 
      : validated.type === "mindfulness" ? "mindfulness"
      : validated.type === "guided" ? "guided"
      : "other"

    const { data: insertedData, error } = await supabase
      .from("meditation_sessions")
      .insert({
        user_id: user.id,
        duration_minutes: validated.duration_minutes,
        type: sessionType,
        notes: validated.notes || null,
        log_date: getCurrentISODate(),
      })
      .select()

    if (error) {
      console.error("[SERVER ACTION] addMeditationSession - DB error:", error)
      
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
        error: `Meditasyon kaydı eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    console.log("[SERVER ACTION] addMeditationSession - SUCCESS:", insertedData)
    revalidatePath("/mental")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addMeditationSession - EXCEPTION:", error)
    
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
      error: error?.message || "Meditasyon kaydı eklenirken beklenmeyen bir hata oluştu"
    }
  }
}

// Add journal entry
export async function addJournalEntry(data: {
  title?: string
  content: string
  mood_before?: number
  mood_after?: number
  tags?: string[]
}) {
  try {
    console.log("[SERVER ACTION] addJournalEntry - START")
    
    const validated = journalEntrySchema.parse({
      title: data.title,
      content: data.content,
      mood_before: data.mood_before ? (typeof data.mood_before === 'string' ? parseInt(data.mood_before) : data.mood_before) : undefined,
      mood_after: data.mood_after ? (typeof data.mood_after === 'string' ? parseInt(data.mood_after) : data.mood_after) : undefined,
      tags: data.tags,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addJournalEntry - Auth error:", authError)
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const { data: insertedData, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        title: validated.title || null,
        content: validated.content,
        mood_before: validated.mood_before || null,
        mood_after: validated.mood_after || null,
        tags: validated.tags || null,
        log_date: getCurrentISODate(),
      })
      .select()

    if (error) {
      console.error("[SERVER ACTION] addJournalEntry - DB error:", error)
      
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
        error: `Günlük girişi eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    console.log("[SERVER ACTION] addJournalEntry - SUCCESS:", insertedData)
    revalidatePath("/mental")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addJournalEntry - EXCEPTION:", error)
    
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
      error: error?.message || "Günlük girişi eklenirken beklenmeyen bir hata oluştu"
    }
  }
}

// Get today's mood
export async function getTodayMood() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const today = getCurrentISODate()
    const { data, error } = await supabase
      .from("mood_logs")
      .select("mood_score, mood_label")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Error fetching today's mood:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getTodayMood:", error)
    return null
  }
}

// Get today's motivation
export async function getTodayMotivation() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const today = getCurrentISODate()
    const { data, error } = await supabase
      .from("motivation_logs")
      .select("motivation_score")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Error fetching today's motivation:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getTodayMotivation:", error)
    return null
  }
}

// Get today's meditation total minutes
export async function getTodayMeditationMinutes() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return 0

    const today = getCurrentISODate()
    const { data, error } = await supabase
      .from("meditation_sessions")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .eq("log_date", today)

    if (error) {
      console.error("Error fetching today's meditation:", error)
      return 0
    }

    return data?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0
  } catch (error) {
    console.error("Error in getTodayMeditationMinutes:", error)
    return 0
  }
}

// Get today's journal entries count
export async function getTodayJournalCount() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return 0

    const today = getCurrentISODate()
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)

    if (error) {
      console.error("Error fetching today's journal entries:", error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error("Error in getTodayJournalCount:", error)
    return 0
  }
}

