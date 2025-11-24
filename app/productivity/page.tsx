import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PomodoroTimer } from "@/components/productivity/pomodoro-timer"
import { FocusMode } from "@/components/productivity/focus-mode"
import { GoalsManager } from "@/components/productivity/goals-manager"
import { ProductivityReports } from "@/components/productivity/productivity-reports"
import { SessionHistory } from "@/components/productivity/session-history"
import { CheckSquare, FileText } from "lucide-react"
import { getTodayPomodoroSessions, getTodayFocusSessions } from "@/app/actions-productivity"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ProductivityPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch today's data
  const [todayPomodoro, todayFocus] = await Promise.all([
    getTodayPomodoroSessions(),
    getTodayFocusSessions(),
  ])

  const totalPomodoroMinutes = todayPomodoro.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
  const totalFocusMinutes = todayFocus.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
  const completedPomodoros = todayPomodoro.filter(s => s.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
            {tr.productivity.title}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Görevlerinizi yönetin, odaklanın ve hedeflerinize ulaşın
          </p>
        </div>

        {/* Today's Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="text-sm text-slate-400">Bugünkü Pomodoro</div>
              <div className="text-2xl font-bold text-slate-200">
                {completedPomodoros} seans
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {totalPomodoroMinutes} dakika
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="text-sm text-slate-400">Bugünkü Odaklanma</div>
              <div className="text-2xl font-bold text-slate-200">
                {totalFocusMinutes} dk
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {todayFocus.length} seans
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="text-sm text-slate-400">Toplam Çalışma</div>
              <div className="text-2xl font-bold text-slate-200">
                {totalPomodoroMinutes + totalFocusMinutes} dk
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Bugün
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Todo List - Link to main dashboard */}
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <CheckSquare className="h-5 w-5 text-[#60a5fa]" />
                {tr.productivity.todo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">
                Görevlerinizi ana sayfadan yönetebilirsiniz
              </p>
              <Link href="/">
                <button className="w-full px-4 py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-md transition-colors">
                  Görev Listesini Aç
                </button>
              </Link>
            </CardContent>
          </Card>

          {/* Pomodoro */}
          <PomodoroTimer />

          {/* Focus Mode */}
          <FocusMode />

          {/* Session History */}
          <SessionHistory />

          {/* Goals */}
          <div className="md:col-span-2 lg:col-span-3">
            <GoalsManager />
          </div>

          {/* Reports */}
          <div className="md:col-span-2 lg:col-span-3">
            <ProductivityReports
              todayPomodoro={totalPomodoroMinutes}
              todayFocus={totalFocusMinutes}
              todayTotal={totalPomodoroMinutes + totalFocusMinutes}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

