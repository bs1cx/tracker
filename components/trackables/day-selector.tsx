"use client"

import { useState } from "react"
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

interface DaySelectorProps {
  value: string[]
  onChange: (days: string[]) => void
  label?: string
  className?: string
}

export function DaySelector({
  value,
  onChange,
  label,
  className,
}: DaySelectorProps) {
  const toggleDay = (day: string) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day))
    } else {
      onChange([...value, day])
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => (
          <Button
            key={day.value}
            type="button"
            variant={value.includes(day.value) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleDay(day.value)}
            className={cn(
              "min-w-[3rem]",
              value.includes(day.value) &&
                "bg-[#60a5fa] text-white hover:bg-[#3b82f6] border-[#60a5fa]"
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
    </div>
  )
}

