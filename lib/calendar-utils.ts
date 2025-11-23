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
 * This handles both scheduled_date and recurring rules
 */
export function shouldTrackableAppearOnDate(
  trackable: Trackable,
  targetDate: Date
): boolean {
  const targetStart = startOfDay(targetDate)
  const targetEnd = endOfDay(targetDate)

  // If trackable has a specific scheduled_date, check if it matches
  if (trackable.scheduled_date) {
    const scheduledDate = parseISO(trackable.scheduled_date)
    const scheduledStart = startOfDay(scheduledDate)

    // Exact match for scheduled date
    if (isSameDay(scheduledStart, targetStart)) {
      return true
    }

    // If not recurring and scheduled_date doesn't match, don't show
    if (!trackable.is_recurring) {
      return false
    }
  }

  // Check start_date constraint
  if (trackable.start_date) {
    const startDate = parseISO(trackable.start_date)
    if (targetStart < startOfDay(startDate)) {
      return false // Target date is before start_date
    }
  }

  // Handle recurring tasks
  if (trackable.is_recurring && trackable.recurrence_rule) {
    const rule = trackable.recurrence_rule

    // Check end date
    if (rule.endDate) {
      const endDate = parseISO(rule.endDate)
      if (targetStart > startOfDay(endDate)) {
        return false // Target date is after end date
      }
    }

    switch (rule.frequency) {
      case "daily":
        // Daily recurring: show every day from start_date onwards
        return true

      case "weekly":
        // Weekly recurring: check if target day is in daysOfWeek
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          const targetDayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday, etc.
          return rule.daysOfWeek.includes(targetDayOfWeek)
        }
        // If no daysOfWeek specified, show every week on the same day as scheduled_date
        if (trackable.scheduled_date) {
          const scheduledDate = parseISO(trackable.scheduled_date)
          return scheduledDate.getDay() === targetDate.getDay()
        }
        return true

      case "monthly":
        // Monthly recurring: show on the same day of month
        if (trackable.scheduled_date) {
          const scheduledDate = parseISO(trackable.scheduled_date)
          return scheduledDate.getDate() === targetDate.getDate()
        }
        return true

      default:
        return false
    }
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

  // If no scheduling rules, don't show (strict filtering)
  return false
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

