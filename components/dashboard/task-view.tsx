"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCard } from "@/components/trackables/task-card"
import { ProgressTracker } from "@/components/trackables/progress-tracker"
import { CheckCircle2, Clock, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { isSameCalendarDay, formatDate } from "@/lib/date-utils"
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

  // Get today's date
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  // Filter trackables based on view type
  const getFilteredTrackables = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    return allTrackables.filter((trackable) => {
      // Check if trackable should be shown based on selected_days
      if (trackable.selected_days && trackable.selected_days.length > 0) {
        const dayOfWeek = now.getDay()
        const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]
        const englishDayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        const currentDayName = dayNames[dayOfWeek]
        const currentEnglishDayName = englishDayNames[dayOfWeek]

        if (
          !trackable.selected_days.includes(currentDayName) &&
          !trackable.selected_days.includes(currentEnglishDayName)
        ) {
          return false
        }
      }

      // Check start_date
      if (trackable.start_date) {
        const startDate = new Date(trackable.start_date)
        if (startDate > todayStart) {
          return false
        }
      }

      return true
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
      // Check if completed
      let isCompleted = false

      if (trackable.type === "DAILY_HABIT") {
        isCompleted = trackable.is_completed_today
      } else if (trackable.type === "ONE_TIME") {
        isCompleted = trackable.status === "completed"
      } else if (trackable.type === "PROGRESS") {
        // Progress trackers are considered completed if they reached target
        isCompleted =
          trackable.target_value !== null &&
          trackable.current_value >= trackable.target_value
      }

      if (isCompleted) {
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

      {/* View Content */}
      {viewType === "daily" && renderDailyView()}
      {viewType === "weekly" && renderWeeklyView()}
      {viewType === "monthly" && renderMonthlyView()}
    </div>
  )
}

