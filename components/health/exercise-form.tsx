"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Activity, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addExerciseLog } from "@/app/actions-health"

const exerciseTypes = [
  { value: "running", label: "Koşu" },
  { value: "cycling", label: "Bisiklet" },
  { value: "swimming", label: "Yüzme" },
  { value: "weightlifting", label: "Ağırlık Kaldırma" },
  { value: "yoga", label: "Yoga" },
  { value: "pilates", label: "Pilates" },
  { value: "walking", label: "Yürüyüş" },
  { value: "hiking", label: "Doğa Yürüyüşü" },
  { value: "dancing", label: "Dans" },
  { value: "sports", label: "Spor" },
  { value: "other", label: "Diğer" },
]

const intensityLevels = [
  { value: "low", label: "Düşük" },
  { value: "moderate", label: "Orta" },
  { value: "high", label: "Yüksek" },
  { value: "very_high", label: "Çok Yüksek" },
]

export function ExerciseForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [exerciseType, setExerciseType] = useState("")
  const [duration, setDuration] = useState("")
  const [intensity, setIntensity] = useState("")
  const [calories, setCalories] = useState("")
  const [distance, setDistance] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await addExerciseLog({
        exercise_type: exerciseType,
        duration_minutes: parseInt(duration),
        intensity: intensity || undefined,
        calories_burned: calories ? parseInt(calories) : undefined,
        distance_km: distance ? parseFloat(distance) : undefined,
        notes: notes || undefined,
      })
      setOpen(false)
      setExerciseType("")
      setDuration("")
      setIntensity("")
      setCalories("")
      setDistance("")
      setNotes("")
      router.refresh()
    } catch (error) {
      console.error("Error adding exercise log:", error)
      alert("Egzersiz kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-purple-500/50 hover:border-purple-500">
          <Activity className="mr-2 h-4 w-4" />
          Egzersiz Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Egzersiz Kaydı Ekle</DialogTitle>
            <DialogDescription>
              Yaptığınız egzersizi kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exerciseType">Egzersiz Tipi</Label>
              <Select value={exerciseType} onValueChange={setExerciseType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Egzersiz tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Süre (dakika)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="intensity">Yoğunluk</Label>
              <Select value={intensity} onValueChange={setIntensity}>
                <SelectTrigger>
                  <SelectValue placeholder="Yoğunluk seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  {intensityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="calories">Kalori (opsiyonel)</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  placeholder="300"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="distance">Mesafe km (opsiyonel)</Label>
                <Input
                  id="distance"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="5.0"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notlar (opsiyonel)</Label>
              <Textarea
                id="notes"
                placeholder="Notlarınızı buraya yazın..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {tr.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? tr.common.loading : tr.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

