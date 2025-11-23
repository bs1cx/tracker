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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Wind, Play } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addMeditationSession } from "@/app/actions-mental"
import { useRouter } from "next/navigation"

export function MeditationForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionType, setSessionType] = useState("")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sessionType) {
      alert("Lütfen bir seans türü seçin.")
      return
    }
    
    if (!duration || isNaN(parseFloat(duration)) || parseFloat(duration) <= 0) {
      alert("Lütfen geçerli bir süre girin (0'dan büyük bir sayı).")
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await addMeditationSession({
        duration_minutes: parseInt(duration),
        type: sessionType as "breathing" | "mindfulness" | "guided" | "other",
        notes: notes || undefined,
      })
      
      if (result?.success) {
        // Reset form
        setSessionType("")
        setDuration("")
        setNotes("")
        setOpen(false)
        setIsLoading(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        setIsLoading(false)
        const errorMessage = result?.error || "Meditasyon kaydı eklenirken bir sorun oluştu. Lütfen tekrar deneyin."
        alert(errorMessage)
      }
    } catch (error: any) {
      console.error("Error adding meditation session:", error)
      setIsLoading(false)
      const errorMessage = error?.message || error?.error || "Meditasyon kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      alert(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Wind className="mr-2 h-4 w-4" />
          Meditasyon Başlat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{tr.mental.meditation}</DialogTitle>
            <DialogDescription>
              Meditasyon veya nefes egzersizi kaydı ekleyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sessionType">Seans Türü</Label>
              <Select value={sessionType} onValueChange={setSessionType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breathing">Nefes Egzersizi</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="guided">Rehberli Meditasyon</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Süre (Dakika)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="10"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
              <Input
                id="notes"
                placeholder="Nasıl geçti?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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

