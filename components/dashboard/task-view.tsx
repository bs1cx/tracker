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

  // Get week range for selected date
  const getWeekRange = () => {
    const startOfWeek = new Date(selectedDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return { start: startOfWeek, end: endOfWeek }
  }

  // Get week days
  const getWeekDays = () => {
    const { start } = getWeekRange()
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  // Get trackables for a specific date
  const getTrackablesForDate = (date: Date) => {
    return allTrackables.filter((trackable) =>
      shouldTrackableAppearOnDate(trackable, date)
    )
  }

  // Check if trackable is completed on a specific date
  const isTrackableCompletedOnDate = (trackable: Trackable, date: Date) => {
    if (trackable.type === "DAILY_HABIT") {
      if (trackable.last_completed_at) {
        return isSameCalendarDay(trackable.last_completed_at, date)
      }
    } else if (trackable.type === "ONE_TIME") {
      if (trackable.status === "completed" && trackable.last_completed_at) {
        return isSameCalendarDay(trackable.last_completed_at, date)
      }
    }
    return false
  }

  const renderWeeklyView = () => {
    const weekDays = getWeekDays()
    const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]

    return (
      <div className="space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(selectedDate.getDate() - 7)
              setSelectedDate(newDate)
            }}
            className="border-slate-700/50 hover:border-[#60a5fa]/50"
          >
            ← Önceki Hafta
          </Button>
          <div className="text-sm font-medium text-slate-200">
            {formatDate(weekDays[0], "d MMMM")} - {formatDate(weekDays[6], "d MMMM yyyy")}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(selectedDate.getDate() + 7)
              setSelectedDate(newDate)
            }}
            className="border-slate-700/50 hover:border-[#60a5fa]/50"
          >
            Sonraki Hafta →
          </Button>
        </div>

        {/* 7-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayTrackables = getTrackablesForDate(day)
            const isToday = isSameCalendarDay(day, today)
            const isPast = day < getStartOfDay(today)

            return (
              <Card
                key={index}
                className={cn(
                  "border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm",
                  isToday && "ring-2 ring-[#60a5fa]",
                  isPast && "opacity-60"
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-slate-400 uppercase">
                    {dayNames[index]}
                  </CardTitle>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        isToday ? "text-[#60a5fa]" : "text-slate-200"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {isToday && (
                      <span className="text-xs text-[#60a5fa] font-medium">Bugün</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {dayTrackables.length > 0 ? (
                      dayTrackables.map((trackable) => {
                        const isCompleted = isTrackableCompletedOnDate(trackable, day)
                        return (
                          <div
                            key={trackable.id}
                            className={cn(
                              "p-2 rounded-lg text-xs border",
                              isCompleted
                                ? "bg-green-500/20 border-green-500/30 text-green-300"
                                : "bg-slate-700/30 border-slate-600/30 text-slate-300"
                            )}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              {isCompleted ? (
                                <CheckCircle2 className="h-3 w-3 text-green-400" />
                              ) : (
                                <Clock className="h-3 w-3 text-slate-400" />
                              )}
                              <span className="font-medium truncate">{trackable.title}</span>
                            </div>
                            {trackable.scheduled_time && (
                              <div className="text-xs text-slate-400">
                                {trackable.scheduled_time}
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">Görev yok</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthlyView = () => {
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    const daysInMonth = monthEnd.getDate()
    const firstDayOfWeek = monthStart.getDay() === 0 ? 7 : monthStart.getDay() // Convert Sunday to 7

    // Get all days to display (including previous/next month days for grid)
    const days: (Date | null)[] = []
    
    // Add empty cells for days before month start
    for (let i = 1; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i))
    }

    const monthNames = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ]

    return (
      <div className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setMonth(selectedDate.getMonth() - 1)
              setSelectedDate(newDate)
            }}
            className="border-slate-700/50 hover:border-[#60a5fa]/50"
          >
            ← Önceki Ay
          </Button>
          <div className="text-lg font-semibold text-slate-200">
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setMonth(selectedDate.getMonth() + 1)
              setSelectedDate(newDate)
            }}
            className="border-slate-700/50 hover:border-[#60a5fa]/50"
          >
            Sonraki Ay →
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((dayName) => (
                <div
                  key={dayName}
                  className="text-center text-xs font-medium text-slate-400 py-2"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="aspect-square" />
                }

                const dayTrackables = getTrackablesForDate(day)
                const completedCount = dayTrackables.filter((t) =>
                  isTrackableCompletedOnDate(t, day)
                ).length
                const totalCount = dayTrackables.length
                const isToday = isSameCalendarDay(day, today)
                const isPast = day < getStartOfDay(today)
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth()

                return (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square p-2 rounded-lg border transition-colors cursor-pointer hover:bg-slate-700/30",
                      isToday && "ring-2 ring-[#60a5fa] bg-[#60a5fa]/10",
                      isPast && "opacity-50",
                      !isCurrentMonth && "opacity-30",
                      isCurrentMonth && "bg-slate-700/20 border-slate-600/30"
                    )}
                    onClick={() => {
                      setSelectedDate(day)
                      setViewType("daily")
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <div
                        className={cn(
                          "text-sm font-semibold mb-1",
                          isToday ? "text-[#60a5fa]" : "text-slate-200"
                        )}
                      >
                        {day.getDate()}
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        {totalCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex-1 flex gap-0.5">
                              {dayTrackables.slice(0, 3).map((trackable) => {
                                const isCompleted = isTrackableCompletedOnDate(trackable, day)
                                return (
                                  <div
                                    key={trackable.id}
                                    className={cn(
                                      "h-1.5 flex-1 rounded",
                                      isCompleted ? "bg-green-500" : "bg-[#60a5fa]"
                                    )}
                                  />
                                )
                              })}
                              {totalCount > 3 && (
                                <div className="h-1.5 w-1.5 rounded bg-slate-500" />
                              )}
                            </div>
                          </div>
                        )}
                        {totalCount > 0 && (
                          <div className="text-xs text-slate-400">
                            {completedCount}/{totalCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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

      {/* Weekly View with Calendar Sidebar */}
      {viewType === "weekly" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <CalendarSidebar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date)
                setViewType("daily")
              }}
            />
          </div>
          {/* Weekly View Content */}
          <div className="lg:col-span-3">
            {renderWeeklyView()}
          </div>
        </div>
      )}

      {/* Monthly View with Calendar Sidebar */}
      {viewType === "monthly" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <CalendarSidebar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date)
                setViewType("daily")
              }}
            />
          </div>
          {/* Monthly View Content */}
          <div className="lg:col-span-3">
            {renderMonthlyView()}
          </div>
        </div>
      )}
    </div>
  )
}

