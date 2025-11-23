"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  getOrCreateTodaySummary,
  updateDailyHealthSummary,
  calculateTodaySummary,
  deleteDailyHealthSummary,
} from "@/app/actions-daily-health"
import { DailyHealthSummary } from "@/types/database"
import { FileText, Edit, CheckCircle2, XCircle, Calendar, Trash2, Activity, Heart, Moon, Droplet, Utensils, Cigarette, Wine, Coffee, Battery, AlertTriangle, Pill, Footprints } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export function DailyHealthSummaryCard() {
  const router = useRouter()
  const [summary, setSummary] = useState<DailyHealthSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [open, setOpen] = useState(false)
  const [showCarryOverDialog, setShowCarryOverDialog] = useState(false)
  const [yesterdayConditions, setYesterdayConditions] = useState<string[]>([])

  // Form state
  const [wellnessScore, setWellnessScore] = useState("")
  const [notes, setNotes] = useState("")
  const [ongoingConditions, setOngoingConditions] = useState<string[]>([])
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [medications, setMedications] = useState<string[]>([])
  const [newCondition, setNewCondition] = useState("")
  const [newSymptom, setNewSymptom] = useState("")
  const [newMedication, setNewMedication] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setIsLoading(true)
      const todaySummary = await getOrCreateTodaySummary()
      setSummary(todaySummary)

      // Check if we need to show carry-over dialog
      if (todaySummary.carried_over_conditions && !todaySummary.is_completed) {
        setYesterdayConditions(todaySummary.ongoing_conditions || [])
        setShowCarryOverDialog(true)
      }

      // Auto-calculate from logs
      await calculateTodaySummary()
      const updated = await getOrCreateTodaySummary()
      setSummary(updated)

      // Set form values
      setWellnessScore(updated.overall_wellness_score?.toString() || "")
      setNotes(updated.notes || "")
      setOngoingConditions(updated.ongoing_conditions || [])
      setSymptoms(updated.symptoms || [])
      setMedications(updated.medications_taken || [])
    } catch (error) {
      console.error("Error loading summary:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (!summary) return

      setIsLoading(true)
      await updateDailyHealthSummary({
        id: summary.id,
        overall_wellness_score: wellnessScore ? parseInt(wellnessScore) : null,
        notes: notes || null,
        ongoing_conditions: ongoingConditions.length > 0 ? ongoingConditions : null,
        symptoms: symptoms.length > 0 ? symptoms : null,
        medications_taken: medications.length > 0 ? medications : null,
        is_completed: true,
      })

      await loadSummary()
      setIsEditing(false)
      setOpen(false)
    } catch (error) {
      console.error("Error saving summary:", error)
      alert("Özet kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCarryOverDecision = async (keepConditions: boolean) => {
    try {
      if (!summary) return

      setIsLoading(true)
      await updateDailyHealthSummary({
        id: summary.id,
        ongoing_conditions: keepConditions ? yesterdayConditions : null,
        carried_over_conditions: keepConditions,
      })

      setShowCarryOverDialog(false)
      await loadSummary()
    } catch (error) {
      console.error("Error updating carry-over:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addCondition = () => {
    if (newCondition.trim()) {
      setOngoingConditions([...ongoingConditions, newCondition.trim()])
      setNewCondition("")
    }
  }

  const removeCondition = (index: number) => {
    setOngoingConditions(ongoingConditions.filter((_, i) => i !== index))
  }

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setSymptoms([...symptoms, newSymptom.trim()])
      setNewSymptom("")
    }
  }

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index))
  }

  const addMedication = () => {
    if (newMedication.trim()) {
      setMedications([...medications, newMedication.trim()])
      setNewMedication("")
    }
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const handleDelete = async () => {
    try {
      if (!summary) return

      setIsLoading(true)
      await deleteDailyHealthSummary(summary.id)
      setShowDeleteDialog(false)
      await loadSummary()
      router.refresh()
    } catch (error) {
      console.error("Error deleting summary:", error)
      alert("Özet silinirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !summary) {
    return (
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-slate-400">Yükleniyor...</p>
        </CardContent>
      </Card>
    )
  }

  if (!summary) return null

  return (
    <>
      {/* Carry-over Dialog */}
      <Dialog open={showCarryOverDialog} onOpenChange={setShowCarryOverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Önceki Günden Devam Eden Durumlar</DialogTitle>
            <DialogDescription>
              Dün kaydettiğiniz şu durumlar devam ediyor mu?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              {yesterdayConditions.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleCarryOverDecision(false)}
              disabled={isLoading}
            >
              Hayır, Devam Etmiyor
            </Button>
            <Button onClick={() => handleCarryOverDecision(true)} disabled={isLoading}>
              Evet, Devam Ediyor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Summary Card */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-200">
              <FileText className="h-5 w-5 text-blue-500" />
              Günlük Sağlık Özeti
            </CardTitle>
            <div className="flex items-center gap-2">
              {summary.is_completed && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Özeti Sil</DialogTitle>
                    <DialogDescription>
                      Bu günlük sağlık özetini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      İptal
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                      {isLoading ? "Siliniyor..." : "Sil"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-400 hover:text-red-300 hover:border-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(true)
                      setOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {summary.is_completed ? "Düzenle" : "Özet Oluştur"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Günlük Sağlık Özeti</DialogTitle>
                    <DialogDescription>
                      {format(new Date(summary.summary_date), "d MMMM yyyy", { locale: tr })}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    {/* Wellness Score */}
                    <div className="grid gap-2">
                      <Label htmlFor="wellness">Genel Sağlık Skoru (0-10)</Label>
                      <Input
                        id="wellness"
                        type="number"
                        min="0"
                        max="10"
                        placeholder="5"
                        value={wellnessScore}
                        onChange={(e) => setWellnessScore(e.target.value)}
                      />
                    </div>

                    {/* Ongoing Conditions */}
                    <div className="grid gap-2">
                      <Label>Devam Eden Hastalıklar/Durumlar</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Örn: Migren, Soğuk algınlığı"
                          value={newCondition}
                          onChange={(e) => setNewCondition(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addCondition()
                            }
                          }}
                        />
                        <Button type="button" onClick={addCondition} size="sm">
                          Ekle
                        </Button>
                      </div>
                      {ongoingConditions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {ongoingConditions.map((condition, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-slate-700 px-2 py-1 rounded text-sm"
                            >
                              <span>{condition}</span>
                              <button
                                type="button"
                                onClick={() => removeCondition(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Symptoms */}
                    <div className="grid gap-2">
                      <Label>Belirtiler</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Örn: Baş ağrısı, Yorgunluk"
                          value={newSymptom}
                          onChange={(e) => setNewSymptom(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addSymptom()
                            }
                          }}
                        />
                        <Button type="button" onClick={addSymptom} size="sm">
                          Ekle
                        </Button>
                      </div>
                      {symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {symptoms.map((symptom, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-slate-700 px-2 py-1 rounded text-sm"
                            >
                              <span>{symptom}</span>
                              <button
                                type="button"
                                onClick={() => removeSymptom(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Medications */}
                    <div className="grid gap-2">
                      <Label>Alınan İlaçlar</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Örn: Parol, Aspirin"
                          value={newMedication}
                          onChange={(e) => setNewMedication(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addMedication()
                            }
                          }}
                        />
                        <Button type="button" onClick={addMedication} size="sm">
                          Ekle
                        </Button>
                      </div>
                      {medications.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {medications.map((med, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-slate-700 px-2 py-1 rounded text-sm"
                            >
                              <span>{med}</span>
                              <button
                                type="button"
                                onClick={() => removeMedication(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notlar</Label>
                      <Textarea
                        id="notes"
                        placeholder="Günlük notlarınızı buraya yazın..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* All Health Data Summary */}
                    <div className="pt-4 border-t border-slate-700">
                      <h3 className="text-lg font-semibold text-slate-200 mb-4">Günlük Sağlık Verileri</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Steps */}
                        <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                          <Footprints className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-xs text-slate-400">Adım</p>
                            <p className="text-lg font-semibold text-slate-200">
                              {summary.total_steps.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Water */}
                        <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                          <Droplet className="h-5 w-5 text-cyan-500" />
                          <div>
                            <p className="text-xs text-slate-400">Su</p>
                            <p className="text-lg font-semibold text-slate-200">
                              {summary.total_water_ml.toLocaleString()} ml
                            </p>
                          </div>
                        </div>

                        {/* Calories */}
                        <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                          <Utensils className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-xs text-slate-400">Kalori</p>
                            <p className="text-lg font-semibold text-slate-200">
                              {summary.total_calories.toLocaleString()} kcal
                            </p>
                          </div>
                        </div>

                        {/* Exercise */}
                        <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                          <Activity className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-xs text-slate-400">Egzersiz</p>
                            <p className="text-lg font-semibold text-slate-200">
                              {summary.total_exercise_minutes} dk
                            </p>
                          </div>
                        </div>

                        {/* Sleep */}
                        {summary.sleep_hours && (
                          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                            <Moon className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-xs text-slate-400">Uyku</p>
                              <p className="text-lg font-semibold text-slate-200">
                                {summary.sleep_hours.toFixed(1)} saat
                              </p>
                              {summary.sleep_quality && (
                                <p className="text-xs text-slate-400 capitalize">{summary.sleep_quality}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Heart Rate */}
                        {summary.avg_heart_rate && (
                          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                            <Heart className="h-5 w-5 text-red-500" />
                            <div>
                              <p className="text-xs text-slate-400">Nabız</p>
                              <p className="text-lg font-semibold text-slate-200">
                                {summary.avg_heart_rate} BPM
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Energy */}
                        {summary.avg_energy_level !== null && (
                          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                            <Battery className="h-5 w-5 text-yellow-500" />
                            <div>
                              <p className="text-xs text-slate-400">Enerji</p>
                              <p className="text-lg font-semibold text-slate-200">
                                {summary.avg_energy_level.toFixed(1)}/10
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Stress */}
                        {summary.avg_stress_level !== null && (
                          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div>
                              <p className="text-xs text-slate-400">Stres</p>
                              <p className="text-lg font-semibold text-slate-200">
                                {summary.avg_stress_level.toFixed(1)}/10
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Smoking */}
                        {summary.cigarettes_count > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                            <Cigarette className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="text-xs text-slate-400">Sigara</p>
                              <p className="text-lg font-semibold text-slate-200">
                                {summary.cigarettes_count} adet
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Alcohol */}
                        {summary.alcohol_drinks > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                            <Wine className="h-5 w-5 text-amber-500" />
                            <div>
                              <p className="text-xs text-slate-400">Alkol</p>
                              <p className="text-lg font-semibold text-slate-200">
                                {summary.alcohol_drinks} içecek
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Caffeine */}
                        {summary.caffeine_mg > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded">
                            <Coffee className="h-5 w-5 text-amber-600" />
                            <div>
                              <p className="text-xs text-slate-400">Kafein</p>
                              <p className="text-lg font-semibold text-slate-200">
                                {Math.round(summary.caffeine_mg)} mg
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Symptoms */}
                    {summary.symptoms && summary.symptoms.length > 0 && (
                      <div className="pt-4 border-t border-slate-700">
                        <Label className="mb-2">Belirtiler</Label>
                        <div className="flex flex-wrap gap-2">
                          {summary.symptoms.map((symptom, index) => (
                            <span
                              key={index}
                              className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medications */}
                    {summary.medications_taken && summary.medications_taken.length > 0 && (
                      <div className="pt-4 border-t border-slate-700">
                        <Label className="mb-2">Alınan İlaçlar</Label>
                        <div className="flex flex-wrap gap-2">
                          {summary.medications_taken.map((med, index) => (
                            <span
                              key={index}
                              className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm flex items-center gap-1"
                            >
                              <Pill className="h-3 w-3" />
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      İptal
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Stats - Quick View */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Footprints className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-slate-400">Adım</p>
                </div>
                <p className="text-xl font-bold text-slate-200">
                  {summary.total_steps.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Droplet className="h-4 w-4 text-cyan-500" />
                  <p className="text-xs text-slate-400">Su</p>
                </div>
                <p className="text-xl font-bold text-slate-200">
                  {summary.total_water_ml.toLocaleString()} ml
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Utensils className="h-4 w-4 text-orange-500" />
                  <p className="text-xs text-slate-400">Kalori</p>
                </div>
                <p className="text-xl font-bold text-slate-200">
                  {summary.total_calories.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <p className="text-xs text-slate-400">Egzersiz</p>
                </div>
                <p className="text-xl font-bold text-slate-200">
                  {summary.total_exercise_minutes} dk
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summary.sleep_hours && (
                <div className="p-3 bg-slate-800/50 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon className="h-4 w-4 text-blue-500" />
                    <p className="text-xs text-slate-400">Uyku</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-200">
                    {summary.sleep_hours.toFixed(1)} saat
                  </p>
                  {summary.sleep_quality && (
                    <p className="text-xs text-slate-400 capitalize">{summary.sleep_quality}</p>
                  )}
                </div>
              )}
              {summary.avg_heart_rate && (
                <div className="p-3 bg-slate-800/50 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <p className="text-xs text-slate-400">Nabız</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-200">
                    {summary.avg_heart_rate} BPM
                  </p>
                </div>
              )}
              {summary.avg_energy_level !== null && (
                <div className="p-3 bg-slate-800/50 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Battery className="h-4 w-4 text-yellow-500" />
                    <p className="text-xs text-slate-400">Enerji</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-200">
                    {summary.avg_energy_level.toFixed(1)}/10
                  </p>
                </div>
              )}
              {summary.avg_stress_level !== null && (
                <div className="p-3 bg-slate-800/50 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-xs text-slate-400">Stres</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-200">
                    {summary.avg_stress_level.toFixed(1)}/10
                  </p>
                </div>
              )}
            </div>

            {/* Ongoing Conditions */}
            {summary.ongoing_conditions && summary.ongoing_conditions.length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Devam Eden Durumlar</p>
                <div className="flex flex-wrap gap-2">
                  {summary.ongoing_conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-sm"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Wellness Score */}
            {summary.overall_wellness_score !== null && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Genel Sağlık Skoru</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(summary.overall_wellness_score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-slate-200">
                    {summary.overall_wellness_score}/10
                  </span>
                </div>
              </div>
            )}

            {/* Notes Preview */}
            {summary.notes && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Notlar</p>
                <p className="text-slate-300 text-sm line-clamp-2">{summary.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

