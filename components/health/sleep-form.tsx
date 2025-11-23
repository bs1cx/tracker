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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Moon } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addSleepLog } from "@/app/actions-health"

export function SleepForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [duration, setDuration] = useState("")
  const [quality, setQuality] = useState("")
  const [rem, setRem] = useState("")
  const [light, setLight] = useState("")
  const [deep, setDeep] = useState("")
  const [efficiency, setEfficiency] = useState("")
  const [wakeTimes, setWakeTimes] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await addSleepLog({
        sleep_duration: parseFloat(duration),
        sleep_quality: quality || undefined,
        rem_duration: rem ? parseFloat(rem) : undefined,
        light_sleep_duration: light ? parseFloat(light) : undefined,
        deep_sleep_duration: deep ? parseFloat(deep) : undefined,
        sleep_efficiency: efficiency ? parseFloat(efficiency) : undefined,
        notes: notes || undefined,
      })
      
      if (result?.success) {
        // Reset form
        setDuration("")
        setQuality("")
        setRem("")
        setLight("")
        setDeep("")
        setEfficiency("")
        setWakeTimes("")
        setNotes("")
        setOpen(false)
        setIsLoading(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        setIsLoading(false)
        alert("Uyku kaydı eklenirken bir sorun oluştu. Lütfen tekrar deneyin.")
      }
    } catch (error) {
      console.error("Error adding sleep log:", error)
      setIsLoading(false)
      alert("Uyku kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Moon className="mr-2 h-4 w-4" />
          Uyku Kaydı
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Uyku Kaydı Ekle</DialogTitle>
            <DialogDescription>
              Gece uykunuzun detaylarını kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="duration">Uyku Süresi (Saat)</Label>
              <Input
                id="duration"
                type="number"
                step="0.1"
                min="0"
                max="24"
                placeholder="örn: 7.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quality">Uyku Kalitesi</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Kötü</SelectItem>
                  <SelectItem value="fair">Orta</SelectItem>
                  <SelectItem value="good">İyi</SelectItem>
                  <SelectItem value="excellent">Mükemmel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="rem">REM (dk)</Label>
                <Input
                  id="rem"
                  type="number"
                  placeholder="90"
                  value={rem}
                  onChange={(e) => setRem(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="light">{tr.health.light} (dk)</Label>
                <Input
                  id="light"
                  type="number"
                  placeholder="180"
                  value={light}
                  onChange={(e) => setLight(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deep">{tr.health.deep} (dk)</Label>
                <Input
                  id="deep"
                  type="number"
                  placeholder="120"
                  value={deep}
                  onChange={(e) => setDeep(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="efficiency">Uyku Verimliliği (%)</Label>
              <Input
                id="efficiency"
                type="number"
                min="0"
                max="100"
                placeholder="örn: 85"
                value={efficiency}
                onChange={(e) => setEfficiency(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wakeTimes">Uyanma Sayısı</Label>
              <Input
                id="wakeTimes"
                type="number"
                min="0"
                placeholder="örn: 2"
                value={wakeTimes}
                onChange={(e) => setWakeTimes(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notlar</Label>
              <Input
                id="notes"
                placeholder="Rüyalar, uyku sorunları, vb."
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

