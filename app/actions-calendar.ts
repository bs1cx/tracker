"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getStartOfDay, getEndOfDay } from "@/lib/date-utils"
import type { Trackable } from "@/types/database"

/**
 * Get trackables for a specific date range
 * This is the server-side function that enforces strict date filtering
 */
export async function getTrackablesForDateRange(
  startDate: Date,
  endDate: Date
): Promise<(Trackable & { is_completed_today: boolean })[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Convert dates to ISO strings for database query
  const startISO = getStartOfDay(startDate).toISOString()
  const endISO = getEndOfDay(endDate).toISOString()

  // Query trackables that:
  // 1. Have scheduled_date within range, OR
  // 2. Are recurring and might appear in range, OR
  // 3. Have start_date within range
  const { data: trackables, error } = await supabase
    .from("trackables")
    .select("*")
    .eq("user_id", user.id)
    .or(
      `scheduled_date.gte.${startISO},scheduled_date.lte.${endISO},is_recurring.eq.true,start_date.gte.${startISO},start_date.lte.${endISO}`
    )
    .order("scheduled_date", { ascending: true, nullsFirst: false })
    .order("priority", { ascending: false, nullsFirst: true })

  if (error) {
    console.error("Error fetching trackables:", error)
    return []
  }

  // Process trackables to determine completion status
  const processedTrackables = (trackables || []).map((trackable) => {
    let is_completed_today = false

    if (trackable.type === "DAILY_HABIT") {
      if (trackable.last_completed_at) {
        const lastCompleted = new Date(trackable.last_completed_at)
        const today = new Date()
        is_completed_today =
          lastCompleted.toDateString() === today.toDateString()
      }
    } else if (trackable.type === "ONE_TIME") {
      is_completed_today = trackable.status === "completed"
    }

    return {
      ...trackable,
      is_completed_today,
    } as Trackable & { is_completed_today: boolean }
  })

  return processedTrackables
}

