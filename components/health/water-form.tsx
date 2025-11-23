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
import { Droplet, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addWaterLog } from "@/app/actions-health"

export function WaterForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("250")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log("Submitting water log:", { amount })
      const result = await addWaterLog({
        amount_ml: parseInt(amount),
      })
      
      console.log("Water log result:", result)
      
      if (result?.success) {
        setAmount("250")
        setOpen(false)
        setIsLoading(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        console.error("No success in result:", result)
        setIsLoading(false)
        const errorMessage = result?.error || "Su kaydı eklenirken bir sorun oluştu. Lütfen tekrar deneyin."
        alert(errorMessage)
      }
    } catch (error: any) {
      console.error("Error adding water log:", error)
      console.error("Error message:", error?.message)
      console.error("Error stack:", error?.stack)
      setIsLoading(false)
      const errorMessage = error?.message || "Su kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      alert(errorMessage)
    }
  }

  const quickAmounts = [250, 500, 750, 1000]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Droplet className="mr-2 h-4 w-4" />
          Su Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Su Tüketimi Ekle</DialogTitle>
            <DialogDescription>
              İçtiğiniz su miktarını kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Miktar (ml)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="250"
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

