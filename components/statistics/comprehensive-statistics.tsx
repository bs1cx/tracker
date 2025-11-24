"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Activity,
  Brain,
  Timer,
  Wallet,
  TrendingUp,
  Target,
  Flame,
  Calendar,
  Heart,
  Droplet,
  Footprints,
  Dumbbell,
  Smile,
  Sparkles,
  Focus,
  CheckCircle2,
} from "lucide-react"
import { getAllStatistics, getHabitStreaks } from "@/app/actions-statistics"

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b']

// Calculate health score (0-100)
function calculateHealthScore(health: any) {
  if (!health) return 0
  let score = 0
  
  // Sleep: 30 points (8 hours = 30 points)
  const sleepScore = Math.min(30, (health.totalSleep || 0) / 8 * 30)
  score += sleepScore
  
  // Water: 20 points (2L = 20 points)
  const waterScore = Math.min(20, (health.totalWater || 0) / 2000 * 20)
  score += waterScore
  
  // Steps: 25 points (10000 steps = 25 points)
  const stepsScore = Math.min(25, (health.totalSteps || 0) / 10000 * 25)
  score += stepsScore
  
  // Exercise: 25 points (30 min = 25 points)
  const exerciseScore = Math.min(25, (health.totalExercise || 0) / 30 * 25)
  score += exerciseScore
  
  return Math.round(score)
}

// Calculate mental score (0-100)
function calculateMentalScore(mental: any) {
  if (!mental) return 0
  let score = 0
  
  // Mood: 40 points (10 = 40 points)
  const moodScore = (mental.avgMood || 0) / 10 * 40
  score += moodScore
  
  // Motivation: 30 points (10 = 30 points)
  const motivationScore = (mental.avgMotivation || 0) / 10 * 30
  score += motivationScore
  
  // Meditation: 20 points (30 min = 20 points)
  const meditationScore = Math.min(20, (mental.totalMeditation || 0) / 30 * 20)
  score += meditationScore
  
  // Journal: 10 points (1 entry = 10 points, max 10)
  const journalScore = Math.min(10, (mental.journalCount || 0) * 10)
  score += journalScore
  
  return Math.round(score)
}

// Calculate overall score
function calculateOverallScore(stats: any) {
  if (!stats) return 0
  const healthScore = calculateHealthScore(stats.health?.month)
  const mentalScore = calculateMentalScore(stats.mental?.month)
  const productivityScore = Math.min(100, ((stats.productivity?.month?.totalPomodoro || 0) + (stats.productivity?.month?.totalFocus || 0)) / 60 * 2)
  const financeScore = (stats.finance?.month?.balance || 0) > 0 ? 100 : Math.max(0, 100 + (stats.finance?.month?.balance || 0) / 100)
  
  return Math.round((healthScore * 0.3 + mentalScore * 0.3 + productivityScore * 0.2 + financeScore * 0.2))
}

export function ComprehensiveStatistics() {
  const [stats, setStats] = useState<any>(null)
  const [streaks, setStreaks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadData()
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [statisticsData, streaksData] = await Promise.all([
        getAllStatistics(),
        getHabitStreaks(),
      ])
      setStats(statisticsData)
      setStreaks(streaksData)
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-slate-400">
          İstatistikler yükleniyor...
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-slate-400">
          Veri yüklenemedi
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const timeComparisonData = [
    {
      period: "Bugün",
      health: (stats.health?.today?.totalSleep || 0) + (stats.health?.today?.totalWater || 0) / 1000,
      mental: (stats.mental?.today?.avgMood || 0) + (stats.mental?.today?.avgMotivation || 0),
      productivity: (stats.productivity?.today?.totalPomodoro || 0) + (stats.productivity?.today?.totalFocus || 0),
      finance: stats.finance?.today?.balance || 0,
    },
    {
      period: "Bu Hafta",
      health: (stats.health?.week?.totalSleep || 0) + (stats.health?.week?.totalWater || 0) / 1000,
      mental: (stats.mental?.week?.avgMood || 0) + (stats.mental?.week?.avgMotivation || 0),
      productivity: (stats.productivity?.week?.totalPomodoro || 0) + (stats.productivity?.week?.totalFocus || 0),
      finance: stats.finance?.week?.balance || 0,
    },
    {
      period: "Bu Ay",
      health: (stats.health?.month?.totalSleep || 0) + (stats.health?.month?.totalWater || 0) / 1000,
      mental: (stats.mental?.month?.avgMood || 0) + (stats.mental?.month?.avgMotivation || 0),
      productivity: (stats.productivity?.month?.totalPomodoro || 0) + (stats.productivity?.month?.totalFocus || 0),
      finance: stats.finance?.month?.balance || 0,
    },
  ]

  const moduleDistributionData = [
    { name: "Sağlık", value: stats.health?.month?.count || 0, color: "#ef4444" },
    { name: "Mental", value: stats.mental?.month?.journalCount || 0, color: "#a855f7" },
    { name: "Verimlilik", value: stats.productivity?.month?.completedPomodoros || 0, color: "#3b82f6" },
    { name: "Finans", value: (stats.finance?.month?.expenseCount || 0) + (stats.finance?.month?.incomeCount || 0), color: "#22c55e" },
  ]

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="health" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
            Sağlık
          </TabsTrigger>
          <TabsTrigger value="mental" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
            Mental
          </TabsTrigger>
          <TabsTrigger value="productivity" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
            Verimlilik
          </TabsTrigger>
          <TabsTrigger value="finance" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
            Finans
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Toplam Görev</p>
                    <p className="text-2xl font-bold text-slate-200">{stats.trackables?.total || 0}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {stats.trackables?.completed || 0} tamamlandı
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Aktif Alışkanlık</p>
                    <p className="text-2xl font-bold text-slate-200">{stats.trackables?.dailyHabits || 0}</p>
                  </div>
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {streaks.length > 0 ? `En uzun seri: ${Math.max(...streaks.map(s => s.currentStreak || 0))} gün` : "Seri yok"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Aylık Bakiye</p>
                    <p className={`text-2xl font-bold ${(stats.finance?.month?.balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₺{(stats.finance?.month?.balance || 0).toFixed(2)}
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {stats.finance?.month?.expenseCount || 0} harcama, {stats.finance?.month?.incomeCount || 0} gelir
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Toplam Çalışma</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {Math.floor(((stats.productivity?.month?.totalPomodoro || 0) + (stats.productivity?.month?.totalFocus || 0)) / 60)}s
                    </p>
                  </div>
                  <Timer className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {stats.productivity?.month?.completedPomodoros || 0} pomodoro
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Chart */}
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Zaman Karşılaştırması</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="period" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="health" fill="#ef4444" name="Sağlık" />
                  <Bar dataKey="mental" fill="#a855f7" name="Mental" />
                  <Bar dataKey="productivity" fill="#3b82f6" name="Verimlilik" />
                  <Bar dataKey="finance" fill="#22c55e" name="Finans" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Module Distribution */}
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Modül Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moduleDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moduleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Habit Streaks */}
          {streaks.length > 0 && (
            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Alışkanlık Serileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {streaks.slice(0, 5).map((streak) => (
                    <div key={streak.id} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg bg-slate-800/50">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200">{streak.title}</p>
                        <p className="text-sm text-slate-400">
                          {streak.totalCompletions} tamamlanma
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-500">{streak.currentStreak || 0} 🔥</p>
                        <p className="text-xs text-slate-500">En uzun: {streak.longestStreak || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Wellness Score */}
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Genel Sağlık Skoru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">Fiziksel Sağlık</p>
                  <p className="text-3xl font-bold text-blue-500">
                    {calculateHealthScore(stats.health?.month)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">/100</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">Mental Sağlık</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {calculateMentalScore(stats.mental?.month)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">/100</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">Genel Skor</p>
                  <p className="text-3xl font-bold text-green-500">
                    {calculateOverallScore(stats)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Uyku (Ay)</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {(stats.health?.month?.totalSleep || 0).toFixed(1)}s
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ortalama: {((stats.health?.month?.totalSleep || 0) / 30).toFixed(1)}s/gün
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Su (Ay)</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {Math.floor((stats.health?.month?.totalWater || 0) / 1000)}L
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ortalama: {Math.floor((stats.health?.month?.totalWater || 0) / 30 / 1000)}L/gün
                    </p>
                  </div>
                  <Droplet className="h-8 w-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Adım (Ay)</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {(stats.health?.month?.totalSteps || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ortalama: {Math.floor((stats.health?.month?.totalSteps || 0) / 30).toLocaleString()}/gün
                    </p>
                  </div>
                  <Footprints className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Egzersiz (Ay)</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {Math.floor((stats.health?.month?.totalExercise || 0) / 60)}s
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ortalama: {Math.floor((stats.health?.month?.totalExercise || 0) / 30)}dk/gün
                    </p>
                  </div>
                  <Dumbbell className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Comparison Chart */}
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Sağlık Metrikleri Karşılaştırması</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { period: "Bugün", uyku: stats.health?.today?.totalSleep || 0, su: (stats.health?.today?.totalWater || 0) / 1000, adım: (stats.health?.today?.totalSteps || 0) / 1000, egzersiz: (stats.health?.today?.totalExercise || 0) / 60 },
                  { period: "Bu Hafta", uyku: (stats.health?.week?.totalSleep || 0) / 7, su: (stats.health?.week?.totalWater || 0) / 7 / 1000, adım: (stats.health?.week?.totalSteps || 0) / 7 / 1000, egzersiz: (stats.health?.week?.totalExercise || 0) / 7 / 60 },
                  { period: "Bu Ay", uyku: (stats.health?.month?.totalSleep || 0) / 30, su: (stats.health?.month?.totalWater || 0) / 30 / 1000, adım: (stats.health?.month?.totalSteps || 0) / 30 / 1000, egzersiz: (stats.health?.month?.totalExercise || 0) / 30 / 60 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="period" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="uyku" fill="#3b82f6" name="Uyku (saat)" />
                  <Bar dataKey="su" fill="#06b6d4" name="Su (L)" />
                  <Bar dataKey="adım" fill="#22c55e" name="Adım (bin)" />
                  <Bar dataKey="egzersiz" fill="#ef4444" name="Egzersiz (saat)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mental Tab */}
        <TabsContent value="mental" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Ortalama Ruh Hali</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {(stats.mental?.month?.avgMood || 0) > 0 ? (stats.mental.month.avgMood).toFixed(1) : "--"}/10
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Bu ay
                    </p>
                  </div>
                  <Smile className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Ortalama Motivasyon</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {(stats.mental?.month?.avgMotivation || 0) > 0 ? (stats.mental.month.avgMotivation).toFixed(1) : "--"}/10
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Bu ay
                    </p>
                  </div>
                  <Sparkles className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Meditasyon (Ay)</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {Math.floor((stats.mental?.month?.totalMeditation || 0) / 60)}s
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ortalama: {Math.floor((stats.mental?.month?.totalMeditation || 0) / 30)}dk/gün
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Günlük Girişi</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {stats.mental?.month?.journalCount || 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Bu ay
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mental Trends Chart */}
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Mental Sağlık Trendleri</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { period: "Bugün", ruhHali: stats.mental?.today?.avgMood || 0, motivasyon: stats.mental?.today?.avgMotivation || 0 },
                  { period: "Bu Hafta", ruhHali: stats.mental?.week?.avgMood || 0, motivasyon: stats.mental?.week?.avgMotivation || 0 },
                  { period: "Bu Ay", ruhHali: stats.mental?.month?.avgMood || 0, motivasyon: stats.mental?.month?.avgMotivation || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="period" stroke="#94a3b8" />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="ruhHali" stroke="#fbbf24" strokeWidth={2} name="Ruh Hali" />
                  <Line type="monotone" dataKey="motivasyon" stroke="#a855f7" strokeWidth={2} name="Motivasyon" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Productivity Tab */}
        <TabsContent value="productivity" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Pomodoro (Ay)</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {Math.floor((stats.productivity?.month?.totalPomodoro || 0) / 60)}s
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {stats.productivity?.month?.completedPomodoros || 0} seans
                    </p>
                  </div>
                  <Timer className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Odaklanma (Ay)</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {Math.floor((stats.productivity?.month?.totalFocus || 0) / 60)}s
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ortalama: {Math.floor((stats.productivity?.month?.totalFocus || 0) / 30)}dk/gün
                    </p>
                  </div>
                  <Focus className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Aktif Hedef</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {stats.productivity?.today?.activeGoals || 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Devam eden
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Toplam Çalışma</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {Math.floor(((stats.productivity?.month?.totalPomodoro || 0) + (stats.productivity?.month?.totalFocus || 0)) / 60)}s
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Bu ay
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Comparison Chart */}
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Verimlilik Karşılaştırması</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { period: "Bugün", pomodoro: stats.productivity?.today?.totalPomodoro || 0, odaklanma: stats.productivity?.today?.totalFocus || 0 },
                  { period: "Bu Hafta", pomodoro: (stats.productivity?.week?.totalPomodoro || 0) / 7, odaklanma: (stats.productivity?.week?.totalFocus || 0) / 7 },
                  { period: "Bu Ay", pomodoro: (stats.productivity?.month?.totalPomodoro || 0) / 30, odaklanma: (stats.productivity?.month?.totalFocus || 0) / 30 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="period" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="pomodoro" fill="#ef4444" name="Pomodoro (dk)" />
                  <Bar dataKey="odaklanma" fill="#3b82f6" name="Odaklanma (dk)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Toplam Harcama</p>
                    <p className="text-2xl font-bold text-red-500">
                      ₺{(stats.finance?.month?.totalExpenses || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ortalama: ₺{((stats.finance?.month?.totalExpenses || 0) / 30).toFixed(2)}/gün
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {stats.finance?.month?.expenseCount || 0} işlem
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Toplam Gelir</p>
                    <p className="text-2xl font-bold text-green-500">
                      ₺{(stats.finance?.month?.totalIncome || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ortalama: ₺{((stats.finance?.month?.totalIncome || 0) / 30).toFixed(2)}/gün
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {stats.finance?.month?.incomeCount || 0} işlem
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Bakiye</p>
                    <p className={`text-2xl font-bold ${(stats.finance?.month?.balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₺{(stats.finance?.month?.balance || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Net durum
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Tasarruf Oranı</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {(stats.finance?.month?.totalIncome || 0) > 0
                        ? `${(((stats.finance.month.balance || 0) / stats.finance.month.totalIncome) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Gelir oranı
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Finance Comparison Chart */}
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Finansal Trendler</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { period: "Bugün", harcama: stats.finance?.today?.totalExpenses || 0, gelir: stats.finance?.today?.totalIncome || 0, bakiye: stats.finance?.today?.balance || 0 },
                  { period: "Bu Hafta", harcama: (stats.finance?.week?.totalExpenses || 0) / 7, gelir: (stats.finance?.week?.totalIncome || 0) / 7, bakiye: (stats.finance?.week?.balance || 0) / 7 },
                  { period: "Bu Ay", harcama: (stats.finance?.month?.totalExpenses || 0) / 30, gelir: (stats.finance?.month?.totalIncome || 0) / 30, bakiye: (stats.finance?.month?.balance || 0) / 30 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="period" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    formatter={(value: any) => `₺${Number(value).toFixed(2)}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="harcama" stroke="#ef4444" strokeWidth={2} name="Harcama (günlük)" />
                  <Line type="monotone" dataKey="gelir" stroke="#22c55e" strokeWidth={2} name="Gelir (günlük)" />
                  <Line type="monotone" dataKey="bakiye" stroke="#3b82f6" strokeWidth={2} name="Bakiye (günlük)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

