"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Timer, Focus, TrendingUp, Clock } from "lucide-react"
import { getWeeklyProductivityData, getMonthlyProductivityData } from "@/app/actions-productivity"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface ProductivityReportsProps {
  todayPomodoro: number
  todayFocus: number
  todayTotal: number
}

export function ProductivityReports({ todayPomodoro, todayFocus, todayTotal }: ProductivityReportsProps) {
  const router = useRouter()
  const [weeklyData, setWeeklyData] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastDate, setLastDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Check for new day and refresh data
  useEffect(() => {
    const checkNewDay = () => {
      const now = new Date()
      const todayStr = format(now, 'yyyy-MM-dd')
      
      if (todayStr !== lastDate) {
        setLastDate(todayStr)
        router.refresh()
      }
    }

    checkNewDay()
    const interval = setInterval(checkNewDay, 60000)
    return () => clearInterval(interval)
  }, [lastDate, router])

  // Load weekly and monthly data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [weekly, monthly] = await Promise.all([
          getWeeklyProductivityData(),
          getMonthlyProductivityData(),
        ])
        setWeeklyData(weekly)
        setMonthlyData(monthly)
      } catch (error) {
        console.error("Error loading productivity data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardContent className="py-8 text-center text-slate-400">
          Yükleniyor...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <TrendingUp className="h-5 w-5 text-[#60a5fa]" />
          Raporlar ve İstatistikler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="daily" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
              Günlük
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
              Haftalık
            </TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
              Aylık
            </TabsTrigger>
          </TabsList>

          {/* Daily View */}
          <TabsContent value="daily" className="mt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-slate-700/50 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Timer className="h-4 w-4 text-red-500" />
                    Pomodoro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-200">
                    {todayPomodoro} dk
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Bugünkü toplam</p>
                </CardContent>
              </Card>

              <Card className="border-slate-700/50 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Focus className="h-4 w-4 text-blue-500" />
                    Odaklanma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-200">
                    {todayFocus} dk
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Bugünkü toplam</p>
                </CardContent>
              </Card>

              <Card className="border-slate-700/50 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    Toplam Çalışma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-200">
                    {todayTotal} dk
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {Math.floor(todayTotal / 60)}s {todayTotal % 60}dk
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Weekly View */}
          <TabsContent value="weekly" className="mt-6">
            {weeklyData ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Ortalama Pomodoro</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.round(weeklyData.averages.pomodoroMinutes)} dk/gün
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {weeklyData.totals.pomodoroSessions} seans
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Ortalama Odaklanma</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.round(weeklyData.averages.focusMinutes)} dk/gün
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {weeklyData.totals.focusSessions} seans
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Toplam Çalışma</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.floor(weeklyData.totals.totalMinutes / 60)}s {weeklyData.totals.totalMinutes % 60}dk
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Bu hafta</div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Günlük Ortalama</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.round(weeklyData.averages.pomodoroMinutes + weeklyData.averages.focusMinutes)} dk
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Çalışma süresi</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Pomodoro Seansları</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData.pomodoro}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="sessions" fill="#ef4444" name="Seans" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Odaklanma Seansları</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData.focus}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="sessions" fill="#3b82f6" name="Seans" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Günlük Toplam Çalışma Süresi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={weeklyData.total}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="minutes" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Dakika" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Haftalık veri bulunamadı
              </div>
            )}
          </TabsContent>

          {/* Monthly View */}
          <TabsContent value="monthly" className="mt-6">
            {monthlyData ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Toplam Pomodoro</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.floor(monthlyData.totals.pomodoroMinutes / 60)}s {monthlyData.totals.pomodoroMinutes % 60}dk
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {monthlyData.totals.pomodoroSessions} seans
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Toplam Odaklanma</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.floor(monthlyData.totals.focusMinutes / 60)}s {monthlyData.totals.focusMinutes % 60}dk
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {monthlyData.totals.focusSessions} seans
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Toplam Çalışma</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.floor(monthlyData.totals.totalMinutes / 60)}s {monthlyData.totals.totalMinutes % 60}dk
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Bu ay
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Günlük Ortalama</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.round(monthlyData.averages.pomodoroMinutes + monthlyData.averages.focusMinutes)} dk
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Çalışma süresi
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Haftalık Pomodoro Süresi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData.pomodoro}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="week" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="minutes" fill="#ef4444" name="Dakika" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Haftalık Odaklanma Süresi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData.focus}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="week" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="minutes" fill="#3b82f6" name="Dakika" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Haftalık Toplam Çalışma Süresi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={monthlyData.total}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="week" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="minutes" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Dakika" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Aylık veri bulunamadı
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

