"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { tr } from "@/lib/i18n"
import type { Trackable } from "@/types/database"
import { TimePicker } from "./time-picker"
import { DaySelector } from "./day-selector"

interface EditTrackableDialogProps {
  trackable: Trackable
  onUpdate: (id: string, data: Partial<Trackable>) => Promise<void>
}

export function EditTrackableDialog({
  trackable,
  onUpdate,
}: EditTrackableDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(trackable.title)
  const [type, setType] = useState(trackable.type)
  const [resetFrequency, setResetFrequency] = useState(
    trackable.reset_frequency || "none"
  )
  const [targetValue, setTargetValue] = useState(
    trackable.target_value?.toString() || ""
  )
  const [priority, setPriority] = useState(
    (trackable.priority as "low" | "medium" | "high") || "medium"
  )
  const [scheduledTime, setScheduledTime] = useState(
    trackable.scheduled_time || ""
  )
  const [selectedDays, setSelectedDays] = useState<string[]>(
    (trackable.selected_days as string[]) || []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onUpdate(trackable.id, {
        title,
        type,
        reset_frequency: resetFrequency as any,
        target_value: targetValue ? parseInt(targetValue) : null,
        priority: priority as any,
        scheduled_time: scheduledTime || null,
      })
      setOpen(false)
    } catch (error) {
      console.error("Error updating trackable:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Öğeyi Düzenle</DialogTitle>
            <DialogDescription>
              {trackable.title} öğesini düzenleyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{tr.trackables.title}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">{tr.trackables.type}</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType(value as "DAILY_HABIT" | "ONE_TIME" | "PROGRESS")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY_HABIT">
                    {tr.trackables.dailyHabit}
                  </SelectItem>
                  <SelectItem value="ONE_TIME">
                    {tr.trackables.oneTimeTask}
                  </SelectItem>
                  <SelectItem value="PROGRESS">
                    {tr.trackables.progressTracker}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === "PROGRESS" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="resetFrequency">
                    {tr.trackables.resetFrequency}
                  </Label>
                  <Select
                    value={resetFrequency}
                    onValueChange={(value) =>
                      setResetFrequency(value as "daily" | "weekly" | "none")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{tr.trackables.noReset}</SelectItem>
                      <SelectItem value="daily">{tr.trackables.daily}</SelectItem>
                      <SelectItem value="weekly">{tr.trackables.weekly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetValue">
                    {tr.trackables.targetValue}
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                  />
                </div>
              </>
            )}
            {/* Priority */}
            <div className="grid gap-2">
              <Label htmlFor="priority">Öncelik</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority(value as "low" | "medium" | "high")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Düşük
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      Orta
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Yüksek
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Scheduled Time */}
            <div className="grid gap-2">
              <TimePicker
                label="Hatırlatma Saati (Opsiyonel)"
                value={scheduledTime}
                onChange={setScheduledTime}
              />
            </div>
            {/* Day Selector */}
            <div className="grid gap-2">
              <DaySelector
                label="Haftanın Günleri (Opsiyonel - Boş bırakılırsa tüm günler)"
                value={selectedDays}
                onChange={setSelectedDays}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {tr.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? tr.common.loading : tr.common.update}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

