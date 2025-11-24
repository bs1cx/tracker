"use server"

import { createClient } from "@/lib/supabase/server"
import { getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth } from "@/lib/date-utils"
import { format } from "date-fns"

// Get comprehensive statistics for all modules
export async function getAllStatistics() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const today = format(new Date(), "yyyy-MM-dd")
    const startOfWeek = getStartOfWeek(new Date())
    const endOfWeek = getEndOfWeek(new Date())
    const startOfMonth = getStartOfMonth(new Date())
    const endOfMonth = getEndOfMonth(new Date())
    const weekStartStr = format(startOfWeek, "yyyy-MM-dd")
    const weekEndStr = format(endOfWeek, "yyyy-MM-dd")
    const monthStartStr = format(startOfMonth, "yyyy-MM-dd")
    const monthEndStr = format(endOfMonth, "yyyy-MM-dd")

    // Fetch all data in parallel
    const [
      trackables,
      // Health - Today
      todaySleep,
      todayWater,
      todaySteps,
      todayExercise,
      // Health - Week
      weekSleep,
      weekWater,
      weekSteps,
      weekExercise,
      // Health - Month
      monthSleep,
      monthWater,
      monthSteps,
      monthExercise,
      // Mental - Today
      todayMood,
      todayMotivation,
      todayMeditation,
      todayJournal,
      // Mental - Week
      weekMood,
      weekMotivation,
      weekMeditation,
      weekJournal,
      // Mental - Month
      monthMood,
      monthMotivation,
      monthMeditation,
      monthJournal,
      // Productivity - Today
      todayPomodoro,
      todayFocus,
      activeGoals,
      // Productivity - Week
      weekPomodoro,
      weekFocus,
      // Productivity - Month
      monthPomodoro,
      monthFocus,
      // Finance - Today
      todayExpenses,
      todayIncome,
      // Finance - Week
      weekExpenses,
      weekIncome,
      // Finance - Month
      monthExpenses,
      monthIncome,
    ] = await Promise.all([
      // Trackables
      supabase.from("trackables").select("*").eq("user_id", user.id),
      
      // Health - Today
      supabase.from("sleep_logs").select("*").eq("user_id", user.id).eq("log_date", today),
      supabase.from("water_intake").select("*").eq("user_id", user.id).eq("log_date", today),
      supabase.from("steps_logs").select("*").eq("user_id", user.id).eq("log_date", today),
      supabase.from("exercise_logs").select("*").eq("user_id", user.id).eq("log_date", today),
      
      // Health - Week
      supabase.from("sleep_logs").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      supabase.from("water_intake").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      supabase.from("steps_logs").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      supabase.from("exercise_logs").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      
      // Health - Month
      supabase.from("sleep_logs").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      supabase.from("water_intake").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      supabase.from("steps_logs").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      supabase.from("exercise_logs").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      
      // Mental - Today
      supabase.from("mood_logs").select("*").eq("user_id", user.id).eq("log_date", today),
      supabase.from("motivation_logs").select("*").eq("user_id", user.id).eq("log_date", today),
      supabase.from("meditation_sessions").select("*").eq("user_id", user.id).eq("log_date", today),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("log_date", today),
      
      // Mental - Week
      supabase.from("mood_logs").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      supabase.from("motivation_logs").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      supabase.from("meditation_sessions").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      
      // Mental - Month
      supabase.from("mood_logs").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      supabase.from("motivation_logs").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      supabase.from("meditation_sessions").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      
      // Productivity - Today
      supabase.from("pomodoro_sessions").select("*").eq("user_id", user.id).eq("log_date", today),
      supabase.from("focus_sessions").select("*").eq("user_id", user.id).eq("log_date", today),
      supabase.from("goals").select("*").eq("user_id", user.id).eq("status", "active"),
      
      // Productivity - Week
      supabase.from("pomodoro_sessions").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      supabase.from("focus_sessions").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      
      // Productivity - Month
      supabase.from("pomodoro_sessions").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      supabase.from("focus_sessions").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      
      // Finance - Today
      supabase.from("expenses").select("*").eq("user_id", user.id).eq("log_date", today),
      supabase.from("income").select("*").eq("user_id", user.id).eq("log_date", today),
      
      // Finance - Week
      supabase.from("expenses").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      supabase.from("income").select("*").eq("user_id", user.id).gte("log_date", weekStartStr).lte("log_date", weekEndStr),
      
      // Finance - Month
      supabase.from("expenses").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
      supabase.from("income").select("*").eq("user_id", user.id).gte("log_date", monthStartStr).lte("log_date", monthEndStr),
    ])

    // Process trackables
    const trackablesData = trackables.data || []
    const dailyHabits = trackablesData.filter(t => t.type === "DAILY_HABIT")
    const oneTimeTasks = trackablesData.filter(t => t.type === "ONE_TIME")
    const progressTrackers = trackablesData.filter(t => t.type === "PROGRESS")
    const completedTasks = trackablesData.filter(t => t.status === "completed")

    // Process Health data
    const processHealthData = (sleep: any, water: any, steps: any, exercise: any) => {
      const totalSleep = sleep.data?.reduce((sum: number, s: any) => {
        const hours = parseFloat(s.sleep_duration || s.sleep_duration_hours || 0)
        return sum + hours
      }, 0) || 0
      const totalWater = water.data?.reduce((sum: number, w: any) => sum + (w.amount_ml || 0), 0) || 0
      const totalSteps = steps.data?.reduce((sum: number, s: any) => sum + (s.steps_count || 0), 0) || 0
      const totalExercise = exercise.data?.reduce((sum: number, e: any) => sum + (e.duration_minutes || 0), 0) || 0
      return { totalSleep, totalWater, totalSteps, totalExercise, count: (sleep.data?.length || 0) + (water.data?.length || 0) + (steps.data?.length || 0) + (exercise.data?.length || 0) }
    }

    // Process Mental data
    const processMentalData = (mood: any, motivation: any, meditation: any, journal: any) => {
      const avgMood = mood.data?.length > 0
        ? mood.data.reduce((sum: number, m: any) => sum + (m.mood_score || 0), 0) / mood.data.length
        : 0
      const avgMotivation = motivation.data?.length > 0
        ? motivation.data.reduce((sum: number, m: any) => sum + (m.motivation_score || 0), 0) / motivation.data.length
        : 0
      const totalMeditation = meditation.data?.reduce((sum: number, m: any) => sum + (m.duration_minutes || 0), 0) || 0
      const journalCount = journal.data?.length || 0
      return { avgMood, avgMotivation, totalMeditation, journalCount }
    }

    // Process Productivity data
    const processProductivityData = (pomodoro: any, focus: any, goals: any) => {
      const totalPomodoro = pomodoro.data?.reduce((sum: number, p: any) => sum + (p.duration_minutes || 0), 0) || 0
      const totalFocus = focus.data?.reduce((sum: number, f: any) => sum + (f.duration_minutes || 0), 0) || 0
      const completedPomodoros = pomodoro.data?.filter((p: any) => p.completed).length || 0
      const activeGoals = goals.data?.length || 0
      return { totalPomodoro, totalFocus, completedPomodoros, activeGoals }
    }

    // Process Finance data
    const processFinanceData = (expenses: any, income: any) => {
      const totalExpenses = expenses.data?.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0) || 0
      const totalIncome = income.data?.reduce((sum: number, i: any) => sum + parseFloat(i.amount || 0), 0) || 0
      const balance = totalIncome - totalExpenses
      return { totalExpenses, totalIncome, balance, expenseCount: expenses.data?.length || 0, incomeCount: income.data?.length || 0 }
    }

    return {
      trackables: {
        total: trackablesData.length,
        dailyHabits: dailyHabits.length,
        oneTimeTasks: oneTimeTasks.length,
        progressTrackers: progressTrackers.length,
        completed: completedTasks.length,
      },
      health: {
        today: processHealthData(todaySleep, todayWater, todaySteps, todayExercise),
        week: processHealthData(weekSleep, weekWater, weekSteps, weekExercise),
        month: processHealthData(monthSleep, monthWater, monthSteps, monthExercise),
      },
      mental: {
        today: processMentalData(todayMood, todayMotivation, todayMeditation, todayJournal),
        week: processMentalData(weekMood, weekMotivation, weekMeditation, weekJournal),
        month: processMentalData(monthMood, monthMotivation, monthMeditation, monthJournal),
      },
      productivity: {
        today: processProductivityData(todayPomodoro, todayFocus, activeGoals),
        week: processProductivityData(weekPomodoro, weekFocus, activeGoals),
        month: processProductivityData(monthPomodoro, monthFocus, activeGoals),
      },
      finance: {
        today: processFinanceData(todayExpenses, todayIncome),
        week: processFinanceData(weekExpenses, weekIncome),
        month: processFinanceData(monthExpenses, monthIncome),
      },
    }
  } catch (error) {
    console.error("Error in getAllStatistics:", error)
    return null
  }
}

// Get habit streaks
export async function getHabitStreaks() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data: trackables, error } = await supabase
      .from("trackables")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "DAILY_HABIT")
      .eq("status", "active")

    if (error) {
      console.error("Error fetching habit streaks:", error)
      return []
    }

    // Get logs for streak calculation
    const { data: logs, error: logsError } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (logsError) {
      console.error("Error fetching logs:", logsError)
      return []
    }

    // Calculate streaks
    const streaks = trackables?.map(trackable => {
      const trackableLogs = logs?.filter(log => log.trackable_id === trackable.id) || []
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0

      // Sort logs by date
      const sortedLogs = trackableLogs.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
      })

      // Calculate current streak
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].created_at)
        logDate.setHours(0, 0, 0, 0)
        const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (i === 0 && daysDiff === 0) {
          currentStreak = 1
        } else if (i === 0 && daysDiff === 1) {
          currentStreak = 1
        } else if (i > 0) {
          const prevDate = new Date(sortedLogs[i - 1].created_at)
          prevDate.setHours(0, 0, 0, 0)
          const daysBetween = Math.floor((prevDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysBetween === 1) {
            currentStreak++
          } else {
            break
          }
        }
      }

      // Calculate longest streak
      for (let i = 0; i < sortedLogs.length - 1; i++) {
        const date1 = new Date(sortedLogs[i].created_at)
        const date2 = new Date(sortedLogs[i + 1].created_at)
        const daysBetween = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysBetween === 1) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 0
        }
      }

      return {
        id: trackable.id,
        title: trackable.title,
        currentStreak: currentStreak || 0,
        longestStreak: longestStreak + 1 || 0,
        totalCompletions: trackableLogs.length,
      }
    }) || []

    return streaks.sort((a, b) => b.currentStreak - a.currentStreak)
  } catch (error) {
    console.error("Error in getHabitStreaks:", error)
    return []
  }
}

