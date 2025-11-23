"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Cigarette, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addSmokingLog } from "@/app/actions-health"

export function SmokingForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [count, setCount] = useState("1")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await addSmokingLog({
        cigarettes_count: parseInt(count),
        notes: notes || undefined,
      })
      setCount("1")
      setNotes("")
      setOpen(false)
      // Delay refresh to avoid hydration mismatch
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Error adding smoking log:", error)
      alert("Sigara kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  const quickCounts = [1, 2, 5, 10]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-orange-500/50 hover:border-orange-500">
          <Cigarette className="mr-2 h-4 w-4" />
          Sigara Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Sigara Kaydı Ekle</DialogTitle>
            <DialogDescription>
              İçtiğiniz sigara sayısını kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="count">Sigara Sayısı</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="200"
                placeholder="1"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quickCounts.map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCount(num.toString())}
                >
                  {num}
                </Button>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
              <Textarea
                id="notes"
                placeholder="Notlarınızı buraya yazın..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
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

