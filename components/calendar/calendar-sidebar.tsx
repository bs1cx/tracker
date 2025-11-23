"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, isToday, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarSidebarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  className?: string
}

export function CalendarSidebar({
  selectedDate,
  onDateSelect,
  className,
}: CalendarSidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    onDateSelect(today)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <Card className={cn("border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-200">
            {format(currentMonth, "MMMM yyyy", { locale: tr })}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-200"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-200"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              onDateSelect(date)
              // Update currentMonth when a date is selected
              setCurrentMonth(date)
            }
          }}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-slate-200",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-400 hover:text-slate-200"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-700/50 rounded-md",
              "aria-selected:bg-[#60a5fa]/20 aria-selected:text-[#60a5fa]"
            ),
            day_selected: "bg-[#60a5fa]/20 text-[#60a5fa] hover:bg-[#60a5fa]/30",
            day_today: "bg-slate-700/30 text-slate-200 font-semibold",
            day_outside: "text-slate-500 opacity-50",
            day_disabled: "text-slate-500 opacity-50",
            day_range_middle: "aria-selected:bg-slate-800 aria-selected:text-slate-200",
            day_hidden: "invisible",
          }}
          components={{
            IconLeft: () => null,
            IconRight: () => null,
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="w-full border-slate-700/50 hover:border-[#60a5fa]/50 hover:bg-slate-700/30 text-slate-200"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Bugüne Git
        </Button>
        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Seçili Tarih</p>
          <p className="text-sm font-medium text-slate-200">
            {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
          </p>
          {isToday(selectedDate) && (
            <p className="text-xs text-[#60a5fa] mt-1">Bugün</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

