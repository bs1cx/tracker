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

export function JournalForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [moodScore, setMoodScore] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement API call
    setTimeout(() => {
      setIsLoading(false)
      setOpen(false)
      setTitle("")
      setContent("")
      setMoodScore("")
    }, 1000)
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
              <textarea
                id="content"
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Bugün neler oldu? Nasıl hissettin?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
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

