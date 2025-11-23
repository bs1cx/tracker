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

export function MeditationForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionType, setSessionType] = useState("")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement API call
    setTimeout(() => {
      setIsLoading(false)
      setOpen(false)
      setSessionType("")
      setDuration("")
      setNotes("")
    }, 1000)
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
                  <SelectItem value="meditation">Meditasyon</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
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

