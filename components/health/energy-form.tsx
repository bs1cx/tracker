"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Battery, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addEnergyLog } from "@/app/actions-health"

const timeOfDayOptions = [
  { value: "morning", label: "Sabah" },
  { value: "afternoon", label: "Öğleden Sonra" },
  { value: "evening", label: "Akşam" },
  { value: "night", label: "Gece" },
]

export function EnergyForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [energyLevel, setEnergyLevel] = useState("5")
  const [timeOfDay, setTimeOfDay] = useState("")
  const [factors, setFactors] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await addEnergyLog({
        energy_level: parseInt(energyLevel),
        time_of_day: timeOfDay || undefined,
        factors: factors || undefined,
        notes: notes || undefined,
      })
      setOpen(false)
      setEnergyLevel("5")
      setTimeOfDay("")
      setFactors("")
      setNotes("")
      router.refresh()
    } catch (error) {
      console.error("Error adding energy log:", error)
      alert("Enerji seviyesi kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-yellow-500/50 hover:border-yellow-500">
          <Battery className="mr-2 h-4 w-4" />
          Enerji Seviyesi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Enerji Seviyesi Ekle</DialogTitle>
            <DialogDescription>
              Mevcut enerji seviyenizi kaydedin (1-10 arası)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="energyLevel">Enerji Seviyesi</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="energyLevel"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(e.target.value)}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-yellow-400 w-12 text-center">
                  {energyLevel}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Çok Düşük</span>
                <span>Çok Yüksek</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeOfDay">Günün Saati (opsiyonel)</Label>
              <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Günün saati seçin" />
                </SelectTrigger>
                <SelectContent>
                  {timeOfDayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="factors">Etkileyen Faktörler (opsiyonel)</Label>
              <Textarea
                id="factors"
                placeholder="Enerji seviyenizi etkileyen faktörler..."
                value={factors}
                onChange={(e) => setFactors(e.target.value)}
                rows={2}
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

