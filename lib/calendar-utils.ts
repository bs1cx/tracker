/**
 * Calendar Utilities
 * Functions for handling calendar-based task filtering and date calculations
 */

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  addDays,
  parseISO,
  format,
} from "date-fns"
import { tr } from "date-fns/locale"
import type { Trackable } from "@/types/database"

/**
 * Get date range for a specific day
 */
export function getDayRange(date: Date) {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  }
}

/**
 * Get date range for a week containing the given date
 */
export function getWeekRange(date: Date) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 }),
  }
}

/**
 * Get date range for a month containing the given date
 */
export function getMonthRange(date: Date) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

/**
 * Check if a trackable should appear on a specific date
 * STRICT FILTERING: A task scheduled for T+3 must NOT appear in Today view
 * 
 * Rules:
 * 1. DAILY_HABIT: Show every day from start_date onwards (if start_date exists)
 * 2. ONE_TIME: Show ONLY on scheduled_date (must match exactly)
 * 3. PROGRESS: Show every day from start_date onwards (if start_date exists)
 * 4. Recurring tasks: Follow recurrence_rule, but respect start_date constraint
 */
export function shouldTrackableAppearOnDate(
  trackable: Trackable,
  targetDate: Date
): boolean {
  const targetStart = startOfDay(targetDate)
  const today = startOfDay(new Date())

  // STRICT: If target date is in the future and trackable is ONE_TIME without recurring,
  // it should NOT appear (unless it's the exact scheduled_date)
  if (trackable.type === "ONE_TIME" && !trackable.is_recurring) {
    // ONE_TIME tasks must have scheduled_date and it must match exactly
    if (!trackable.scheduled_date) {
      return false // No scheduled_date = don't show
    }

    const scheduledDate = parseISO(trackable.scheduled_date)
    const scheduledStart = startOfDay(scheduledDate)

    // Only show if scheduled_date matches targetDate exactly
    if (!isSameDay(scheduledStart, targetStart)) {
      return false // Not the scheduled date
    }

    // Check start_date constraint (must be on or before target date)
    if (trackable.start_date) {
      const startDate = parseISO(trackable.start_date)
      if (targetStart < startOfDay(startDate)) {
        return false // Target date is before start_date
      }
    }

    return true // Exact match found
  }

  // Check start_date constraint FIRST (applies to all types)
  if (trackable.start_date) {
    const startDate = parseISO(trackable.start_date)
    const startDateStart = startOfDay(startDate)
    
    // STRICT: If target date is before start_date, don't show
    if (targetStart < startDateStart) {
      return false
    }
  } else if (trackable.created_at) {
    // Fallback to created_at if start_date doesn't exist
    const createdDate = parseISO(trackable.created_at)
    const createdDateStart = startOfDay(createdDate)
    
    // STRICT: If target date is before created_at, don't show
    if (targetStart < createdDateStart) {
      return false
    }
  }

  // Handle DAILY_HABIT: Show every day from start_date onwards
  if (trackable.type === "DAILY_HABIT") {
    // If has selected_days, check if today matches
    if (trackable.selected_days && trackable.selected_days.length > 0) {
      const dayOfWeek = targetDate.getDay()
      const dayNames = [
        "Pazar",
        "Pazartesi",
        "Salı",
        "Çarşamba",
        "Perşembe",
        "Cuma",
        "Cumartesi",
      ]
      const englishDayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ]
      const currentDayName = dayNames[dayOfWeek]
      const currentEnglishDayName = englishDayNames[dayOfWeek]

      const matchesDay =
        trackable.selected_days.includes(currentDayName) ||
        trackable.selected_days.includes(currentEnglishDayName)

      if (!matchesDay) {
        return false // Not a selected day
      }
    }

    // If recurring with rule, check recurrence
    if (trackable.is_recurring && trackable.recurrence_rule) {
      return checkRecurrenceRule(trackable, targetDate)
    }

    // Default: show every day (if start_date constraint passed)
    return true
  }

  // Handle PROGRESS: Show every day from start_date onwards
  if (trackable.type === "PROGRESS") {
    // Progress trackers are always visible (if start_date constraint passed)
    return true
  }

  // Handle recurring tasks with recurrence_rule
  if (trackable.is_recurring && trackable.recurrence_rule) {
    return checkRecurrenceRule(trackable, targetDate)
  }

  // Handle scheduled_date for non-recurring tasks
  if (trackable.scheduled_date && !trackable.is_recurring) {
    const scheduledDate = parseISO(trackable.scheduled_date)
    const scheduledStart = startOfDay(scheduledDate)

    // Only show if scheduled_date matches targetDate exactly
    return isSameDay(scheduledStart, targetStart)
  }

  // Fallback: check selected_days for backward compatibility
  if (trackable.selected_days && trackable.selected_days.length > 0) {
    const dayOfWeek = targetDate.getDay()
    const dayNames = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ]
    const englishDayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]
    const currentDayName = dayNames[dayOfWeek]
    const currentEnglishDayName = englishDayNames[dayOfWeek]

    return (
      trackable.selected_days.includes(currentDayName) ||
      trackable.selected_days.includes(currentEnglishDayName)
    )
  }

  // STRICT: If no scheduling rules at all, don't show
  // This prevents tasks without any date information from appearing
  return false
}

/**
 * Check if a recurring task should appear on target date based on recurrence_rule
 */
function checkRecurrenceRule(
  trackable: Trackable,
  targetDate: Date
): boolean {
  if (!trackable.recurrence_rule) {
    return false
  }

  const rule = trackable.recurrence_rule
  const targetStart = startOfDay(targetDate)

  // Check end date
  if (rule.endDate) {
    const endDate = parseISO(rule.endDate)
    if (targetStart > startOfDay(endDate)) {
      return false // Target date is after end date
    }
  }

  // Check if we have a base scheduled_date
  if (!trackable.scheduled_date) {
    // If no scheduled_date, can't determine recurrence pattern
    return false
  }

  const scheduledDate = parseISO(trackable.scheduled_date)
  const scheduledStart = startOfDay(scheduledDate)

  switch (rule.frequency) {
    case "daily":
      // Daily recurring: show every day from scheduled_date onwards
      // (start_date constraint already checked)
      return targetStart >= scheduledStart

    case "weekly":
      // Weekly recurring: check if target day is in daysOfWeek
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const targetDayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday, etc.
        const matchesDay = rule.daysOfWeek.includes(targetDayOfWeek)

        if (!matchesDay) {
          return false
        }

        // Also check if we're on or after the scheduled_date
        // Calculate weeks since scheduled_date
        const daysDiff = Math.floor(
          (targetStart.getTime() - scheduledStart.getTime()) / (1000 * 60 * 60 * 24)
        )
        const weeksDiff = Math.floor(daysDiff / 7)

        // Check interval (default: 1 week)
        const interval = rule.interval || 1
        if (weeksDiff % interval !== 0) {
          return false
        }

        return targetStart >= scheduledStart
      }

      // If no daysOfWeek specified, show every week on the same day as scheduled_date
      if (scheduledDate.getDay() === targetDate.getDay()) {
        // Calculate weeks since scheduled_date
        const daysDiff = Math.floor(
          (targetStart.getTime() - scheduledStart.getTime()) / (1000 * 60 * 60 * 24)
        )
        const weeksDiff = Math.floor(daysDiff / 7)

        // Check interval (default: 1 week)
        const interval = rule.interval || 1
        return weeksDiff % interval === 0 && targetStart >= scheduledStart
      }

      return false

    case "monthly":
      // Monthly recurring: show on the same day of month
      if (scheduledDate.getDate() === targetDate.getDate()) {
        // Calculate months since scheduled_date
        const monthsDiff =
          (targetDate.getFullYear() - scheduledDate.getFullYear()) * 12 +
          (targetDate.getMonth() - scheduledDate.getMonth())

        // Check interval (default: 1 month)
        const interval = rule.interval || 1
        return monthsDiff % interval === 0 && targetStart >= scheduledStart
      }

      return false

    default:
      return false
  }
}

/**
 * Filter trackables for a specific date range
 */
export function filterTrackablesByDateRange(
  trackables: Trackable[],
  startDate: Date,
  endDate: Date
): Trackable[] {
  const range = { start: startOfDay(startDate), end: endOfDay(endDate) }

  return trackables.filter((trackable) => {
    // Generate all dates in the range
    let currentDate = new Date(range.start)

    while (currentDate <= range.end) {
      if (shouldTrackableAppearOnDate(trackable, currentDate)) {
        return true
      }
      currentDate = addDays(currentDate, 1)
    }

    return false
  })
}

/**
 * Get trackables for a specific date
 */
export function getTrackablesForDate(
  trackables: Trackable[],
  date: Date
): Trackable[] {
  return trackables.filter((trackable) =>
    shouldTrackableAppearOnDate(trackable, date)
  )
}

/**
 * Format date for display
 */
export function formatCalendarDate(date: Date, formatStr: string = "PP"): string {
  return format(date, formatStr, { locale: tr })
}

