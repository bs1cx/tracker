"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns"
import { tr } from "date-fns/locale"
import type { Trackable } from "@/types/database"
import { cn } from "@/lib/utils"

interface CalendarWidgetProps {
  trackables: (Trackable & { is_completed_today: boolean })[]
}

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

export function CalendarWidget({ trackables }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = new Date()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get first day of month to calculate offset
  const firstDayOfWeek = getDay(monthStart) === 0 ? 7 : getDay(monthStart) // Convert Sunday (0) to 7

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const getTrackablesForDay = (date: Date) => {
    return trackables.filter((trackable) => {
      // Check if trackable has selected days
      if (
        trackable.selected_days &&
        Array.isArray(trackable.selected_days) &&
        trackable.selected_days.length > 0
      ) {
        const dayName = format(date, "EEEE", { locale: tr }).toLowerCase()
        // Map Turkish day names to English
        const dayMap: Record<string, string> = {
          pazartesi: "monday",
          salı: "tuesday",
          çarşamba: "wednesday",
          perşembe: "thursday",
          cuma: "friday",
          cumartesi: "saturday",
          pazar: "sunday",
        }
        const englishDay = dayMap[dayName] || dayName
        return trackable.selected_days.includes(englishDay)
      }
      // If no selected days, show for all days
      return true
    })
  }

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-[#60a5fa]" />
          <CardTitle className="text-base font-semibold text-[#60a5fa]">
            Takvim
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-200"
            onClick={previousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-slate-200 min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: tr })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-200"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-slate-400 text-center py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: firstDayOfWeek - 1 }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {daysInMonth.map((date) => {
            const dayTrackables = getTrackablesForDay(date)
            const isToday = isSameDay(date, today)
            const isCurrentMonth = isSameMonth(date, currentDate)

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "aspect-square p-1 rounded border transition-colors",
                  isToday && "border-[#60a5fa] bg-[#60a5fa]/10",
                  !isToday && "border-slate-700/50",
                  !isCurrentMonth && "opacity-30"
                )}
              >
                <div
                  className={cn(
                    "text-xs font-medium mb-1",
                    isToday && "text-[#60a5fa]",
                    !isToday && "text-slate-300"
                  )}
                >
                  {format(date, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayTrackables.slice(0, 3).map((trackable) => (
                    <div
                      key={trackable.id}
                      className={cn(
                        "text-[10px] px-1 py-0.5 rounded truncate",
                        trackable.is_completed_today
                          ? "bg-green-500/20 text-green-400"
                          : "bg-[#60a5fa]/20 text-[#60a5fa]"
                      )}
                      title={trackable.title}
                    >
                      {trackable.title}
                    </div>
                  ))}
                  {dayTrackables.length > 3 && (
                    <div className="text-[10px] text-slate-400 px-1">
                      +{dayTrackables.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

