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
import { Pill, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addMedicationLog } from "@/app/actions-health"

const frequencyOptions = [
  { value: "once_daily", label: "Günde 1 kez" },
  { value: "twice_daily", label: "Günde 2 kez" },
  { value: "three_times_daily", label: "Günde 3 kez" },
  { value: "as_needed", label: "İhtiyaç halinde" },
  { value: "other", label: "Diğer" },
]

export function MedicationForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [medicationName, setMedicationName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await addMedicationLog({
        medication_name: medicationName,
        dosage: dosage || undefined,
        frequency: frequency || undefined,
        notes: notes || undefined,
      })
      
      if (result?.success) {
        setMedicationName("")
        setDosage("")
        setFrequency("")
        setNotes("")
        setOpen(false)
        setIsLoading(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      }
    } catch (error) {
      console.error("Error adding medication log:", error)
      setIsLoading(false)
      alert("İlaç kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-blue-500/50 hover:border-blue-500">
          <Pill className="mr-2 h-4 w-4" />
          İlaç Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>İlaç Kaydı Ekle</DialogTitle>
            <DialogDescription>
              Aldığınız ilacı kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="medicationName">İlaç Adı</Label>
              <Input
                id="medicationName"
                type="text"
                placeholder="İlaç adını girin"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dosage">Dozaj (opsiyonel)</Label>
              <Input
                id="dosage"
                type="text"
                placeholder="Örn: 500mg, 1 tablet"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Sıklık (opsiyonel)</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Sıklık seçin" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

