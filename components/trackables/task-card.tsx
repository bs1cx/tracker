"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Trackable } from "@/types/database"
import { completeTrackable } from "@/app/actions"
import { useState } from "react"
import { formatDate } from "@/lib/date-utils"
import { tr } from "@/lib/i18n"

interface TaskCardProps {
  trackable: Trackable
}

export function TaskCard({ trackable }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(
    trackable.is_completed_today ?? false
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await completeTrackable({ id: trackable.id })
      setIsCompleted(!isCompleted)
    } catch (error) {
      console.error("Error completing trackable:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isCompleted && "opacity-60"
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggle}
          disabled={isLoading}
          className="h-5 w-5"
        />
        <div className="flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {trackable.title}
          </p>
          {trackable.last_completed_at && (
            <p className="text-xs text-muted-foreground mt-1">
              {tr.trackables.lastCompleted}{" "}
              {formatDate(trackable.last_completed_at, "PP")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

