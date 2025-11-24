"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Wallet, BarChart3 } from "lucide-react"
import { getMonthlyFinanceSummary } from "@/app/actions-finance"
import { tr } from "@/lib/i18n"

interface FinanceSummaryCardsProps {
  initialSummary: any
}

export function FinanceSummaryCards({ initialSummary }: FinanceSummaryCardsProps) {
  const [monthlySummary, setMonthlySummary] = useState(initialSummary)
  const [loading, setLoading] = useState(false)

  // Load finance summary
  const loadSummary = async () => {
    setLoading(true)
    try {
      const data = await getMonthlyFinanceSummary()
      setMonthlySummary(data)
    } catch (error) {
      console.error("Error loading finance summary:", error)
    } finally {
      setLoading(false)
    }
  }

  // Listen for finance data updates
  useEffect(() => {
    const handleFinanceUpdate = () => {
      loadSummary()
    }

    window.addEventListener('financeDataUpdated', handleFinanceUpdate)
    
    // Also refresh periodically
    const interval = setInterval(() => {
      loadSummary()
    }, 5000) // Refresh every 5 seconds

    return () => {
      window.removeEventListener('financeDataUpdated', handleFinanceUpdate)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <TrendingDown className="h-5 w-5 text-red-500" />
            {tr.finance.expenses}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-200">
            ₺{monthlySummary?.totalExpenses?.toFixed(2) || "0.00"}
          </p>
          <p className="text-sm text-slate-400 mt-1">Bu Ay</p>
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <TrendingUp className="h-5 w-5 text-green-500" />
            {tr.finance.income}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-200">
            ₺{monthlySummary?.totalIncome?.toFixed(2) || "0.00"}
          </p>
          <p className="text-sm text-slate-400 mt-1">Bu Ay</p>
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Wallet className="h-5 w-5 text-blue-500" />
            Bakiye
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${(monthlySummary?.balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ₺{monthlySummary?.balance?.toFixed(2) || "0.00"}
          </p>
          <p className="text-sm text-slate-400 mt-1">Net Durum</p>
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Tasarruf Oranı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-200">
            {monthlySummary && monthlySummary.totalIncome > 0
              ? `${((monthlySummary.balance / monthlySummary.totalIncome) * 100).toFixed(1)}%`
              : "0%"}
          </p>
          <p className="text-sm text-slate-400 mt-1">Gelir oranı</p>
        </CardContent>
      </Card>
    </div>
  )
}

