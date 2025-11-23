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
import { Smile } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addMoodLog } from "@/app/actions-mental"
import { useRouter } from "next/navigation"

const moodOptions = [
  { value: "1", label: "😢 Çok Kötü", emoji: "😢" },
  { value: "2", label: "😞 Kötü", emoji: "😞" },
  { value: "3", label: "😕 Biraz Kötü", emoji: "😕" },
  { value: "4", label: "😐 Normal", emoji: "😐" },
  { value: "5", label: "🙂 Biraz İyi", emoji: "🙂" },
  { value: "6", label: "😊 İyi", emoji: "😊" },
  { value: "7", label: "😄 Çok İyi", emoji: "😄" },
  { value: "8", label: "🤩 Mükemmel", emoji: "🤩" },
  { value: "9", label: "🥳 Harika", emoji: "🥳" },
  { value: "10", label: "🌟 Muhteşem", emoji: "🌟" },
]

export function MoodForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [moodScore, setMoodScore] = useState("")
  const [moodLabel, setMoodLabel] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!moodScore) {
      alert("Lütfen bir ruh hali seçin.")
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await addMoodLog({
        mood_score: parseInt(moodScore),
        mood_label: moodLabel || undefined,
        notes: notes || undefined,
      })
      
      if (result?.success) {
        // Reset form
        setMoodScore("")
        setMoodLabel("")
        setNotes("")
        setOpen(false)
        setIsLoading(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        setIsLoading(false)
        const errorMessage = result?.error || "Ruh hali kaydı eklenirken bir sorun oluştu. Lütfen tekrar deneyin."
        alert(errorMessage)
      }
    } catch (error: any) {
      console.error("Error adding mood log:", error)
      setIsLoading(false)
      const errorMessage = error?.message || error?.error || "Ruh hali kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      alert(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Smile className="mr-2 h-4 w-4" />
          Ruh Hali Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{tr.mental.moodTracker}</DialogTitle>
            <DialogDescription>
              Bugünkü ruh halinizi kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="moodScore">Ruh Hali (1-10)</Label>
              <Select
                value={moodScore}
                onValueChange={(value) => {
                  setMoodScore(value)
                  const option = moodOptions.find((opt) => opt.value === value)
                  if (option) {
                    setMoodLabel(option.label.split(" ")[1] || "")
                  }
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ruh halinizi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
              <Input
                id="notes"
                placeholder="Bugün nasıl geçti?"
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

