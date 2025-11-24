"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react"
import { getMonthlyFinanceSummary, getWeeklyFinanceData } from "@/app/actions-finance"
import { format } from "date-fns"

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b']

interface FinanceReportsProps {
  monthlySummary: any
}

export function FinanceReports({ monthlySummary: initialSummary }: FinanceReportsProps) {
  const router = useRouter()
  const [monthlySummary, setMonthlySummary] = useState(initialSummary)
  const [weeklyData, setWeeklyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Load all finance data
  const loadFinanceData = async () => {
    setLoading(true)
    try {
      const [monthly, weekly] = await Promise.all([
        getMonthlyFinanceSummary(),
        getWeeklyFinanceData(),
      ])
      setMonthlySummary(monthly)
      setWeeklyData(weekly)
    } catch (error) {
      console.error("Error loading finance data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadFinanceData()
  }, [])

  // Listen for finance data updates (when forms are submitted)
  useEffect(() => {
    const handleFinanceUpdate = () => {
      loadFinanceData()
    }

    // Listen for custom event
    window.addEventListener('financeDataUpdated', handleFinanceUpdate)
    
    // Also listen for router refresh
    const interval = setInterval(() => {
      loadFinanceData()
    }, 5000) // Refresh every 5 seconds

    return () => {
      window.removeEventListener('financeDataUpdated', handleFinanceUpdate)
      clearInterval(interval)
    }
  }, [])

  // Prepare pie chart data for expenses
  const expensePieData = monthlySummary?.expensesByCategory
    ? Object.entries(monthlySummary.expensesByCategory).map(([name, value]) => ({
        name,
        value: Number(value),
      }))
    : []

  // Prepare pie chart data for income
  const incomePieData = monthlySummary?.incomeBySource
    ? Object.entries(monthlySummary.incomeBySource).map(([name, value]) => ({
        name,
        value: Number(value),
      }))
    : []

  // Prepare weekly chart data
  const weeklyChartData = weeklyData?.dailyData
    ? Object.entries(weeklyData.dailyData).map(([date, data]: [string, any]) => ({
        date: format(new Date(date), "dd/MM"),
        expenses: data.expenses,
        income: data.income,
        balance: data.income - data.expenses,
      }))
    : []

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <BarChart3 className="h-5 w-5 text-[#60a5fa]" />
          Finansal Raporlar ve Analizler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
              Harcamalar
            </TabsTrigger>
            <TabsTrigger value="income" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
              Gelirler
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-slate-700/50 bg-slate-900/50">
                  <CardContent className="pt-4">
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Toplam Harcama
                    </div>
                    <div className="text-2xl font-bold text-slate-200 mt-2">
                      ₺{monthlySummary?.totalExpenses?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {monthlySummary?.expenseCount || 0} işlem
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-700/50 bg-slate-900/50">
                  <CardContent className="pt-4">
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Toplam Gelir
                    </div>
                    <div className="text-2xl font-bold text-slate-200 mt-2">
                      ₺{monthlySummary?.totalIncome?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {monthlySummary?.incomeCount || 0} işlem
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-700/50 bg-slate-900/50">
                  <CardContent className="pt-4">
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-500" />
                      Bakiye
                    </div>
                    <div className={`text-2xl font-bold mt-2 ${(monthlySummary?.balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₺{monthlySummary?.balance?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Net durum
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-700/50 bg-slate-900/50">
                  <CardContent className="pt-4">
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      Tasarruf Oranı
                    </div>
                    <div className="text-2xl font-bold text-slate-200 mt-2">
                      {monthlySummary?.totalIncome > 0
                        ? `${((monthlySummary.balance / monthlySummary.totalIncome) * 100).toFixed(1)}%`
                        : "0%"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Gelir oranı
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Trend Chart */}
              {weeklyChartData.length > 0 && (
                <Card className="border-slate-700/50 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Haftalık Gelir-Gider Trendi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          formatter={(value: any) => `₺${Number(value).toFixed(2)}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Gelir" />
                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Gider" />
                        <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} name="Bakiye" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="mt-6">
            {expensePieData.length > 0 ? (
              <div className="space-y-6">
                <Card className="border-slate-700/50 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Harcama Kategorileri (Dairesel Grafik)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={expensePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          formatter={(value: any) => `₺${Number(value).toFixed(2)}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-700/50 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Kategorilere Göre Harcamalar (Bar Chart)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={expensePieData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          formatter={(value: any) => `₺${Number(value).toFixed(2)}`}
                        />
                        <Bar dataKey="value" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Henüz harcama verisi yok
              </div>
            )}
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="mt-6">
            {incomePieData.length > 0 ? (
              <div className="space-y-6">
                <Card className="border-slate-700/50 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Gelir Kaynakları (Dairesel Grafik)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={incomePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {incomePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          formatter={(value: any) => `₺${Number(value).toFixed(2)}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-700/50 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Kaynaklara Göre Gelirler (Bar Chart)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={incomePieData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          formatter={(value: any) => `₺${Number(value).toFixed(2)}`}
                        />
                        <Bar dataKey="value" fill="#22c55e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Henüz gelir verisi yok
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

