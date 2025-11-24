import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseForm } from "@/components/finance/expense-form"
import { IncomeForm } from "@/components/finance/income-form"
import { FinanceReports } from "@/components/finance/finance-reports"
import { FinancialRules } from "@/components/finance/financial-rules"
import { FinanceSummaryCards } from "@/components/finance/finance-summary-cards"
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
        <FinanceSummaryCards initialSummary={monthlySummary} />

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

