import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartRateForm } from "@/components/health/heart-rate-form"
import { SleepForm } from "@/components/health/sleep-form"
import { WaterForm } from "@/components/health/water-form"
import { NutritionForm } from "@/components/health/nutrition-form"
import { Heart, Moon, Droplet, Utensils } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function HealthPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">{tr.health.title}</h1>
          <p className="text-muted-foreground mt-1">
            Sağlık metriklerinizi takip edin ve analiz edin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Heart Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                {tr.health.heartRate}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">BPM</p>
              <div className="mt-4">
                <HeartRateForm />
              </div>
            </CardContent>
          </Card>

          {/* Sleep */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-blue-500" />
                {tr.health.sleep}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">Saat</p>
              <div className="mt-4">
                <SleepForm />
              </div>
            </CardContent>
          </Card>

          {/* Water */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-cyan-500" />
                {tr.health.water}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">ml</p>
              <div className="mt-4">
                <WaterForm />
              </div>
            </CardContent>
          </Card>

          {/* Calories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-500" />
                {tr.health.calories}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">kcal</p>
              <div className="mt-4">
                <NutritionForm />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

