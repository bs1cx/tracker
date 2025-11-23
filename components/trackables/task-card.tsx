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
import { Clock, Calendar } from "lucide-react"

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
        "transition-all hover:shadow-lg group border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm",
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
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm font-medium text-slate-200",
                isCompleted && "line-through text-slate-500"
              )}
            >
              {trackable.title}
            </p>
            {trackable.priority && (
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  trackable.priority === "high" && "bg-red-500",
                  trackable.priority === "medium" && "bg-yellow-500",
                  trackable.priority === "low" && "bg-green-500"
                )}
                title={
                  trackable.priority === "high"
                    ? "Yüksek Öncelik"
                    : trackable.priority === "medium"
                    ? "Orta Öncelik"
                    : "Düşük Öncelik"
                }
              />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {trackable.last_completed_at && (
              <p className="text-xs text-slate-400">
                {tr.trackables.lastCompleted}{" "}
                {formatDate(trackable.last_completed_at, "PP")}
              </p>
            )}
            {trackable.scheduled_time && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3 text-[#60a5fa]" />
                {trackable.scheduled_time}
              </div>
            )}
            {trackable.selected_days && trackable.selected_days.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="h-3 w-3 text-[#60a5fa]" />
                <span className="truncate max-w-[100px]">
                  {trackable.selected_days.length} gün
                </span>
              </div>
            )}
          </div>
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

