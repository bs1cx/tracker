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
import { AlertTriangle, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addStressLog } from "@/app/actions-health"

const stressSources = [
  { value: "work", label: "İş" },
  { value: "family", label: "Aile" },
  { value: "health", label: "Sağlık" },
  { value: "financial", label: "Finansal" },
  { value: "relationship", label: "İlişki" },
  { value: "other", label: "Diğer" },
]

export function StressForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stressLevel, setStressLevel] = useState("5")
  const [stressSource, setStressSource] = useState("")
  const [copingMethod, setCopingMethod] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await addStressLog({
        stress_level: parseInt(stressLevel),
        stress_source: stressSource || undefined,
        coping_method: copingMethod || undefined,
        notes: notes || undefined,
      })
      
      if (result?.success) {
        setStressLevel("5")
        setStressSource("")
        setCopingMethod("")
        setNotes("")
        setOpen(false)
        setIsLoading(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      }
    } catch (error) {
      console.error("Error adding stress log:", error)
      setIsLoading(false)
      alert("Stres seviyesi kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-red-500/50 hover:border-red-500">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Stres Seviyesi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Stres Seviyesi Ekle</DialogTitle>
            <DialogDescription>
              Mevcut stres seviyenizi kaydedin (1-10 arası)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stressLevel">Stres Seviyesi</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="stressLevel"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(e.target.value)}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-red-400 w-12 text-center">
                  {stressLevel}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Çok Düşük</span>
                <span>Çok Yüksek</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stressSource">Stres Kaynağı (opsiyonel)</Label>
              <Select value={stressSource} onValueChange={setStressSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Stres kaynağı seçin" />
                </SelectTrigger>
                <SelectContent>
                  {stressSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="copingMethod">Başa Çıkma Yöntemi (opsiyonel)</Label>
              <Textarea
                id="copingMethod"
                placeholder="Stresle nasıl başa çıktınız?"
                value={copingMethod}
                onChange={(e) => setCopingMethod(e.target.value)}
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

