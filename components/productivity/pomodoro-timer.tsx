"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Timer, Play, Pause, Square } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addPomodoroSession } from "@/app/actions-productivity"

export function PomodoroTimer() {
  const router = useRouter()
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [showTaskInput, setShowTaskInput] = useState(false)
  const startTimeRef = useRef<Date | null>(null)
  const totalSecondsRef = useRef<number>(25 * 60)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused) {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date()
        totalSecondsRef.current = minutes * 60 + seconds
      }

      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            return prevSeconds - 1
          } else if (minutes > 0) {
            setMinutes((prevMinutes) => prevMinutes - 1)
            return 59
          } else {
            // Timer finished
            handleTimerComplete()
            return 0
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, minutes, seconds])

  useEffect(() => {
    // Request notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleTimerComplete = async () => {
    setIsRunning(false)
    setIsPaused(false)
    
    // Calculate actual duration
    const actualMinutes = totalSecondsRef.current - (minutes * 60 + seconds)
    const durationMinutes = Math.max(1, Math.ceil(actualMinutes / 60))
    
    try {
      const result = await addPomodoroSession({
        duration_minutes: durationMinutes,
        task_title: taskTitle || undefined,
        completed: true,
      })
      
      if (result?.success) {
        // Show notification
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Pomodoro Tamamlandı! 🎉', {
              body: taskTitle || 'Güzel bir çalışma seansı tamamladınız!',
              icon: '/favicon.ico',
            })
          }
        }
        
        // Reset
        setMinutes(25)
        setSeconds(0)
        setTaskTitle("")
        setShowTaskInput(false)
        startTimeRef.current = null
        totalSecondsRef.current = 25 * 60
        
        setTimeout(() => {
          router.refresh()
        }, 100)
      }
    } catch (error) {
      console.error("Error saving pomodoro session:", error)
    }
  }

  const handleStart = () => {
    startTimeRef.current = new Date()
    totalSecondsRef.current = minutes * 60 + seconds
    setIsRunning(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleReset = async () => {
    const wasRunning = isRunning
    setIsRunning(false)
    setIsPaused(false)
    
    // If timer was running, save incomplete session
    if (wasRunning && startTimeRef.current) {
      const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000 / 60)
      if (elapsed > 0) {
        try {
          await addPomodoroSession({
            duration_minutes: elapsed,
            task_title: taskTitle || undefined,
            completed: false,
          })
        } catch (error) {
          console.error("Error saving incomplete pomodoro session:", error)
        }
      }
    }
    
    setMinutes(25)
    setSeconds(0)
    startTimeRef.current = null
    totalSecondsRef.current = 25 * 60
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
              totalSecondsRef.current = 25 * 60
            }}
            disabled={isRunning}
          >
            25 dk
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinutes(15)
              setSeconds(0)
              totalSecondsRef.current = 15 * 60
            }}
            disabled={isRunning}
          >
            15 dk
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinutes(5)
              setSeconds(0)
              totalSecondsRef.current = 5 * 60
            }}
            disabled={isRunning}
          >
            5 dk
          </Button>
        </div>
        <div className="mt-4">
          {showTaskInput ? (
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Görev Adı (Opsiyonel)</Label>
              <Input
                id="taskTitle"
                placeholder="Ne üzerinde çalışıyorsunuz?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                disabled={isRunning}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTaskInput(false)}
                className="w-full"
              >
                Kapat
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTaskInput(true)}
              className="w-full"
              disabled={isRunning}
            >
              Görev Ekle
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

