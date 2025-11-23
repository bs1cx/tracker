"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Play, Pause, Square } from "lucide-react"
import { tr } from "@/lib/i18n"

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1)
        } else if (minutes > 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        } else {
          // Timer finished
          setIsRunning(false)
          // TODO: Save session and show notification
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, minutes, seconds])

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setMinutes(25)
    setSeconds(0)
  }

  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          {tr.productivity.pomodoro}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-6xl font-bold font-mono mb-4">
            {formatTime(minutes, seconds)}
          </div>
          <div className="flex gap-2 justify-center">
            {!isRunning ? (
              <Button onClick={handleStart} size="lg">
                <Play className="mr-2 h-4 w-4" />
                Başlat
              </Button>
            ) : isPaused ? (
              <>
                <Button onClick={handleResume} size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Devam Et
                </Button>
                <Button onClick={handleReset} variant="outline" size="lg">
                  <Square className="mr-2 h-4 w-4" />
                  Sıfırla
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handlePause} variant="outline" size="lg">
                  <Pause className="mr-2 h-4 w-4" />
                  Duraklat
                </Button>
                <Button onClick={handleReset} variant="outline" size="lg">
                  <Square className="mr-2 h-4 w-4" />
                  Sıfırla
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinutes(25)
              setSeconds(0)
            }}
          >
            25 dk
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinutes(15)
              setSeconds(0)
            }}
          >
            15 dk
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinutes(5)
              setSeconds(0)
            }}
          >
            5 dk
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

