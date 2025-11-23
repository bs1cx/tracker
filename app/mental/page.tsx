import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoodForm } from "@/components/mental/mood-form"
import { MeditationForm } from "@/components/mental/meditation-form"
import { JournalForm } from "@/components/mental/journal-form"
import { Smile, Brain, BookOpen, Wind } from "lucide-react"

export default async function MentalHealthPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">{tr.mental.title}</h1>
          <p className="text-muted-foreground mt-1">
            Ruh halinizi, motivasyonunuzu ve mindfulness aktivitelerinizi takip edin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Mood Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-yellow-500" />
                {tr.mental.moodTracker}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">Bugünkü Ruh Hali</p>
              <div className="mt-4">
                <MoodForm />
              </div>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                {tr.mental.motivation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">/ 10</p>
              <div className="mt-4">
                <MoodForm />
              </div>
            </CardContent>
          </Card>

          {/* Meditation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-green-500" />
                {tr.mental.meditation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">Dakika</p>
              <div className="mt-4">
                <MeditationForm />
              </div>
            </CardContent>
          </Card>

          {/* Journal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                {tr.mental.journal}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">Günlük Girişi</p>
              <div className="mt-4">
                <JournalForm />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

