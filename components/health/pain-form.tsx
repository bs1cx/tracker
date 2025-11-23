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
import { AlertCircle, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addPainLog } from "@/app/actions-health"

const painTypes = [
  { value: "sharp", label: "Keskin" },
  { value: "dull", label: "Donuk" },
  { value: "burning", label: "Yanma" },
  { value: "throbbing", label: "Zonklama" },
  { value: "aching", label: "Ağrı" },
  { value: "stabbing", label: "Bıçak Saplanır Gibi" },
  { value: "other", label: "Diğer" },
]

const painLocations = [
  { value: "head", label: "Baş" },
  { value: "neck", label: "Boyun" },
  { value: "shoulder", label: "Omuz" },
  { value: "back", label: "Sırt" },
  { value: "chest", label: "Göğüs" },
  { value: "stomach", label: "Karın" },
  { value: "arm", label: "Kol" },
  { value: "leg", label: "Bacak" },
  { value: "joint", label: "Eklem" },
  { value: "other", label: "Diğer" },
]

export function PainForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [painLevel, setPainLevel] = useState("5")
  const [painType, setPainType] = useState("")
  const [location, setLocation] = useState("")
  const [duration, setDuration] = useState("")
  const [triggers, setTriggers] = useState("")
  const [reliefMethod, setReliefMethod] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await addPainLog({
        pain_level: parseInt(painLevel),
        pain_type: painType || undefined,
        location: location,
        duration_minutes: duration ? parseInt(duration) : undefined,
        triggers: triggers || undefined,
        relief_method: reliefMethod || undefined,
        notes: notes || undefined,
      })
      setOpen(false)
      setPainLevel("5")
      setPainType("")
      setLocation("")
      setDuration("")
      setTriggers("")
      setReliefMethod("")
      setNotes("")
      router.refresh()
    } catch (error) {
      console.error("Error adding pain log:", error)
      alert("Ağrı kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-red-600/50 hover:border-red-600">
          <AlertCircle className="mr-2 h-4 w-4" />
          Ağrı Kaydı
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ağrı Kaydı Ekle</DialogTitle>
            <DialogDescription>
              Ağrı seviyenizi ve detaylarını kaydedin (0-10 arası)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="painLevel">Ağrı Seviyesi</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="painLevel"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(e.target.value)}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-red-400 w-12 text-center">
                  {painLevel}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Ağrı Yok</span>
                <span>Dayanılmaz</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Konum</Label>
              <Select value={location} onValueChange={setLocation} required>
                <SelectTrigger>
                  <SelectValue placeholder="Ağrı konumu seçin" />
                </SelectTrigger>
                <SelectContent>
                  {painLocations.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="painType">Ağrı Tipi (opsiyonel)</Label>
              <Select value={painType} onValueChange={setPainType}>
                <SelectTrigger>
                  <SelectValue placeholder="Ağrı tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {painTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Süre (dakika, opsiyonel)</Label>
              <input
                type="number"
                id="duration"
                min="0"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="triggers">Tetikleyiciler (opsiyonel)</Label>
              <Textarea
                id="triggers"
                placeholder="Ağrıyı tetikleyen faktörler..."
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reliefMethod">Rahatlatma Yöntemi (opsiyonel)</Label>
              <Textarea
                id="reliefMethod"
                placeholder="Ağrıyı nasıl rahatlattınız?"
                value={reliefMethod}
                onChange={(e) => setReliefMethod(e.target.value)}
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

