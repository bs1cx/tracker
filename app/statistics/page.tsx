import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { ComprehensiveStatistics } from "@/components/statistics/comprehensive-statistics"

export const dynamic = 'force-dynamic'

export default async function StatisticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
            {tr.statistics.title}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Tüm modüllerinizden kapsamlı istatistikler, trendler ve analizler
          </p>
        </div>

        <ComprehensiveStatistics />
      </div>
    </div>
  )
}

