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
import { Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addHeartRateLog } from "@/app/actions-health"

export function HeartRateForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bpm, setBpm] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log("[CLIENT] Submitting heart rate log:", { heart_rate: bpm })
      const result = await addHeartRateLog({
        heart_rate: parseInt(bpm),
        notes: notes || undefined,
      })
      
      console.log("[CLIENT] Heart rate log result:", result)
      
      if (result?.success) {
        console.log("[CLIENT] Success! Closing dialog and refreshing...")
        setBpm("")
        setNotes("")
        setIsLoading(false)
        setOpen(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        console.error("[CLIENT] No success in result:", result)
        setIsLoading(false)
        const errorMessage = result?.error || "Nabız kaydı eklenirken bir sorun oluştu. Lütfen tekrar deneyin."
        alert(errorMessage)
      }
    } catch (error: any) {
      console.error("[CLIENT] Exception adding heart rate log:", error)
      setIsLoading(false)
      const errorMessage = error?.message || "Nabız kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      alert(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Kayıt Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nabız Kaydı Ekle</DialogTitle>
            <DialogDescription>
              Mevcut nabız değerinizi kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bpm">Nabız (BPM)</Label>
              <Input
                id="bpm"
                type="number"
                min="30"
                max="220"
                placeholder="örn: 72"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
              <Input
                id="notes"
                placeholder="Egzersiz sonrası, dinlenme, vb."
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

