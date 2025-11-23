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
import { TimePicker } from "./time-picker"
import {
  TASK_TEMPLATES,
  TASK_CATEGORIES,
  searchTemplates,
  type TaskTemplate,
} from "@/lib/task-templates"
import { tr } from "@/lib/i18n"

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
    scheduled_time: "",
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
      scheduled_time: "",
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
        scheduled_time: "",
      })
      setSearchQuery("")
      setSelectedCategory("all")
      setActiveTab("templates")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating trackable:", error)
      alert(tr.trackables.failed)
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
      alert(tr.trackables.failed)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {tr.dashboard.addItem}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tr.trackables.addNew}</DialogTitle>
          <DialogDescription>
            {tr.trackables.createNew}
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
            {tr.templates.title}
          </Button>
          <Button
            type="button"
            variant={activeTab === "manual" ? "default" : "ghost"}
            onClick={() => setActiveTab("manual")}
            className="rounded-b-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            {tr.templates.custom}
          </Button>
        </div>

        {activeTab === "templates" && (
          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={tr.templates.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div>
              <Label className="text-sm mb-2 block">{tr.templates.category}</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tr.templates.allCategories}</SelectItem>
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
                  {tr.templates.noTemplates}
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
              <Label htmlFor="title">{tr.trackables.title}</Label>
              <Input
                id="title"
                placeholder="örn: Köpeği besle"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">{tr.trackables.type}</Label>
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
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY_HABIT">{tr.trackables.dailyHabit}</SelectItem>
                  <SelectItem value="ONE_TIME">{tr.trackables.oneTimeTask}</SelectItem>
                  <SelectItem value="PROGRESS">{tr.trackables.progressTracker}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === "DAILY_HABIT" && (
              <div className="grid gap-2">
                <Label htmlFor="reset_frequency">{tr.trackables.resetFrequency}</Label>
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
                    <SelectItem value="none">{tr.trackables.noReset}</SelectItem>
                    <SelectItem value="daily">{tr.trackables.daily}</SelectItem>
                    <SelectItem value="weekly">{tr.trackables.weekly}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {formData.type === "PROGRESS" && (
              <div className="grid gap-2">
                <Label htmlFor="target_value">{tr.trackables.targetValue}</Label>
                <Input
                  id="target_value"
                  type="number"
                  min="1"
                  placeholder="örn: 24 (24 bölüm için)"
                  value={formData.target_value}
                  onChange={(e) =>
                    setFormData({ ...formData, target_value: e.target.value })
                  }
                />
              </div>
            )}
            {(formData.type === "DAILY_HABIT" || formData.type === "ONE_TIME") && (
              <div className="grid gap-2">
                <TimePicker
                  label="Hatırlatma Saati (Opsiyonel)"
                  value={formData.scheduled_time}
                  onChange={(time) =>
                    setFormData({ ...formData, scheduled_time: time })
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
                    scheduled_time: "",
                  })
                  setActiveTab("templates")
                }}
              >
                {tr.common.cancel}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? tr.trackables.creating : tr.common.create}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

