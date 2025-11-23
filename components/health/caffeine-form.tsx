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
import { Coffee, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addCaffeineLog } from "@/app/actions-health"

const caffeineSources = [
  { value: "coffee", label: "Kahve", defaultMg: 95 },
  { value: "tea", label: "Çay", defaultMg: 47 },
  { value: "energy_drink", label: "Enerji İçeceği", defaultMg: 80 },
  { value: "soda", label: "Kola/Gazlı İçecek", defaultMg: 34 },
  { value: "chocolate", label: "Çikolata", defaultMg: 20 },
  { value: "supplement", label: "Takviye", defaultMg: 100 },
  { value: "other", label: "Diğer", defaultMg: 50 },
]

export function CaffeineForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [source, setSource] = useState("")
  const [caffeineMg, setCaffeineMg] = useState("")
  const [notes, setNotes] = useState("")

  const handleSourceChange = (value: string) => {
    setSource(value)
    const selectedSource = caffeineSources.find((s) => s.value === value)
    if (selectedSource) {
      setCaffeineMg(selectedSource.defaultMg.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await addCaffeineLog({
        source: source,
        caffeine_mg: parseFloat(caffeineMg),
        notes: notes || undefined,
      })
      setSource("")
      setCaffeineMg("")
      setNotes("")
      setOpen(false)
      // Delay refresh to avoid hydration mismatch
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Error adding caffeine log:", error)
      alert("Kafein kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-amber-600/50 hover:border-amber-600">
          <Coffee className="mr-2 h-4 w-4" />
          Kafein Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Kafein Tüketimi Ekle</DialogTitle>
            <DialogDescription>
              Tükettiğiniz kafein miktarını kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="source">Kafein Kaynağı</Label>
              <Select value={source} onValueChange={handleSourceChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Kaynak seçin" />
                </SelectTrigger>
                <SelectContent>
                  {caffeineSources.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="caffeineMg">Kafein Miktarı (mg)</Label>
              <Input
                id="caffeineMg"
                type="number"
                min="0"
                max="1000"
                step="0.1"
                placeholder="95"
                value={caffeineMg}
                onChange={(e) => setCaffeineMg(e.target.value)}
                required
              />
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

