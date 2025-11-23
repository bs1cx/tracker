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
}) {
  try {
    const validated = trackableSchema.parse(data)
    const supabase = await createClient()

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
    if (data.selected_days && data.selected_days.length > 0) {
      insertData.selected_days = data.selected_days
    }

    const { error, data: insertedData } = await supabase
      .from("trackables")
      .insert(insertData)
      .select()

    if (error) {
      console.error("Supabase error creating trackable:", error)
      // Check if it's a column missing error
      if (
        error.message?.includes("column") ||
        error.code === "42703" ||
        error.message?.includes("priority") ||
        error.message?.includes("scheduled_time")
      ) {
        // Try again without priority and scheduled_time
        const fallbackData: any = {
          user_id: user.id,
          title: validated.title,
          type: validated.type,
          target_value: validated.target_value ?? null,
          reset_frequency: validated.reset_frequency,
          status: "active",
          current_value: 0,
        }

        const { error: fallbackError } = await supabase
          .from("trackables")
          .insert(fallbackData)

        if (fallbackError) {
          throw new Error(
            `Database hatası: ${fallbackError.message}. Lütfen migration script'ini çalıştırın: supabase-schema-priority-time.sql`
          )
        }

        // Success with fallback - warn user
        console.warn(
          "Trackable created without priority/scheduled_time. Please run migration script."
        )
      } else {
        throw new Error(error.message || "Görev oluşturulurken bir hata oluştu")
      }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("Error creating trackable:", error)
    // Return a more user-friendly error message
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Görev oluşturulurken beklenmeyen bir hata oluştu")
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

