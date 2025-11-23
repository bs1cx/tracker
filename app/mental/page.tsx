import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoodForm } from "@/components/mental/mood-form"
import { MotivationForm } from "@/components/mental/motivation-form"
import { MeditationForm } from "@/components/mental/meditation-form"
import { JournalForm } from "@/components/mental/journal-form"
import { MentalReports } from "@/components/mental/mental-reports"
import { Smile, Brain, BookOpen, Wind } from "lucide-react"
import { getTodayMood, getTodayMotivation, getTodayMeditationMinutes, getTodayJournalCount } from "@/app/actions-mental"
import { getCurrentISODate } from "@/lib/date-utils"

export const dynamic = 'force-dynamic'

export default async function MentalHealthPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch today's data
  const [todayMood, todayMotivation, todayMeditation, todayJournal] = await Promise.all([
    getTodayMood(),
    getTodayMotivation(),
    getTodayMeditationMinutes(),
    getTodayJournalCount(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
            {tr.mental.title}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Ruh halinizi, motivasyonunuzu ve mindfulness aktivitelerinizi takip edin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Mood Tracker */}
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <Smile className="h-5 w-5 text-yellow-500" />
                {tr.mental.moodTracker}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-200">
                {todayMood?.mood_score ? `${todayMood.mood_score}/10` : "--"}
              </p>
              <p className="text-sm text-slate-400">
                {todayMood?.mood_label || "Bugünkü Ruh Hali"}
              </p>
              <div className="mt-4">
                <MoodForm />
              </div>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <Brain className="h-5 w-5 text-purple-500" />
                {tr.mental.motivation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-200">
                {todayMotivation?.motivation_score ? `${todayMotivation.motivation_score}/10` : "--"}
              </p>
              <p className="text-sm text-slate-400">/ 10</p>
              <div className="mt-4">
                <MotivationForm />
              </div>
            </CardContent>
          </Card>

          {/* Meditation */}
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <Wind className="h-5 w-5 text-green-500" />
                {tr.mental.meditation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-200">
                {todayMeditation > 0 ? todayMeditation : "--"}
              </p>
              <p className="text-sm text-slate-400">Dakika</p>
              <div className="mt-4">
                <MeditationForm />
              </div>
            </CardContent>
          </Card>

          {/* Journal */}
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                {tr.mental.journal}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-200">
                {todayJournal > 0 ? todayJournal : "--"}
              </p>
              <p className="text-sm text-slate-400">Günlük Girişi</p>
              <div className="mt-4">
                <JournalForm />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Section */}
        <div className="mt-8">
          <MentalReports
            todayMood={todayMood}
            todayMotivation={todayMotivation}
            todayMeditation={todayMeditation}
            todayJournal={todayJournal}
          />
        </div>
      </div>
    </div>
  )
}

