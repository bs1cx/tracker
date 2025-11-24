"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Target, Plus, Edit, Trash2, CheckCircle2 } from "lucide-react"
import { tr } from "@/lib/i18n"
import { createGoal, updateGoal, deleteGoal, getActiveGoals } from "@/app/actions-productivity"

interface Goal {
  id: string
  title: string
  description?: string
  goal_type: "weekly" | "monthly" | "yearly"
  target_date?: string
  progress_percentage: number
  status: "active" | "completed" | "archived"
}

export function GoalsManager() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal_type: "weekly" as "weekly" | "monthly" | "yearly",
    target_date: "",
    progress_percentage: 0,
  })

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const data = await getActiveGoals()
      setGoals(data as Goal[])
    } catch (error) {
      console.error("Error loading goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingGoal) {
        const result = await updateGoal({
          id: editingGoal.id,
          title: formData.title,
          description: formData.description || undefined,
          progress_percentage: formData.progress_percentage,
        })

        if (result?.success) {
          setOpen(false)
          setEditingGoal(null)
          resetForm()
          loadGoals()
          // Dispatch custom event to update other components
          window.dispatchEvent(new Event('productivityDataUpdated'))
          setTimeout(() => router.refresh(), 100)
        } else {
          alert(result?.error || "Hedef güncellenirken bir hata oluştu.")
        }
      } else {
        const result = await createGoal({
          title: formData.title,
          description: formData.description || undefined,
          goal_type: formData.goal_type,
          target_date: formData.target_date || undefined,
          progress_percentage: formData.progress_percentage,
        })

        if (result?.success) {
          setOpen(false)
          resetForm()
          loadGoals()
          // Dispatch custom event to update other components
          window.dispatchEvent(new Event('productivityDataUpdated'))
          setTimeout(() => router.refresh(), 100)
        } else {
          alert(result?.error || "Hedef oluşturulurken bir hata oluştu.")
        }
      }
    } catch (error: any) {
      console.error("Error saving goal:", error)
      alert("Hedef kaydedilirken bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || "",
      goal_type: goal.goal_type,
      target_date: goal.target_date || "",
      progress_percentage: goal.progress_percentage,
    })
    setOpen(true)
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm("Bu hedefi silmek istediğinize emin misiniz?")) {
      return
    }

    try {
      const result = await deleteGoal(goalId)
      if (result?.success) {
        loadGoals()
        // Dispatch custom event to update other components
        window.dispatchEvent(new Event('productivityDataUpdated'))
        setTimeout(() => router.refresh(), 100)
      } else {
        alert(result?.error || "Hedef silinirken bir hata oluştu.")
      }
    } catch (error) {
      console.error("Error deleting goal:", error)
      alert("Hedef silinirken bir hata oluştu.")
    }
  }

  const handleComplete = async (goal: Goal) => {
    try {
      const result = await updateGoal({
        id: goal.id,
        progress_percentage: 100,
        status: "completed",
      })

      if (result?.success) {
        loadGoals()
        // Dispatch custom event to update other components
        window.dispatchEvent(new Event('productivityDataUpdated'))
        setTimeout(() => router.refresh(), 100)
      } else {
        alert(result?.error || "Hedef tamamlanırken bir hata oluştu.")
      }
    } catch (error: any) {
      console.error("Error completing goal:", error)
      alert(error?.message || "Hedef tamamlanırken bir hata oluştu.")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      goal_type: "weekly",
      target_date: "",
      progress_percentage: 0,
    })
    setEditingGoal(null)
  }

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case "weekly":
        return "Haftalık"
      case "monthly":
        return "Aylık"
      case "yearly":
        return "Yıllık"
      default:
        return type
    }
  }

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Target className="h-5 w-5 text-[#60a5fa]" />
            Hedefler
          </CardTitle>
          <Dialog open={open} onOpenChange={(open) => {
            setOpen(open)
            if (!open) {
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Hedef
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingGoal ? "Hedefi Düzenle" : "Yeni Hedef Oluştur"}
                  </DialogTitle>
                  <DialogDescription>
                    Haftalık, aylık veya yıllık hedef belirleyin
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Başlık *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="goal_type">Hedef Türü *</Label>
                    <Select
                      value={formData.goal_type}
                      onValueChange={(value: "weekly" | "monthly" | "yearly") =>
                        setFormData({ ...formData, goal_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Haftalık</SelectItem>
                        <SelectItem value="monthly">Aylık</SelectItem>
                        <SelectItem value="yearly">Yıllık</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="target_date">Hedef Tarih</Label>
                    <Input
                      id="target_date"
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    />
                  </div>
                  {editingGoal && (
                    <div className="grid gap-2">
                      <Label htmlFor="progress">İlerleme (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress_percentage}
                        onChange={(e) =>
                          setFormData({ ...formData, progress_percentage: parseInt(e.target.value) || 0 })
                        }
                      />
                      <Progress value={formData.progress_percentage} className="mt-2" />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setOpen(false)
                    resetForm()
                  }}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Kaydediliyor..." : editingGoal ? "Güncelle" : "Oluştur"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-slate-400">Yükleniyor...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-4 text-slate-400">
            Henüz hedef yok. Yeni hedef oluşturun!
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-3 border border-slate-700 rounded-lg bg-slate-900/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-200">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm text-slate-400 mt-1">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500">
                        {getGoalTypeLabel(goal.goal_type)}
                      </span>
                      {goal.target_date && (
                        <span className="text-xs text-slate-500">
                          • {new Date(goal.target_date).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleComplete(goal)}
                      title="Tamamla"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(goal)}
                      title="Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(goal.id)}
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>İlerleme</span>
                    <span>{goal.progress_percentage}%</span>
                  </div>
                  <Progress value={goal.progress_percentage} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

