"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCard } from "@/components/trackables/task-card"
import { ProgressTracker } from "@/components/trackables/progress-tracker"
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar"
import { CheckCircle2, Clock, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { isSameCalendarDay, formatDate, getStartOfDay } from "@/lib/date-utils"
import { shouldTrackableAppearOnDate } from "@/lib/calendar-utils"
import type { Trackable } from "@/types/database"

interface TaskViewProps {
  allTrackables: (Trackable & { is_completed_today: boolean })[]
  dailyHabits: (Trackable & { is_completed_today: boolean })[]
  oneTimeTasks: (Trackable & { is_completed_today: boolean })[]
  progressTrackers: (Trackable & { is_completed_today: boolean })[]
}

type ViewType = "daily" | "weekly" | "monthly"

export function TaskView({
  allTrackables,
  dailyHabits,
  oneTimeTasks,
  progressTrackers,
}: TaskViewProps) {
  const [viewType, setViewType] = useState<ViewType>("daily")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [today, setToday] = useState(new Date())

  // Update today's date in real-time (every minute)
  useEffect(() => {
    const updateToday = () => {
      setToday(new Date())
    }
    
    // Update immediately
    updateToday()
    
    // Update every minute
    const interval = setInterval(updateToday, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Filter trackables based on view type - STRICT DATE FILTERING
  // Use the calendar-utils function for consistent filtering
  const getFilteredTrackables = () => {
    // For daily view, use selectedDate; for weekly/monthly, we'll filter by range
    const targetDate = viewType === "daily" ? selectedDate : today
    
    return allTrackables.filter((trackable) => {
      // Use the strict filtering function from calendar-utils
      return shouldTrackableAppearOnDate(trackable, targetDate)
    })
  }

  const filteredTrackables = getFilteredTrackables()

  // Categorize trackables for daily view
  const getDailyCategories = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute // minutes since midnight

    const completed: typeof filteredTrackables = []
    const pending: typeof filteredTrackables = []
    const upcoming: typeof filteredTrackables = []

    filteredTrackables.forEach((trackable) => {
      // Check if completed TODAY
      let isCompletedToday = false

      if (trackable.type === "DAILY_HABIT") {
        // For daily habits, check if completed today using is_completed_today
        isCompletedToday = trackable.is_completed_today
      } else if (trackable.type === "ONE_TIME") {
        // For one-time tasks, check if completed on selected date
        if (trackable.status === "completed" && trackable.last_completed_at) {
          isCompletedToday = isSameCalendarDay(trackable.last_completed_at, selectedDate)
        }
      } else if (trackable.type === "PROGRESS") {
        // Progress trackers are considered completed if they reached target
        // But we still check if they were completed today
        const reachedTarget =
          trackable.target_value !== null &&
          trackable.current_value >= trackable.target_value
        
        // If reached target and has last_completed_at, check if it was on selected date
        if (reachedTarget && trackable.last_completed_at) {
          isCompletedToday = isSameCalendarDay(trackable.last_completed_at, selectedDate)
        }
      }

      if (isCompletedToday) {
        completed.push(trackable)
      } else {
        // Check if upcoming (has scheduled_time and it's in the future)
        if (trackable.scheduled_time) {
          const [hours, minutes] = trackable.scheduled_time.split(":").map(Number)
          const scheduledTime = hours * 60 + minutes

          if (scheduledTime > currentTime) {
            upcoming.push(trackable)
          } else {
            pending.push(trackable)
          }
        } else {
          pending.push(trackable)
        }
      }
    })

    return { completed, pending, upcoming }
  }

  const { completed, pending, upcoming } = getDailyCategories()

  const renderDailyView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Yapılanlar */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Yapılanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {completed.length > 0 ? (
              completed.map((trackable) => {
                if (trackable.type === "PROGRESS") {
                  return (
                    <ProgressTracker key={trackable.id} trackable={trackable} />
                  )
                }
                return <TaskCard key={trackable.id} trackable={trackable} />
              })
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">
                Henüz tamamlanan görev yok
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Henüz Yapılmayanlar */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-300">
            <Clock className="h-5 w-5" />
            Henüz Yapılmayanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {pending.length > 0 ? (
              pending.map((trackable) => {
                if (trackable.type === "PROGRESS") {
                  return (
                    <ProgressTracker key={trackable.id} trackable={trackable} />
                  )
                }
                return <TaskCard key={trackable.id} trackable={trackable} />
              })
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">
                Bekleyen görev yok
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Yaklaşanlar */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-[#60a5fa]">
            <CalendarIcon className="h-5 w-5" />
            Yaklaşanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {upcoming.length > 0 ? (
              upcoming
                .sort((a, b) => {
                  if (!a.scheduled_time || !b.scheduled_time) return 0
                  return a.scheduled_time.localeCompare(b.scheduled_time)
                })
                .map((trackable) => {
                  if (trackable.type === "PROGRESS") {
                    return (
                      <ProgressTracker key={trackable.id} trackable={trackable} />
                    )
                  }
                  return <TaskCard key={trackable.id} trackable={trackable} />
                })
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">
                Yaklaşan görev yok
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderWeeklyView = () => (
    <div className="space-y-4">
      <p className="text-slate-400 text-center py-8">
        Haftalık görünüm yakında eklenecek
      </p>
    </div>
  )

  const renderMonthlyView = () => (
    <div className="space-y-4">
      <p className="text-slate-400 text-center py-8">
        Aylık görünüm yakında eklenecek
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* View Type Selector */}
      <div className="flex justify-center">
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger
              value="daily"
              className="data-[state=active]:bg-[#60a5fa]/20 data-[state=active]:text-[#60a5fa]"
            >
              Günlük
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-[#60a5fa]/20 data-[state=active]:text-[#60a5fa]"
            >
              Haftalık
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-[#60a5fa]/20 data-[state=active]:text-[#60a5fa]"
            >
              Aylık
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* View Content with Calendar Sidebar for Daily View */}
      {viewType === "daily" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <CalendarSidebar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
          {/* Daily View Content */}
          <div className="lg:col-span-3">
            {renderDailyView()}
          </div>
        </div>
      )}
      
      {viewType === "weekly" && renderWeeklyView()}
      {viewType === "monthly" && renderMonthlyView()}
    </div>
  )
}

