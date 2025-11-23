"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "@/components/trackables/task-card"
import { ProgressTracker } from "@/components/trackables/progress-tracker"
import { CheckCircle2, Clock, Calendar as CalendarIcon } from "lucide-react"
import { getTrackablesForDate } from "@/lib/calendar-utils"
import { isSameCalendarDay } from "@/lib/date-utils"
import type { Trackable } from "@/types/database"

interface DailyViewProps {
  trackables: (Trackable & { is_completed_today: boolean })[]
  selectedDate: Date
}

export function DailyView({ trackables, selectedDate }: DailyViewProps) {
  // Filter trackables for the selected date
  const dayTrackables = getTrackablesForDate(trackables, selectedDate)

  // Categorize trackables
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  const completed: typeof dayTrackables = []
  const pending: typeof dayTrackables = []
  const upcoming: typeof dayTrackables = []

  dayTrackables.forEach((trackable) => {
    // Check if completed TODAY
    let isCompletedToday = false

    if (trackable.type === "DAILY_HABIT") {
      isCompletedToday = trackable.is_completed_today ?? false
    } else if (trackable.type === "ONE_TIME") {
      if (trackable.status === "completed" && trackable.last_completed_at) {
        isCompletedToday = isSameCalendarDay(
          trackable.last_completed_at,
          selectedDate
        )
      }
    } else if (trackable.type === "PROGRESS") {
      const reachedTarget =
        trackable.target_value !== null &&
        trackable.current_value >= trackable.target_value

      if (reachedTarget && trackable.last_completed_at) {
        isCompletedToday = isSameCalendarDay(
          trackable.last_completed_at,
          selectedDate
        )
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Yapılanlar */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Yapılanlar ({completed.length})
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
            Henüz Yapılmayanlar ({pending.length})
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
            Yaklaşanlar ({upcoming.length})
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
}

