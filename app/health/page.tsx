import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartRateForm } from "@/components/health/heart-rate-form"
import { SleepForm } from "@/components/health/sleep-form"
import { WaterForm } from "@/components/health/water-form"
import { NutritionForm } from "@/components/health/nutrition-form"
import { SmokingForm } from "@/components/health/smoking-form"
import { StepsForm } from "@/components/health/steps-form"
import { ExerciseForm } from "@/components/health/exercise-form"
import { AlcoholForm } from "@/components/health/alcohol-form"
import { CaffeineForm } from "@/components/health/caffeine-form"
import { EnergyForm } from "@/components/health/energy-form"
import { StressForm } from "@/components/health/stress-form"
import { MedicationForm } from "@/components/health/medication-form"
import { PainForm } from "@/components/health/pain-form"
import { WeeklyAnalysis } from "@/components/health/weekly-analysis"
import { Heart, Moon, Droplet, Utensils, Cigarette, Footprints, Activity, Wine, Coffee, Battery, AlertTriangle, Pill, AlertCircle } from "lucide-react"
import { getCurrentISODate } from "@/lib/date-utils"
import {
  getSmokingLogs,
  getStepsLogs,
  getExerciseLogs,
  getAlcoholLogs,
  getCaffeineLogs,
  getWaterLogs,
  getSleepLogs,
  getEnergyLogs,
  getStressLogs,
} from "@/app/actions-health"

export const dynamic = 'force-dynamic'

export default async function HealthPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch today's data
  const today = getCurrentISODate()
  
  // Fetch all health data for today
  const [
    todayHeartRate,
    todaySleep,
    todayWater,
    todayNutrition,
    todaySmoking,
    todaySteps,
    todayExercise,
    todayAlcohol,
    todayCaffeine,
    todayEnergy,
    todayStress,
  ] = await Promise.all([
    // Heart Rate - get latest
    supabase
      .from("health_metrics")
      .select("heart_rate")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') console.error("Heart rate fetch error:", error)
        return data?.heart_rate || null
      }),
    
    // Sleep - get today's
    supabase
      .from("sleep_logs")
      .select("sleep_duration")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') console.error("Sleep fetch error:", error)
        return data?.sleep_duration || null
      }),
    
    // Water - sum today's
    supabase
      .from("water_intake")
      .select("amount_ml")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => data?.reduce((sum, log) => sum + (log.amount_ml || 0), 0) || 0),
    
    // Nutrition - sum today's calories
    supabase
      .from("nutrition_logs")
      .select("calories")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => data?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0),
    
    // Smoking - sum today's
    supabase
      .from("smoking_logs")
      .select("cigarettes_count")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => data?.reduce((sum, log) => sum + (log.cigarettes_count || 0), 0) || 0),
    
    // Steps - get today's
    supabase
      .from("steps_logs")
      .select("steps_count")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') console.error("Steps fetch error:", error)
        return data?.steps_count || null
      }),
    
    // Exercise - sum today's duration
    supabase
      .from("exercise_logs")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => data?.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) || 0),
    
    // Alcohol - count today's
    supabase
      .from("alcohol_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => data?.length || 0),
    
    // Caffeine - sum today's
    supabase
      .from("caffeine_logs")
      .select("caffeine_mg")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => data?.reduce((sum, log) => sum + (log.caffeine_mg || 0), 0) || 0),
    
    // Energy - get today's average
    supabase
      .from("energy_logs")
      .select("energy_level")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => {
        if (!data || data.length === 0) return null
        const sum = data.reduce((acc, log) => acc + (log.energy_level || 0), 0)
        return Math.round((sum / data.length) * 10) / 10
      }),
    
    // Stress - get today's average
    supabase
      .from("stress_logs")
      .select("stress_level")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .then(({ data }) => {
        if (!data || data.length === 0) return null
        const sum = data.reduce((acc, log) => acc + (log.stress_level || 0), 0)
        return Math.round((sum / data.length) * 10) / 10
      }),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
            {tr.health.title}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Sağlık metriklerinizi takip edin ve analiz edin
          </p>
        </div>

        <div className="space-y-8">
          {/* Temel Sağlık Metrikleri */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Temel Metrikler</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Heart Rate */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Heart className="h-5 w-5 text-red-500" />
                    {tr.health.heartRate}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todayHeartRate ? todayHeartRate : "--"}
                  </p>
                  <p className="text-sm text-slate-400">BPM</p>
                  <div className="mt-4">
                    <HeartRateForm />
                  </div>
                </CardContent>
              </Card>

              {/* Sleep */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Moon className="h-5 w-5 text-blue-500" />
                    {tr.health.sleep}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todaySleep ? `${todaySleep.toFixed(1)}` : "--"}
                  </p>
                  <p className="text-sm text-slate-400">Saat</p>
                  <div className="mt-4">
                    <SleepForm />
                  </div>
                </CardContent>
              </Card>

              {/* Water */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Droplet className="h-5 w-5 text-cyan-500" />
                    {tr.health.water}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todayWater > 0 ? todayWater.toLocaleString() : "--"}
                  </p>
                  <p className="text-sm text-slate-400">ml</p>
                  <div className="mt-4">
                    <WaterForm />
                  </div>
                </CardContent>
              </Card>

              {/* Calories */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Utensils className="h-5 w-5 text-orange-500" />
                    {tr.health.calories}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todayNutrition > 0 ? todayNutrition.toLocaleString() : "--"}
                  </p>
                  <p className="text-sm text-slate-400">kcal</p>
                  <div className="mt-4">
                    <NutritionForm />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Aktivite & Fitness */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Aktivite & Fitness</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Steps */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Footprints className="h-5 w-5 text-green-500" />
                    Adım Sayısı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todaySteps ? todaySteps.toLocaleString() : "--"}
                  </p>
                  <p className="text-sm text-slate-400">Adım</p>
                  <div className="mt-4">
                    <StepsForm />
                  </div>
                </CardContent>
              </Card>

              {/* Exercise */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Egzersiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todayExercise > 0 ? todayExercise : "--"}
                  </p>
                  <p className="text-sm text-slate-400">Dakika</p>
                  <div className="mt-4">
                    <ExerciseForm />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Madde Kullanımı */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Madde Kullanımı</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Smoking */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Cigarette className="h-5 w-5 text-orange-500" />
                    Sigara
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todaySmoking > 0 ? todaySmoking : "--"}
                  </p>
                  <p className="text-sm text-slate-400">Adet/Gün</p>
                  <div className="mt-4">
                    <SmokingForm />
                  </div>
                </CardContent>
              </Card>

              {/* Alcohol */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Wine className="h-5 w-5 text-amber-500" />
                    Alkol
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todayAlcohol > 0 ? todayAlcohol : "--"}
                  </p>
                  <p className="text-sm text-slate-400">İçecek/Gün</p>
                  <div className="mt-4">
                    <AlcoholForm />
                  </div>
                </CardContent>
              </Card>

              {/* Caffeine */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Coffee className="h-5 w-5 text-amber-600" />
                    Kafein
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todayCaffeine > 0 ? Math.round(todayCaffeine) : "--"}
                  </p>
                  <p className="text-sm text-slate-400">mg/Gün</p>
                  <div className="mt-4">
                    <CaffeineForm />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Wellness & Vitality */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Wellness & Vitality</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Energy */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Battery className="h-5 w-5 text-yellow-500" />
                    Enerji Seviyesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todayEnergy !== null ? todayEnergy.toFixed(1) : "--"}
                  </p>
                  <p className="text-sm text-slate-400">1-10 Arası</p>
                  <div className="mt-4">
                    <EnergyForm />
                  </div>
                </CardContent>
              </Card>

              {/* Stress */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Stres Seviyesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">
                    {todayStress !== null ? todayStress.toFixed(1) : "--"}
                  </p>
                  <p className="text-sm text-slate-400">1-10 Arası</p>
                  <div className="mt-4">
                    <StressForm />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sağlık & Tıbbi */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Sağlık & Tıbbi</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Medication */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Pill className="h-5 w-5 text-blue-500" />
                    İlaç Takibi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">--</p>
                  <p className="text-sm text-slate-400">İlaç Sayısı</p>
                  <div className="mt-4">
                    <MedicationForm />
                  </div>
                </CardContent>
              </Card>

              {/* Pain */}
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Ağrı Takibi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-200">--</p>
                  <p className="text-sm text-slate-400">0-10 Arası</p>
                  <div className="mt-4">
                    <PainForm />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Haftalık Analiz */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Haftalık Analiz</h2>
            <WeeklyAnalysis />
          </div>
        </div>
      </div>
    </div>
  )
}

