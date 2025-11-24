"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Brain } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addMotivationLog } from "@/app/actions-mental"
import { Slider } from "@/components/ui/slider"

export function MotivationForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [motivationScore, setMotivationScore] = useState([5])
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!motivationScore[0] || motivationScore[0] < 1 || motivationScore[0] > 10) {
      alert("Lütfen 1-10 arası bir motivasyon puanı seçin.")
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await addMotivationLog({
        motivation_score: motivationScore[0],
        notes: notes || undefined,
      })
      
      if (result?.success) {
        // Reset form
        setMotivationScore([5])
        setNotes("")
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
        const errorMessage = result?.error || "Motivasyon kaydı eklenirken bir sorun oluştu. Lütfen tekrar deneyin."
        alert(errorMessage)
      }
    } catch (error: any) {
      console.error("Error adding motivation log:", error)
      setIsLoading(false)
      const errorMessage = error?.message || error?.error || "Motivasyon kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      alert(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Brain className="mr-2 h-4 w-4" />
          Motivasyon Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{tr.mental.motivation}</DialogTitle>
            <DialogDescription>
              Bugünkü motivasyon seviyenizi kaydedin (1-10 arası)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="motivationScore">
                Motivasyon Puanı: {motivationScore[0]}/10
              </Label>
              <Slider
                id="motivationScore"
                min={1}
                max={10}
                step={1}
                value={motivationScore}
                onValueChange={setMotivationScore}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 - Çok Düşük</span>
                <span>10 - Çok Yüksek</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
              <Input
                id="notes"
                placeholder="Motivasyonunuzu etkileyen faktörler?"
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

