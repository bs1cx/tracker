"use client"

import { useState, useMemo } from "react"
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
import { Plus, Search, Sparkles } from "lucide-react"
import { createTrackable } from "@/app/actions"
import { useRouter } from "next/navigation"
import {
  TASK_TEMPLATES,
  TASK_CATEGORIES,
  searchTemplates,
  type TaskTemplate,
} from "@/lib/task-templates"

export function AddItemForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"manual" | "templates">("templates")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [formData, setFormData] = useState({
    title: "",
    type: "" as "DAILY_HABIT" | "ONE_TIME" | "PROGRESS" | "",
    target_value: "",
    reset_frequency: "none" as "daily" | "weekly" | "none",
  })
  const router = useRouter()

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let templates = TASK_TEMPLATES

    if (searchQuery) {
      templates = searchTemplates(searchQuery)
    }

    if (selectedCategory !== "all") {
      templates = templates.filter(
        (template) => template.category === selectedCategory
      )
    }

    return templates
  }, [searchQuery, selectedCategory])

  const handleTemplateSelect = (template: TaskTemplate) => {
    setFormData({
      title: template.title,
      type: template.type,
      target_value: template.target_value?.toString() || "",
      reset_frequency: template.reset_frequency || "none",
    })
    setActiveTab("manual")
  }

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
      setSearchQuery("")
      setSelectedCategory("all")
      setActiveTab("templates")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating trackable:", error)
      alert("Failed to create trackable. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAdd = async (template: TaskTemplate) => {
    setIsLoading(true)
    try {
      await createTrackable({
        title: template.title,
        type: template.type,
        target_value: template.target_value || null,
        reset_frequency: template.reset_frequency || "none",
      })
      setOpen(false)
      setSearchQuery("")
      setSelectedCategory("all")
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Choose from templates or create a custom item.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            type="button"
            variant={activeTab === "templates" ? "default" : "ghost"}
            onClick={() => setActiveTab("templates")}
            className="rounded-b-none"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button
            type="button"
            variant={activeTab === "manual" ? "default" : "ghost"}
            onClick={() => setActiveTab("manual")}
            className="rounded-b-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Custom
          </Button>
        </div>

        {activeTab === "templates" && (
          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div>
              <Label className="text-sm mb-2 block">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TASK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <div className="col-span-2 text-center text-muted-foreground py-8">
                  No templates found. Try a different search.
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <Button
                    key={`${template.title}-${template.category}`}
                    type="button"
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-start justify-start text-left"
                    onClick={() => handleQuickAdd(template)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {template.emoji && (
                        <span className="text-lg">{template.emoji}</span>
                      )}
                      <span className="font-medium text-sm flex-1">
                        {template.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {template.category}
                    </span>
                  </Button>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "manual" && (
          <form onSubmit={handleSubmit}>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  setFormData({
                    title: "",
                    type: "",
                    target_value: "",
                    reset_frequency: "none",
                  })
                  setActiveTab("templates")
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

