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
import { TrendingUp, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addIncome } from "@/app/actions-finance"

const incomeSources = [
  "Maaş",
  "Freelance",
  "Yatırım",
  "Kira Geliri",
  "Bonus",
  "Hediye",
  "Diğer",
]

export function IncomeForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [source, setSource] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await addIncome({
        amount: parseFloat(amount),
        source: source || undefined,
        description: description || undefined,
      })

      if (result?.success) {
        setOpen(false)
        setAmount("")
        setSource("")
        setDescription("")
        setTimeout(() => router.refresh(), 100)
      } else {
        alert(result?.error || "Gelir eklenirken bir hata oluştu.")
      }
    } catch (error: any) {
      console.error("Error adding income:", error)
      alert("Gelir eklenirken bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" />
          Yeni Gelir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Gelir Ekle</DialogTitle>
            <DialogDescription>
              Elde ettiğiniz geliri kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Tutar (₺)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Kaynak (Opsiyonel)</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Kaynak seçin" />
                </SelectTrigger>
                <SelectContent>
                  {incomeSources.map((src) => (
                    <SelectItem key={src} value={src}>
                      {src}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Input
                id="description"
                placeholder="Gelir detayı"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

