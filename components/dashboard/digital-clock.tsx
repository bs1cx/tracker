"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null)
  const [date, setDate] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const now = new Date()
    setTime(now)
    setDate(now)
    
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

  // Prevent hydration mismatch by not rendering time until mounted
  if (!mounted || !time || !date) {
    return (
      <Card className="border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-baseline gap-1">
              <div className="text-5xl font-mono font-bold tabular-nums bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent">
                00
              </div>
              <div className="text-5xl font-mono font-bold text-[#60a5fa]/60 animate-pulse">
                :
              </div>
              <div className="text-5xl font-mono font-bold tabular-nums bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent">
                00
              </div>
              <div className="text-3xl font-mono font-semibold text-[#60a5fa]/50 ml-2">
                00
              </div>
            </div>
            <div className="text-sm font-medium text-slate-400 capitalize">
              ...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hours = time.getHours().toString().padStart(2, "0")
  const minutes = time.getMinutes().toString().padStart(2, "0")
  const seconds = time.getSeconds().toString().padStart(2, "0")

  return (
    <Card className="border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm shadow-xl">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Digital Clock */}
          <div className="flex items-baseline gap-1">
            <div className="text-5xl font-mono font-bold tabular-nums bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent">
              {hours}
            </div>
            <div className="text-5xl font-mono font-bold text-[#60a5fa]/60 animate-pulse">
              :
            </div>
            <div className="text-5xl font-mono font-bold tabular-nums bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent">
              {minutes}
            </div>
            <div className="text-3xl font-mono font-semibold text-[#60a5fa]/50 ml-2">
              {seconds}
            </div>
          </div>
          {/* Date */}
          <div className="text-sm font-medium text-slate-400 capitalize">
            {formatDate(date)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

