"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { 
  getSmokingLogs, 
  getStepsLogs, 
  getExerciseLogs, 
  getAlcoholLogs, 
  getCaffeineLogs,
  getEnergyLogs,
  getStressLogs,
  getWaterLogs,
  getSleepLogs,
} from "@/app/actions-health"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { 
  Cigarette, 
  Footprints, 
  Activity, 
  Wine, 
  Coffee, 
  Battery, 
  AlertTriangle,
  Droplet,
  Moon,
} from "lucide-react"

interface WeeklyAnalysisProps {
  selectedDate?: Date
}

const COLORS = {
  smoking: "#f97316",
  steps: "#22c55e",
  exercise: "#a855f7",
  alcohol: "#fbbf24",
  caffeine: "#d97706",
  energy: "#eab308",
  stress: "#ef4444",
  water: "#06b6d4",
  sleep: "#3b82f6",
}

export function WeeklyAnalysis({ selectedDate = new Date() }: WeeklyAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [weekData, setWeekData] = useState<any>(null)
  const [cacheKey, setCacheKey] = useState<string>("")

  useEffect(() => {
    const fetchWeekData = async () => {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
      const newCacheKey = `${weekStart.toISOString()}-${weekEnd.toISOString()}`
      
      // Check cache first to avoid unnecessary re-fetches
      if (cacheKey === newCacheKey && weekData) {
        return
      }
      
      setLoading(true)
      setCacheKey(newCacheKey)
      
      try {
        // Fetch logs in parallel (optimized: only fetch what's needed)
        const [
          smokingLogs,
          stepsLogs,
          exerciseLogs,
          alcoholLogs,
          caffeineLogs,
          energyLogs,
          stressLogs,
          waterLogs,
          sleepLogs,
        ] = await Promise.all([
          getSmokingLogs(),
          getStepsLogs(),
          getExerciseLogs(),
          getAlcoholLogs(),
          getCaffeineLogs(),
          getEnergyLogs(),
          getStressLogs(),
          getWaterLogs(),
          getSleepLogs(),
        ])

        // Filter logs for this week
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
        
        const filterByWeek = (logs: any[]) => {
          return logs.filter((log) => {
            const logDate = new Date(log.log_date || log.created_at)
            return weekDays.some((day) => isSameDay(logDate, day))
          })
        }

        // Calculate totals
        const smokingTotal = filterByWeek(smokingLogs).reduce(
          (sum, log) => sum + (log.cigarettes_count || 0),
          0
        )
        const stepsTotal = filterByWeek(stepsLogs).reduce(
          (sum, log) => sum + (log.steps_count || 0),
          0
        )
        const exerciseTotal = filterByWeek(exerciseLogs).reduce(
          (sum, log) => sum + (log.duration_minutes || 0),
          0
        )
        const alcoholTotal = filterByWeek(alcoholLogs).length
        const caffeineTotal = filterByWeek(caffeineLogs).reduce(
          (sum, log) => sum + (log.caffeine_mg || 0),
          0
        )
        const energyAvg = filterByWeek(energyLogs).length > 0
          ? filterByWeek(energyLogs).reduce(
              (sum, log) => sum + (log.energy_level || 0),
              0
            ) / filterByWeek(energyLogs).length
          : 0
        const stressAvg = filterByWeek(stressLogs).length > 0
          ? filterByWeek(stressLogs).reduce(
              (sum, log) => sum + (log.stress_level || 0),
              0
            ) / filterByWeek(stressLogs).length
          : 0
        const waterTotal = filterByWeek(waterLogs).reduce(
          (sum, log) => sum + (log.amount_ml || 0),
          0
        )
        const sleepAvg = filterByWeek(sleepLogs).length > 0
          ? filterByWeek(sleepLogs).reduce(
              (sum, log) => sum + (log.sleep_duration || 0),
              0
            ) / filterByWeek(sleepLogs).length
          : 0

        setWeekData({
          smoking: smokingTotal,
          steps: stepsTotal,
          exercise: exerciseTotal,
          alcohol: alcoholTotal,
          caffeine: caffeineTotal,
          energy: Math.round(energyAvg * 10) / 10,
          stress: Math.round(stressAvg * 10) / 10,
          water: waterTotal,
          sleep: Math.round(sleepAvg * 10) / 10,
        })
      } catch (error) {
        console.error("Error fetching week data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeekData()
    
    // Listen for health data updates
    const handleHealthUpdate = () => {
      fetchWeekData()
    }
    
    window.addEventListener('healthDataUpdated', handleHealthUpdate)
    
    // Also refresh periodically
    const interval = setInterval(() => {
      fetchWeekData()
    }, 5000) // Refresh every 5 seconds
    
    return () => {
      window.removeEventListener('healthDataUpdated', handleHealthUpdate)
      clearInterval(interval)
    }
  }, [selectedDate])

  if (loading) {
    return (
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-slate-400 text-center">Yükleniyor...</p>
        </CardContent>
      </Card>
    )
  }

  if (!weekData) {
    return null
  }

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })

  // Prepare data for pie charts
  const activityData = [
    { name: "Adım", value: weekData.steps, color: COLORS.steps },
    { name: "Egzersiz (dk)", value: weekData.exercise, color: COLORS.exercise },
  ].filter((item) => item.value > 0)

  const substanceData = [
    { name: "Sigara", value: weekData.smoking, color: COLORS.smoking },
    { name: "Alkol", value: weekData.alcohol, color: COLORS.alcohol },
    { name: "Kafein (mg)", value: weekData.caffeine, color: COLORS.caffeine },
  ].filter((item) => item.value > 0)

  const wellnessData = [
    { name: "Enerji", value: weekData.energy, color: COLORS.energy },
    { name: "Stres", value: weekData.stress, color: COLORS.stress },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">
            Haftalık Analiz ({format(weekStart, "d MMM", { locale: tr })} - {format(weekEnd, "d MMM yyyy", { locale: tr })})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            {activityData.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Aktivite
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Substance Chart */}
            {substanceData.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Cigarette className="h-4 w-4" />
                  Madde Kullanımı
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={substanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {substanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Wellness Chart */}
            {wellnessData.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Battery className="h-4 w-4" />
                  Wellness
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={wellnessData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {wellnessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-1">
                <Cigarette className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-slate-400">Sigara</span>
              </div>
              <p className="text-xl font-bold text-slate-200">{weekData.smoking}</p>
              <p className="text-xs text-slate-500">Adet</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-1">
                <Footprints className="h-4 w-4 text-green-500" />
                <span className="text-xs text-slate-400">Adım</span>
              </div>
              <p className="text-xl font-bold text-slate-200">{weekData.steps.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Adım</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-slate-400">Egzersiz</span>
              </div>
              <p className="text-xl font-bold text-slate-200">{weekData.exercise}</p>
              <p className="text-xs text-slate-500">Dakika</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="h-4 w-4 text-cyan-500" />
                <span className="text-xs text-slate-400">Su</span>
              </div>
              <p className="text-xl font-bold text-slate-200">{weekData.water}</p>
              <p className="text-xs text-slate-500">ml</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-1">
                <Moon className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-slate-400">Uyku</span>
              </div>
              <p className="text-xl font-bold text-slate-200">{weekData.sleep.toFixed(1)}</p>
              <p className="text-xs text-slate-500">Saat</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

