import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddItemForm } from "@/components/trackables/add-item-form"
import { LogoutButton } from "@/components/auth/logout-button"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DigitalClock } from "@/components/dashboard/digital-clock"
import type { Trackable } from "@/types/database"
import { isSameCalendarDay } from "@/lib/date-utils"
import { tr } from "@/lib/i18n"

export const dynamic = 'force-dynamic'

async function getTrackables() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch all trackables with all fields including calendar system fields
  const { data: trackables, error } = await supabase
    .from("trackables")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching trackables:", error)
    return []
  }

  // Process trackables to determine completion status
  const processedTrackables = (trackables || []).map((trackable) => {
    let is_completed_today = false

    if (trackable.type === "DAILY_HABIT") {
      if (trackable.last_completed_at) {
        // Use DST-aware calendar math to check if completed today
        is_completed_today = isSameCalendarDay(
          trackable.last_completed_at,
          new Date()
        )
      }
    } else if (trackable.type === "ONE_TIME") {
      is_completed_today = trackable.status === "completed"
    }

    return {
      ...trackable,
      is_completed_today,
    } as Trackable & { is_completed_today: boolean }
  })

  return processedTrackables
}

export default async function Dashboard() {
  const trackables = await getTrackables()

  const dailyHabits = trackables.filter((t) => t.type === "DAILY_HABIT")
  const oneTimeTasks = trackables.filter((t) => t.type === "ONE_TIME")
  const progressTrackers = trackables.filter((t) => t.type === "PROGRESS")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Clock */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Digital Clock - Left Top */}
          <div className="lg:col-span-1">
            <DigitalClock />
          </div>
          {/* Header Content */}
          <div className="lg:col-span-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
                {tr.dashboard.title}
              </h1>
              <p className="text-slate-400 mt-2 text-lg">
                {tr.dashboard.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AddItemForm />
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Dashboard Content with Task View and Widgets */}
        <DashboardContent
          dailyHabits={dailyHabits}
          oneTimeTasks={oneTimeTasks}
          progressTrackers={progressTrackers}
          allTrackables={trackables}
        />
      </div>
    </div>
  )
}
