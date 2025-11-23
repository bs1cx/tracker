import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TaskCard } from "@/components/trackables/task-card"
import { ProgressTracker } from "@/components/trackables/progress-tracker"
import { AddItemForm } from "@/components/trackables/add-item-form"
import { LogoutButton } from "@/components/auth/logout-button"
import type { Trackable } from "@/types/database"

async function getTrackables() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Use the helper function to get trackables with reset logic and completion status
  const { data: trackables, error } = await supabase.rpc(
    "get_user_trackables",
    {
      p_user_id: user.id,
    }
  )

  if (error) {
    console.error("Error fetching trackables:", error)
    // Fallback to direct query if helper function fails
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("trackables")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (fallbackError) {
      console.error("Error in fallback query:", fallbackError)
      return []
    }

    // Process trackables to determine completion status
    const processedTrackables = (fallbackData || []).map((trackable) => {
      let is_completed_today = false

      if (trackable.type === "DAILY_HABIT") {
        if (trackable.last_completed_at) {
          const lastCompleted = new Date(trackable.last_completed_at)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          lastCompleted.setHours(0, 0, 0, 0)
          is_completed_today = lastCompleted.getTime() === today.getTime()
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

  // Filter trackables: show all daily habits and progress, but only active one-time tasks
  const filteredTrackables = (trackables || []).filter((t) => {
    if (t.type === "DAILY_HABIT" || t.type === "PROGRESS") {
      return true // Always show daily habits and progress trackers
    }
    if (t.type === "ONE_TIME") {
      return t.status === "active" // Only show active one-time tasks
    }
    return true
  })

  return filteredTrackables as (Trackable & { is_completed_today: boolean })[]
}

export default async function Dashboard() {
  const trackables = await getTrackables()

  const dailyHabits = trackables.filter((t) => t.type === "DAILY_HABIT")
  const oneTimeTasks = trackables.filter((t) => t.type === "ONE_TIME")
  const progressTrackers = trackables.filter((t) => t.type === "PROGRESS")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Life Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Track your habits, tasks, and progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddItemForm />
            <LogoutButton />
          </div>
        </div>

        <div className="space-y-8">
          {/* Daily Habits Section */}
          {dailyHabits.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Daily Habits</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dailyHabits.map((trackable) => (
                  <TaskCard key={trackable.id} trackable={trackable} />
                ))}
              </div>
            </section>
          )}

          {/* One-Time Tasks Section */}
          {oneTimeTasks.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">To-Do List</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {oneTimeTasks.map((trackable) => (
                  <TaskCard key={trackable.id} trackable={trackable} />
                ))}
              </div>
            </section>
          )}

          {/* Progress Trackers Section */}
          {progressTrackers.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Watch/Read List
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {progressTrackers.map((trackable) => (
                  <ProgressTracker key={trackable.id} trackable={trackable} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {trackables.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No trackables yet. Get started by adding your first item!
              </p>
              <AddItemForm />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

