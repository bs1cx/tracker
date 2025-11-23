"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Smile, Brain, Wind, BookOpen, TrendingUp, Calendar } from "lucide-react"
import { getWeeklyMentalData, getMonthlyMentalData } from "@/app/actions-mental"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface MentalReportsProps {
  todayMood: any
  todayMotivation: any
  todayMeditation: number
  todayJournal: number
}

export function MentalReports({ todayMood, todayMotivation, todayMeditation, todayJournal }: MentalReportsProps) {
  const router = useRouter()
  const [weeklyData, setWeeklyData] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [lastDate, setLastDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Check for new day and refresh data
  useEffect(() => {
    const checkNewDay = () => {
      const now = new Date()
      const todayStr = format(now, 'yyyy-MM-dd')
      
      if (todayStr !== lastDate) {
        setLastDate(todayStr)
        setCurrentDate(now)
        router.refresh()
      }
    }

    // Check immediately
    checkNewDay()

    // Check every minute
    const interval = setInterval(checkNewDay, 60000)

    return () => clearInterval(interval)
  }, [lastDate, router])

  // Load weekly and monthly data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [weekly, monthly] = await Promise.all([
          getWeeklyMentalData(),
          getMonthlyMentalData(),
        ])
        setWeeklyData(weekly)
        setMonthlyData(monthly)
      } catch (error) {
        console.error("Error loading mental health data:", error)
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-slate-700/50 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Smile className="h-4 w-4 text-yellow-500" />
                    Ruh Hali
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-200">
                    {todayMood?.mood_score ? `${todayMood.mood_score}/10` : "--"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {todayMood?.mood_label || "Kayıt yok"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-700/50 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Motivasyon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-200">
                    {todayMotivation?.motivation_score ? `${todayMotivation.motivation_score}/10` : "--"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">/ 10</p>
                </CardContent>
              </Card>

              <Card className="border-slate-700/50 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Wind className="h-4 w-4 text-green-500" />
                    Meditasyon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-200">
                    {todayMeditation > 0 ? `${todayMeditation} dk` : "--"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Toplam süre</p>
                </CardContent>
              </Card>

              <Card className="border-slate-700/50 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    Günlük
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-200">
                    {todayJournal > 0 ? todayJournal : "--"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Giriş sayısı</p>
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
                      <div className="text-sm text-slate-400">Ortalama Ruh Hali</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {weeklyData.averages.mood ? weeklyData.averages.mood.toFixed(1) : "--"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Ortalama Motivasyon</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {weeklyData.averages.motivation ? weeklyData.averages.motivation.toFixed(1) : "--"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Toplam Meditasyon</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.round(weeklyData.averages.meditation * 7)} dk
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Toplam Günlük</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {Math.round(weeklyData.averages.journal * 7)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Ruh Hali Trendi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={weeklyData.mood}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis domain={[0, 10]} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Motivasyon Trendi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={weeklyData.motivation}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis domain={[0, 10]} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Meditasyon Süresi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData.meditation}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Günlük Girişleri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData.journal}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#6366f1" />
                        </BarChart>
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
                      <div className="text-sm text-slate-400">Ortalama Ruh Hali</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {monthlyData.averages.mood ? monthlyData.averages.mood.toFixed(1) : "--"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {monthlyData.totals.mood} kayıt
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Ortalama Motivasyon</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {monthlyData.averages.motivation ? monthlyData.averages.motivation.toFixed(1) : "--"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {monthlyData.totals.motivation} kayıt
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Toplam Meditasyon</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {monthlyData.totals.meditation} dk
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Ortalama: {Math.round(monthlyData.averages.meditation)} dk/gün
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardContent className="pt-4">
                      <div className="text-sm text-slate-400">Toplam Günlük</div>
                      <div className="text-2xl font-bold text-slate-200">
                        {monthlyData.totals.journal}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Ortalama: {monthlyData.averages.journal.toFixed(1)}/gün
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Haftalık Ruh Hali Ortalaması</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData.mood}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="week" stroke="#94a3b8" />
                          <YAxis domain={[0, 10]} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#fbbf24" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Haftalık Motivasyon Ortalaması</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData.motivation}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="week" stroke="#94a3b8" />
                          <YAxis domain={[0, 10]} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#a855f7" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Haftalık Meditasyon Süresi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData.meditation}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="week" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/50 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-300">Haftalık Günlük Girişleri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData.journal}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="week" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#6366f1" />
                        </BarChart>
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

