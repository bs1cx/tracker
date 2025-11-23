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
import { Footprints, Plus } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addStepsLog } from "@/app/actions-health"

export function StepsForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [steps, setSteps] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await addStepsLog({
        steps_count: parseInt(steps),
      })
      
      if (result?.success) {
        setSteps("")
        setOpen(false)
        setIsLoading(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        setIsLoading(false)
        alert("Adım kaydı eklenirken bir sorun oluştu. Lütfen tekrar deneyin.")
      }
    } catch (error) {
      console.error("Error adding steps log:", error)
      setIsLoading(false)
      alert("Adım kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    }
  }

  const quickSteps = [1000, 5000, 10000, 15000]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-green-500/50 hover:border-green-500">
          <Footprints className="mr-2 h-4 w-4" />
          Adım Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adım Sayısı Ekle</DialogTitle>
            <DialogDescription>
              Bugün attığınız adım sayısını kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="steps">Adım Sayısı</Label>
              <Input
                id="steps"
                type="number"
                min="0"
                placeholder="10000"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quickSteps.map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSteps(num.toString())}
                >
                  {num.toLocaleString()}
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

