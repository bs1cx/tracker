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
import { Wine, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addAlcoholLog } from "@/app/actions-health"

const drinkTypes = [
  { value: "beer", label: "Bira" },
  { value: "wine", label: "Şarap" },
  { value: "spirits", label: "Rakı/Votka/Cin" },
  { value: "cocktail", label: "Kokteyl" },
  { value: "other", label: "Diğer" },
]

export function AlcoholForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [drinkType, setDrinkType] = useState("")
  const [amount, setAmount] = useState("")
  const [alcoholPercentage, setAlcoholPercentage] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await addAlcoholLog({
        drink_type: drinkType,
        amount_ml: parseFloat(amount),
        alcohol_percentage: alcoholPercentage ? parseFloat(alcoholPercentage) : undefined,
        notes: notes || undefined,
      })
      
      if (result?.success) {
        setDrinkType("")
        setAmount("")
        setAlcoholPercentage("")
        setNotes("")
        setOpen(false)
        setIsLoading(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        setIsLoading(false)
        alert("Alkol kaydı eklenirken bir sorun oluştu. Lütfen tekrar deneyin.")
      }
    } catch (error) {
      console.error("Error adding alcohol log:", error)
      setIsLoading(false)
      alert("Alkol kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    }
  }

  const quickAmounts = [250, 330, 500, 750]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-amber-500/50 hover:border-amber-500">
          <Wine className="mr-2 h-4 w-4" />
          Alkol Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Alkol Tüketimi Ekle</DialogTitle>
            <DialogDescription>
              İçtiğiniz alkol miktarını kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="drinkType">İçecek Tipi</Label>
              <Select value={drinkType} onValueChange={setDrinkType} required>
                <SelectTrigger>
                  <SelectValue placeholder="İçecek tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {drinkTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Miktar (ml)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.1"
                placeholder="330"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((ml) => (
                <Button
                  key={ml}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(ml.toString())}
                >
                  {ml}ml
                </Button>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="alcoholPercentage">Alkol Yüzdesi (opsiyonel)</Label>
              <Input
                id="alcoholPercentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="5.0"
                value={alcoholPercentage}
                onChange={(e) => setAlcoholPercentage(e.target.value)}
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

