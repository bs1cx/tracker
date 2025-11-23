"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const DAYS = [
  { value: "monday", label: "Pazartesi", short: "Pzt" },
  { value: "tuesday", label: "Salı", short: "Sal" },
  { value: "wednesday", label: "Çarşamba", short: "Çar" },
  { value: "thursday", label: "Perşembe", short: "Per" },
  { value: "friday", label: "Cuma", short: "Cum" },
  { value: "saturday", label: "Cumartesi", short: "Cmt" },
  { value: "sunday", label: "Pazar", short: "Paz" },
] as const

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"]
const WEEKENDS = ["saturday", "sunday"]
const ALL_DAYS = DAYS.map((d) => d.value)

interface DaySelectorProps {
  value: string[]
  onChange: (days: string[]) => void
  label?: string
  className?: string
  required?: boolean
}

export function DaySelector({
  value,
  onChange,
  label,
  className,
  required = true,
}: DaySelectorProps) {
  const toggleDay = (day: string) => {
    if (value.includes(day)) {
      // If removing would leave empty and required, prevent removal
      if (required && value.length === 1) {
        return
      }
      onChange(value.filter((d) => d !== day))
    } else {
      onChange([...value, day])
    }
  }

  const selectWeekdays = () => {
    onChange(WEEKDAYS)
  }

  const selectWeekends = () => {
    onChange(WEEKENDS)
  }

  const selectAllDays = () => {
    onChange(ALL_DAYS)
  }

  const isWeekdaysSelected = WEEKDAYS.every((day) => value.includes(day)) && value.length === WEEKDAYS.length
  const isWeekendsSelected = WEEKENDS.every((day) => value.includes(day)) && value.length === WEEKENDS.length
  const isAllDaysSelected = ALL_DAYS.every((day) => value.includes(day)) && value.length === ALL_DAYS.length

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}
      
      {/* Quick Selection Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={isWeekdaysSelected ? "default" : "outline"}
          size="sm"
          onClick={selectWeekdays}
          className={cn(
            "text-xs",
            isWeekdaysSelected &&
              "bg-[#60a5fa] text-white hover:bg-[#3b82f6] border-[#60a5fa]"
          )}
        >
          Hafta İçi
        </Button>
        <Button
          type="button"
          variant={isWeekendsSelected ? "default" : "outline"}
          size="sm"
          onClick={selectWeekends}
          className={cn(
            "text-xs",
            isWeekendsSelected &&
              "bg-[#60a5fa] text-white hover:bg-[#3b82f6] border-[#60a5fa]"
          )}
        >
          Hafta Sonu
        </Button>
        <Button
          type="button"
          variant={isAllDaysSelected ? "default" : "outline"}
          size="sm"
          onClick={selectAllDays}
          className={cn(
            "text-xs",
            isAllDaysSelected &&
              "bg-[#60a5fa] text-white hover:bg-[#3b82f6] border-[#60a5fa]"
          )}
        >
          Tüm Hafta
        </Button>
      </div>

      {/* Individual Day Buttons */}
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => (
          <Button
            key={day.value}
            type="button"
            variant={value.includes(day.value) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleDay(day.value)}
            disabled={required && value.length === 1 && value.includes(day.value)}
            className={cn(
              "min-w-[3rem]",
              value.includes(day.value) &&
                "bg-[#60a5fa] text-white hover:bg-[#3b82f6] border-[#60a5fa]",
              required &&
                value.length === 1 &&
                value.includes(day.value) &&
                "opacity-70 cursor-not-allowed"
            )}
          >
            {day.short}
          </Button>
        ))}
      </div>
      
      {value.length > 0 && (
        <p className="text-xs text-slate-400">
          {value.length} gün seçildi
        </p>
      )}
      {required && value.length === 0 && (
        <p className="text-xs text-red-400">
          En az 1 gün seçmelisiniz
        </p>
      )}
    </div>
  )
}

