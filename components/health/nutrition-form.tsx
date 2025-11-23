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
import { Utensils, Scan } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addNutritionLog } from "@/app/actions-health"

export function NutritionForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [foodName, setFoodName] = useState("")
  const [calories, setCalories] = useState("")
  const [carbs, setCarbs] = useState("")
  const [protein, setProtein] = useState("")
  const [fat, setFat] = useState("")
  const [mealType, setMealType] = useState("")
  const [barcode, setBarcode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await addNutritionLog({
        calories: parseInt(calories),
        carbs_grams: carbs ? parseFloat(carbs) : undefined,
        protein_grams: protein ? parseFloat(protein) : undefined,
        fat_grams: fat ? parseFloat(fat) : undefined,
        meal_type: mealType || undefined,
        food_name: foodName || undefined,
      })
      
      if (result?.success) {
        // Reset form
        setFoodName("")
        setCalories("")
        setCarbs("")
        setProtein("")
        setFat("")
        setMealType("")
        setBarcode("")
        setOpen(false)
        setIsLoading(false)
        // Delay refresh to avoid hydration mismatch
        setTimeout(() => {
          router.refresh()
        }, 100)
      }
    } catch (error) {
      console.error("Error adding nutrition log:", error)
      setIsLoading(false)
      alert("Beslenme kaydı eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Utensils className="mr-2 h-4 w-4" />
          Yemek Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yemek Kaydı Ekle</DialogTitle>
            <DialogDescription>
              Yediğiniz yemeği ve makrolarını kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="foodName">Yemek Adı</Label>
              <Input
                id="foodName"
                placeholder="örn: Tavuk Göğsü"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="barcode">Barkod (Opsiyonel)</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  placeholder="Barkod numarası"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <Button type="button" variant="outline" size="icon">
                  <Scan className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mealType">Öğün</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Kahvaltı</SelectItem>
                  <SelectItem value="lunch">Öğle Yemeği</SelectItem>
                  <SelectItem value="dinner">Akşam Yemeği</SelectItem>
                  <SelectItem value="snack">Ara Öğün</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calories">{tr.health.calories} (kcal)</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                placeholder="250"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="carbs">{tr.health.carbs} (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  min="0"
                  placeholder="30"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="protein">{tr.health.protein} (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  min="0"
                  placeholder="25"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fat">{tr.health.fat} (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
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

