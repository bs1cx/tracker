"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Focus, Play, Square, Clock } from "lucide-react"
import { tr } from "@/lib/i18n"
import { addFocusSession } from "@/app/actions-productivity"

export function FocusMode() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [duration, setDuration] = useState(0)
  const [distractions, setDistractions] = useState(0)
  const [notes, setNotes] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && startTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60)
        setDuration(elapsed)
      }, 60000) // Update every minute
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, startTime])

  const handleStart = () => {
    setIsActive(true)
    setStartTime(new Date())
    setDuration(0)
    setDistractions(0)
  }

  const handleStop = () => {
    setIsActive(false)
    setShowSaveDialog(true)
  }

  const handleSave = async () => {
    if (duration === 0) {
      alert("Lütfen en az 1 dakika odaklanın.")
      return
    }

    try {
      const result = await addFocusSession({
        duration_minutes: duration,
        distractions: distractions,
        notes: notes || undefined,
      })

      if (result?.success) {
        setShowSaveDialog(false)
        setIsActive(false)
        setStartTime(null)
        setDuration(0)
        setDistractions(0)
        setNotes("")
        
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        alert(result?.error || "Odak seansı kaydedilirken bir hata oluştu.")
      }
    } catch (error: any) {
      console.error("Error saving focus session:", error)
      alert("Odak seansı kaydedilirken bir hata oluştu.")
    }
  }

  const handleCancel = () => {
    setShowSaveDialog(false)
    setIsActive(true)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}s ${mins}dk`
    }
    return `${mins}dk`
  }

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Focus className="h-5 w-5 text-[#60a5fa]" />
          {tr.productivity.focusMode}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          <>
            <div className="text-center py-4">
              <p className="text-slate-400 mb-4">
                Odak modunu başlattığınızda, çalışma süreniz takip edilir.
              </p>
              <Button onClick={handleStart} size="lg" className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Odak Modunu Başlat
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-[#60a5fa]" />
                <span className="text-2xl font-bold text-slate-200">
                  {formatDuration(duration)}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Odaklanma süreniz takip ediliyor...
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Dikkat Dağıtıcı Sayısı</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDistractions(Math.max(0, distractions - 1))}
                >
                  -
                </Button>
                <span className="text-lg font-semibold text-slate-200 w-12 text-center">
                  {distractions}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDistractions(distractions + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <Button onClick={handleStop} variant="destructive" className="w-full">
              <Square className="mr-2 h-4 w-4" />
              Durdur ve Kaydet
            </Button>
          </>
        )}

        {showSaveDialog && (
          <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
            <div>
              <Label className="text-slate-300">Süre: {formatDuration(duration)}</Label>
            </div>
            <div>
              <Label className="text-slate-300">Dikkat Dağıtıcı: {distractions}</Label>
            </div>
            <div>
              <Label htmlFor="focusNotes" className="text-slate-300">Notlar (Opsiyonel)</Label>
              <Textarea
                id="focusNotes"
                placeholder="Bu seans hakkında notlar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Kaydet
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                İptal
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

