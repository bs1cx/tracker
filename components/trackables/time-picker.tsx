"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange: (time: string) => void
  label?: string
  className?: string
}

export function TimePicker({
  value,
  onChange,
  label,
  className,
}: TimePickerProps) {
  const [time, setTime] = useState(value || "12:00")
  const [open, setOpen] = useState(false)

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    onChange(newTime)
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  const [selectedHour, selectedMinute] = time.split(":").map(Number)

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !time && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {time || "Saat seçin"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Hours */}
            <div className="max-h-[300px] overflow-y-auto border-r">
              <div className="p-2 font-semibold text-sm text-center border-b bg-muted">
                Saat
              </div>
              <div className="grid grid-cols-4 gap-1 p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    variant={selectedHour === hour ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      handleTimeChange(
                        `${hour.toString().padStart(2, "0")}:${selectedMinute
                          .toString()
                          .padStart(2, "0")}`
                      )
                    }
                  >
                    {hour.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
            </div>
            {/* Minutes */}
            <div className="max-h-[300px] overflow-y-auto">
              <div className="p-2 font-semibold text-sm text-center border-b bg-muted">
                Dakika
              </div>
              <div className="grid grid-cols-4 gap-1 p-2">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    variant={selectedMinute === minute ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      handleTimeChange(
                        `${selectedHour.toString().padStart(2, "0")}:${minute
                          .toString()
                          .padStart(2, "0")}`
                      )
                    }
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t p-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = new Date()
                const currentTime = `${now
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${now
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`
                handleTimeChange(currentTime)
              }}
            >
              Şimdi
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Tamam
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

