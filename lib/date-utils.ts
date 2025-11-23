/**
 * DST (Daylight Saving Time) Aware Date Utilities
 * 
 * This module provides calendar math functions that handle DST transitions correctly.
 * Uses date-fns library which is DST-aware and handles timezone offsets automatically.
 */

import {
  addDays,
  startOfDay,
  isSameDay,
  isToday,
  format,
  parseISO,
  isValid,
} from "date-fns"

/**
 * Adds days to a date using calendar math (DST-aware)
 * This function handles DST transitions correctly by working with calendar days,
 * not hours, so it automatically adjusts for timezone offset changes.
 * 
 * @param date - The date to add days to (Date object or ISO string)
 * @param amount - Number of days to add (can be negative to subtract)
 * @returns New Date object with days added
 */
export function addCalendarDays(
  date: Date | string,
  amount: number
): Date {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) {
    throw new Error("Invalid date provided")
  }
  return addDays(dateObj, amount)
}

/**
 * Gets the start of a day (00:00:00) in the local timezone (DST-aware)
 * 
 * @param date - The date to get start of day for
 * @returns Date object at start of day
 */
export function getStartOfDay(date: Date | string = new Date()): Date {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) {
    throw new Error("Invalid date provided")
  }
  return startOfDay(dateObj)
}

/**
 * Checks if two dates are on the same calendar day (DST-aware)
 * 
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if dates are on the same calendar day
 */
export function isSameCalendarDay(
  date1: Date | string,
  date2: Date | string
): boolean {
  const date1Obj = typeof date1 === "string" ? parseISO(date1) : date1
  const date2Obj = typeof date2 === "string" ? parseISO(date2) : date2
  
  if (!isValid(date1Obj) || !isValid(date2Obj)) {
    return false
  }
  
  return isSameDay(date1Obj, date2Obj)
}

/**
 * Checks if a date is today (DST-aware)
 * 
 * @param date - Date to check
 * @returns True if date is today
 */
export function isDateToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) {
    return false
  }
  return isToday(dateObj)
}

/**
 * Formats a date to a readable string (DST-aware)
 * 
 * @param date - Date to format
 * @param formatStr - Format string (default: "PPp" - e.g., "Apr 29, 2024, 10:00 AM")
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "PPp"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) {
    return "Invalid Date"
  }
  return format(dateObj, formatStr)
}

/**
 * Gets current date/time as ISO string (DST-aware)
 * 
 * @returns ISO string of current date/time
 */
export function getCurrentISODate(): string {
  return new Date().toISOString()
}

/**
 * Converts a date to ISO string (DST-aware)
 * 
 * @param date - Date to convert
 * @returns ISO string
 */
export function toISOString(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) {
    throw new Error("Invalid date provided")
  }
  return dateObj.toISOString()
}

