"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Minus } from "lucide-react"
import type { Trackable } from "@/types/database"
import { incrementProgress, decrementProgress, updateTrackable, deleteTrackable } from "@/app/actions"
import { useState } from "react"
import { EditTrackableDialog } from "./edit-trackable-dialog"
import { DeleteTrackableDialog } from "./delete-trackable-dialog"

interface ProgressTrackerProps {
  trackable: Trackable
}

export function ProgressTracker({ trackable }: ProgressTrackerProps) {
  const [currentValue, setCurrentValue] = useState(trackable.current_value)
  const [isLoading, setIsLoading] = useState(false)

  const handleIncrement = async () => {
    setIsLoading(true)
    try {
      await incrementProgress({ id: trackable.id, amount: 1 })
      setCurrentValue((prev) => prev + 1)
    } catch (error) {
      console.error("Error incrementing progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecrement = async () => {
    if (currentValue <= 0) return
    setIsLoading(true)
    try {
      await decrementProgress({ id: trackable.id })
      setCurrentValue((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error decrementing progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const progressPercentage =
    trackable.target_value && trackable.target_value > 0
      ? (currentValue / trackable.target_value) * 100
      : 0

  const handleUpdate = async (id: string, data: Partial<Trackable>) => {
    await updateTrackable({ id, ...data })
  }

  const handleDelete = async (id: string) => {
    await deleteTrackable({ id })
  }

  return (
    <Card className="group border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base text-slate-200">{trackable.title}</CardTitle>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <EditTrackableDialog
            trackable={trackable}
            onUpdate={handleUpdate}
          />
          <DeleteTrackableDialog
            trackable={trackable}
            onDelete={handleDelete}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={isLoading || currentValue <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-2xl font-bold min-w-[3rem] text-center text-[#60a5fa]">
              {currentValue}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {trackable.target_value && (
            <span className="text-sm text-slate-400">
              / {trackable.target_value}
            </span>
          )}
        </div>
        {trackable.target_value && trackable.target_value > 0 && (
          <Progress value={Math.min(progressPercentage, 100)} />
        )}
      </CardContent>
    </Card>
  )
}

