"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function DigitalClock() {
  const [time, setTime] = useState(new Date())
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setTime(now)
      setDate(now)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const hours = time.getHours().toString().padStart(2, "0")
  const minutes = time.getMinutes().toString().padStart(2, "0")
  const seconds = time.getSeconds().toString().padStart(2, "0")

  return (
    <Card className="border-2 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Digital Clock */}
          <div className="flex items-baseline gap-1">
            <div className="text-5xl font-mono font-bold tabular-nums bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {hours}
            </div>
            <div className="text-5xl font-mono font-bold text-muted-foreground animate-pulse">
              :
            </div>
            <div className="text-5xl font-mono font-bold tabular-nums bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {minutes}
            </div>
            <div className="text-3xl font-mono font-semibold text-muted-foreground/60 ml-2">
              {seconds}
            </div>
          </div>
          {/* Date */}
          <div className="text-sm font-medium text-muted-foreground capitalize">
            {formatDate(date)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

