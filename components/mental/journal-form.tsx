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
import { BookOpen } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addJournalEntry } from "@/app/actions-mental"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

export function JournalForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [moodScore, setMoodScore] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      alert("Lütfen günlük içeriğini girin.")
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await addJournalEntry({
        title: title || undefined,
        content: content.trim(),
        mood_before: moodScore ? parseInt(moodScore) : undefined,
      })
      
      if (result?.success) {
        // Reset form
        setTitle("")
        setContent("")
        setMoodScore("")
        setOpen(false)
        setIsLoading(false)
        // Dispatch custom event to update other components
        window.dispatchEvent(new Event('mentalDataUpdated'))
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        setIsLoading(false)
        const errorMessage = result?.error || "Günlük girişi eklenirken bir sorun oluştu. Lütfen tekrar deneyin."
        alert(errorMessage)
      }
    } catch (error: any) {
      console.error("Error adding journal entry:", error)
      setIsLoading(false)
      const errorMessage = error?.message || error?.error || "Günlük girişi eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      alert(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <BookOpen className="mr-2 h-4 w-4" />
          Günlük Yaz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{tr.mental.journal}</DialogTitle>
            <DialogDescription>
              Günlük girişinizi yazın
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Başlık (Opsiyonel)</Label>
              <Input
                id="title"
                placeholder="Bugünün başlığı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                placeholder="Bugün neler oldu? Nasıl hissettin?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="min-h-[200px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="moodScore">Ruh Hali (1-10, Opsiyonel)</Label>
              <Input
                id="moodScore"
                type="number"
                min="1"
                max="10"
                placeholder="5"
                value={moodScore}
                onChange={(e) => setMoodScore(e.target.value)}
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

