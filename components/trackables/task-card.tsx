"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Trackable } from "@/types/database"
import { completeTrackable, updateTrackable, deleteTrackable } from "@/app/actions"
import { useState } from "react"
import { formatDate } from "@/lib/date-utils"
import { tr } from "@/lib/i18n"
import { EditTrackableDialog } from "./edit-trackable-dialog"
import { DeleteTrackableDialog } from "./delete-trackable-dialog"

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

  const handleUpdate = async (id: string, data: Partial<Trackable>) => {
    await updateTrackable({ id, ...data })
  }

  const handleDelete = async (id: string) => {
    await deleteTrackable({ id })
  }

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md group",
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
        <div className="flex-1 min-w-0">
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
      </CardContent>
    </Card>
  )
}

