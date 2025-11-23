"use server"

import { createClient } from "@/lib/supabase/server"
import {
  trackableSchema,
  updateTrackableSchema,
  incrementProgressSchema,
  completeTrackableSchema,
} from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { getCurrentISODate, isSameCalendarDay } from "@/lib/date-utils"

export async function createTrackable(data: {
  title: string
  type: "DAILY_HABIT" | "ONE_TIME" | "PROGRESS"
  target_value?: number | null
  reset_frequency?: "daily" | "weekly" | "none"
  scheduled_time?: string | null
  priority?: "low" | "medium" | "high"
  selected_days?: string[] | null
  category?: "task" | "habit"
  start_date?: string
}) {
  try {
    // Log incoming data
    console.log("createTrackable called with data:", JSON.stringify(data, null, 2))
    
    // Validate data first
    let validated
    try {
      validated = trackableSchema.parse(data)
      console.log("Validation successful:", JSON.stringify(validated, null, 2))
    } catch (validationError: any) {
      console.error("Validation error:", validationError)
      if (validationError.errors) {
        const errorMessages = validationError.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new Error(`Geçersiz veri: ${errorMessages}`)
      }
      throw new Error(`Geçersiz veri: ${validationError.message || "Lütfen tüm alanları doğru doldurun"}`)
    }
    
    const supabase = await createClient()
    console.log("Supabase client created successfully")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const insertData: any = {
      user_id: user.id,
      title: validated.title,
      type: validated.type,
      target_value: validated.target_value ?? null,
      reset_frequency: validated.reset_frequency,
      status: "active",
      current_value: 0,
    }

    // Only add optional fields if they are provided
    // Try to add priority and scheduled_time, but handle gracefully if columns don't exist
    if (data.scheduled_time && data.scheduled_time.trim() !== "") {
      insertData.scheduled_time = data.scheduled_time
    }
    if (data.priority) {
      insertData.priority = data.priority
    }
    if (data.category) {
      insertData.category = data.category
    }
    if (data.start_date) {
      insertData.start_date = data.start_date
    } else {
      insertData.start_date = getCurrentISODate().split("T")[0] // Default to today
    }
    // selected_days is now required, so always include it
    if (data.selected_days && data.selected_days.length > 0) {
      insertData.selected_days = data.selected_days
    } else {
      throw new Error("En az 1 gün seçmelisiniz")
    }

    // Log the data we're trying to insert (for debugging)
    console.log("Attempting to insert trackable with data:", JSON.stringify(insertData, null, 2))

    const { error, data: insertedData } = await supabase
      .from("trackables")
      .insert(insertData)
      .select()

    if (error) {
      console.error("Supabase error creating trackable:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error details:", error.details)
      console.error("Error hint:", error.hint)
      console.error("Full error object:", JSON.stringify(error, null, 2))
      
      // Check if it's a column missing error
      if (
        error.message?.includes("column") ||
        error.code === "42703" ||
        error.message?.includes("priority") ||
        error.message?.includes("scheduled_time") ||
        error.message?.includes("category") ||
        error.message?.includes("selected_days")
      ) {
        // Try again without optional columns
        const fallbackData: any = {
          user_id: user.id,
          title: validated.title,
          type: validated.type,
          target_value: validated.target_value ?? null,
          reset_frequency: validated.reset_frequency,
          status: "active",
          current_value: 0,
        }

        // Only add selected_days if it exists and is valid
        if (data.selected_days && data.selected_days.length > 0) {
          try {
            fallbackData.selected_days = data.selected_days
          } catch (e) {
            console.warn("Could not add selected_days, column may not exist")
          }
        }

        const { error: fallbackError } = await supabase
          .from("trackables")
          .insert(fallbackData)

        if (fallbackError) {
          throw new Error(
            `Database hatası: ${fallbackError.message}. Lütfen migration script'lerini çalıştırın: supabase-migration-complete.sql ve supabase-schema-category.sql`
          )
        }

        // Success with fallback - warn user
        console.warn(
          "Trackable created without some optional fields. Please run migration scripts."
        )
      } else {
        // Return more detailed error message
        const errorMessage = error.message || "Görev oluşturulurken bir hata oluştu"
        throw new Error(`Database hatası: ${errorMessage}. Hata kodu: ${error.code || "bilinmiyor"}`)
      }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    // Log detailed error information
    console.error("Error creating trackable:", error)
    console.error("Error stack:", error?.stack)
    console.error("Error name:", error?.name)
    console.error("Error code:", (error as any)?.code)
    console.error("Error message:", error?.message)
    
    // Try to extract more details from Supabase errors
    const errorCode = (error as any)?.code
    if (errorCode) {
      console.error("Supabase error code:", errorCode)
    }
    if ((error as any)?.details) {
      console.error("Supabase error details:", (error as any).details)
    }
    if ((error as any)?.hint) {
      console.error("Supabase error hint:", (error as any).hint)
    }
    
    // For server actions, we need to throw errors, not return them
    // But we'll make the error message more user-friendly
    if (error instanceof Error) {
      const errorMsg = error.message || "Bilinmeyen hata"
      
      // Check if it's a Zod validation error
      if (errorMsg.includes("ZodError") || errorMsg.includes("validation") || errorMsg.includes("Geçersiz veri")) {
        throw new Error(`Doğrulama hatası: ${errorMsg}`)
      }
      
      // Check if it's a database column error
      if (errorMsg.includes("column") || errorMsg.includes("42703") || errorCode === "42703") {
        throw new Error(
          `Database kolonu eksik (Hata kodu: ${errorCode || "42703"}). Lütfen Supabase SQL Editor'de şu migration script'lerini sırayla çalıştırın:\n\n1. supabase-migration-complete.sql\n2. supabase-schema-category.sql\n\nNot: Sadece SQL içeriğini kopyalayın, "use server" veya "use client" gibi JavaScript kodlarını eklemeyin.`
        )
      }
      
      // Check for other common Supabase errors
      if (errorCode === "23505") {
        throw new Error("Bu öğe zaten mevcut. Lütfen farklı bir isim deneyin.")
      }
      if (errorCode === "23503") {
        throw new Error("Geçersiz referans. Lütfen verilerinizi kontrol edin.")
      }
      
      // Include error code in message for debugging
      const codeStr = errorCode ? ` (Kod: ${errorCode})` : ""
      throw new Error(`${errorMsg}${codeStr}`)
    }
    
    // For non-Error objects, try to stringify
    const errorString = typeof error === "object" ? JSON.stringify(error, null, 2) : String(error)
    throw new Error(`Görev oluşturulurken beklenmeyen bir hata oluştu: ${errorString}`)
  }
}

export async function updateTrackable(data: {
  id: string
  title?: string
  type?: "DAILY_HABIT" | "ONE_TIME" | "PROGRESS"
  status?: "active" | "completed" | "archived"
  current_value?: number
  target_value?: number | null
  reset_frequency?: "daily" | "weekly" | "none"
  priority?: "low" | "medium" | "high"
  scheduled_time?: string | null
  selected_days?: string[] | null
  category?: "task" | "habit"
  start_date?: string
}) {
  try {
    const validated = updateTrackableSchema.parse(data)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const updateData: any = {
      updated_at: getCurrentISODate(),
    }

    if (validated.title) updateData.title = validated.title
    if (validated.status) updateData.status = validated.status
    if (validated.type) updateData.type = validated.type
    if (validated.current_value !== undefined)
      updateData.current_value = validated.current_value
    if (validated.target_value !== undefined)
      updateData.target_value = validated.target_value
    if (validated.reset_frequency !== undefined)
      updateData.reset_frequency = validated.reset_frequency
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.scheduled_time !== undefined)
      updateData.scheduled_time = data.scheduled_time
    if (data.start_date !== undefined)
      updateData.start_date = data.start_date

    const { error } = await supabase
      .from("trackables")
      .update(updateData)
      .eq("id", validated.id)
      .eq("user_id", user.id)

    if (error) throw error

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating trackable:", error)
    throw error
  }
}

export async function incrementProgress(data: { id: string; amount?: number }) {
  try {
    const validated = incrementProgressSchema.parse(data)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get current value
    const { data: trackable, error: fetchError } = await supabase
      .from("trackables")
      .select("current_value")
      .eq("id", validated.id)
      .eq("user_id", user.id)
      .single()

    if (fetchError) throw fetchError
    if (!trackable) throw new Error("Trackable not found")

    const newValue = trackable.current_value + validated.amount

    // Update trackable
    const { error: updateError } = await supabase
      .from("trackables")
      .update({
        current_value: newValue,
        updated_at: getCurrentISODate(),
      })
      .eq("id", validated.id)
      .eq("user_id", user.id)

    if (updateError) throw updateError

    // Log the action
    await supabase.from("logs").insert({
      trackable_id: validated.id,
      user_id: user.id,
      action: "incremented",
      previous_value: trackable.current_value,
      new_value: newValue,
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error incrementing progress:", error)
    throw error
  }
}

export async function decrementProgress(data: { id: string }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get current value
    const { data: trackable, error: fetchError } = await supabase
      .from("trackables")
      .select("current_value")
      .eq("id", data.id)
      .eq("user_id", user.id)
      .single()

    if (fetchError) throw fetchError
    if (!trackable) throw new Error("Trackable not found")

    const newValue = Math.max(0, trackable.current_value - 1)

    // Update trackable
    const { error: updateError } = await supabase
      .from("trackables")
      .update({
        current_value: newValue,
        updated_at: getCurrentISODate(),
      })
      .eq("id", data.id)
      .eq("user_id", user.id)

    if (updateError) throw updateError

    // Log the action
    await supabase.from("logs").insert({
      trackable_id: data.id,
      user_id: user.id,
      action: "decremented",
      previous_value: trackable.current_value,
      new_value: newValue,
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error decrementing progress:", error)
    throw error
  }
}

export async function completeTrackable(data: { id: string }) {
  try {
    const validated = completeTrackableSchema.parse(data)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get trackable
    const { data: trackable, error: fetchError } = await supabase
      .from("trackables")
      .select("type, status, current_value, last_completed_at")
      .eq("id", validated.id)
      .eq("user_id", user.id)
      .single()

    if (fetchError) throw fetchError
    if (!trackable) throw new Error("Trackable not found")

    // Check if currently completed using DST-aware calendar math
    const isCurrentlyCompleted =
      trackable.type === "DAILY_HABIT"
        ? trackable.last_completed_at
          ? isSameCalendarDay(trackable.last_completed_at, new Date())
          : false
        : trackable.status === "completed"

    const updateData: {
      status?: string
      last_completed_at?: string | null
      current_value?: number
    } = {}

    if (trackable.type === "DAILY_HABIT") {
      // Toggle completion for daily habits using DST-aware date
      updateData.last_completed_at = isCurrentlyCompleted
        ? null
        : getCurrentISODate()
    } else if (trackable.type === "ONE_TIME") {
      // Toggle completion for one-time tasks
      updateData.status = isCurrentlyCompleted ? "active" : "completed"
    }

    // Update trackable
    const { error: updateError } = await supabase
      .from("trackables")
      .update({
        ...updateData,
        updated_at: getCurrentISODate(),
      })
      .eq("id", validated.id)
      .eq("user_id", user.id)

    if (updateError) throw updateError

    // Log the action
    await supabase.from("logs").insert({
      trackable_id: validated.id,
      user_id: user.id,
      action: "completed",
      previous_value: trackable.current_value,
      new_value: trackable.current_value,
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error completing trackable:", error)
    throw error
  }
}

export async function deleteTrackable(data: { id: string }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const { error } = await supabase
      .from("trackables")
      .delete()
      .eq("id", data.id)
      .eq("user_id", user.id)

    if (error) throw error

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting trackable:", error)
    throw error
  }
}

