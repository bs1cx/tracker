import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExpenseForm } from "@/components/finance/expense-form"
import { IncomeForm } from "@/components/finance/income-form"
import { FinanceReports } from "@/components/finance/finance-reports"
import { FinancialRules } from "@/components/finance/financial-rules"
import { TrendingDown, TrendingUp, Wallet, BarChart3 } from "lucide-react"
import { getMonthlyFinanceSummary } from "@/app/actions-finance"

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch monthly summary
  const monthlySummary = await getMonthlyFinanceSummary()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
            {tr.finance.title}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Harcamalarınızı takip edin, bütçe oluşturun ve finansal hedeflerinize ulaşın
          </p>
        </div>

        {/* Summary Cards */}
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

        {/* Forms */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-200">Harcama Ekle</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm />
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-200">Gelir Ekle</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeForm />
            </CardContent>
          </Card>
        </div>

        {/* Reports */}
        <div className="mb-6">
          <FinanceReports monthlySummary={monthlySummary} />
        </div>

        {/* Financial Rules */}
        <div>
          <FinancialRules />
        </div>
      </div>
    </div>
  )
}

