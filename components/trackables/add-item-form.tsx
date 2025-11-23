"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createTrackable } from "@/app/actions"
import { useRouter } from "next/navigation"

export function AddItemForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "" as "DAILY_HABIT" | "ONE_TIME" | "PROGRESS" | "",
    target_value: "",
    reset_frequency: "none" as "daily" | "weekly" | "none",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createTrackable({
        title: formData.title,
        type: formData.type as "DAILY_HABIT" | "ONE_TIME" | "PROGRESS",
        target_value:
          formData.target_value && formData.type === "PROGRESS"
            ? parseInt(formData.target_value)
            : null,
        reset_frequency: formData.reset_frequency,
      })

      setFormData({
        title: "",
        type: "",
        target_value: "",
        reset_frequency: "none",
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating trackable:", error)
      alert("Failed to create trackable. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Create a new habit, task, or progress tracker.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Feed the dog"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as typeof formData.type,
                  })
                }
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY_HABIT">Daily Habit</SelectItem>
                  <SelectItem value="ONE_TIME">One-Time Task</SelectItem>
                  <SelectItem value="PROGRESS">Progress Tracker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === "DAILY_HABIT" && (
              <div className="grid gap-2">
                <Label htmlFor="reset_frequency">Reset Frequency</Label>
                <Select
                  value={formData.reset_frequency}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      reset_frequency: value as typeof formData.reset_frequency,
                    })
                  }
                >
                  <SelectTrigger id="reset_frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Reset</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {formData.type === "PROGRESS" && (
              <div className="grid gap-2">
                <Label htmlFor="target_value">Target Value (Optional)</Label>
                <Input
                  id="target_value"
                  type="number"
                  min="1"
                  placeholder="e.g., 24 (for 24 episodes)"
                  value={formData.target_value}
                  onChange={(e) =>
                    setFormData({ ...formData, target_value: e.target.value })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

