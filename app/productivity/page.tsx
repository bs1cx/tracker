import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PomodoroTimer } from "@/components/productivity/pomodoro-timer"
import { CheckSquare, Calendar, Focus, Target, FileText } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ProductivityPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{tr.productivity.title}</h1>
          <p className="text-muted-foreground mt-1">
            Görevlerinizi yönetin, odaklanın ve hedeflerinize ulaşın
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Todo List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                {tr.productivity.todo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="sm">
                Görev Listesini Aç
              </Button>
            </CardContent>
          </Card>

          {/* Pomodoro */}
          <PomodoroTimer />

          {/* Focus Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Focus className="h-5 w-5" />
                {tr.productivity.focusMode}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="sm">
                Odak Modunu Aç
              </Button>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {tr.productivity.weeklyGoals}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="sm">
                Hedefler
              </Button>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {tr.productivity.reports}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="sm">
                Raporları Görüntüle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

