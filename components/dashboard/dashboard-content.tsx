"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "@/components/trackables/task-card"
import { ProgressTracker } from "@/components/trackables/progress-tracker"
import { Widget } from "./widget"
import { WidgetSelector } from "./widget-selector"
import { AddItemForm } from "@/components/trackables/add-item-form"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Calendar, Target, TrendingUp, CheckCircle2, Clock } from "lucide-react"
import { TaskView } from "./task-view"
import { tr } from "@/lib/i18n"
import type { Trackable } from "@/types/database"

interface DashboardContentProps {
  dailyHabits: (Trackable & { is_completed_today: boolean })[]
  oneTimeTasks: (Trackable & { is_completed_today: boolean })[]
  progressTrackers: (Trackable & { is_completed_today: boolean })[]
  allTrackables: (Trackable & { is_completed_today: boolean })[]
}

export function DashboardContent({
  dailyHabits,
  oneTimeTasks,
  progressTrackers,
  allTrackables,
}: DashboardContentProps) {
  const [widgets, setWidgets] = useState<string[]>(["stats", "goals"])
  const [mounted, setMounted] = useState(false)

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("dashboard-widgets")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setWidgets(parsed)
        }
      } catch (e) {
        console.error("Error parsing saved widgets:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("dashboard-widgets", JSON.stringify(widgets))
    }
  }, [widgets, mounted])

  // Listen for trackables data updates and refresh
  useEffect(() => {
    const handleTrackablesUpdate = () => {
      // Refresh the page to get updated data
      window.location.reload()
    }
    
    window.addEventListener('trackablesDataUpdated', handleTrackablesUpdate)
    
    return () => {
      window.removeEventListener('trackablesDataUpdated', handleTrackablesUpdate)
    }
  }, [])

  const handleAddWidget = (widgetId: string) => {
    // Allow up to 2 widgets
    if (!widgets.includes(widgetId) && widgets.length < 2) {
      setWidgets([...widgets, widgetId])
    }
  }

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter((id) => id !== widgetId))
  }

  const completedToday = dailyHabits.filter((t) => t.is_completed_today).length
  const totalHabits = dailyHabits.length
  const completedTasks = oneTimeTasks.filter((t) => t.status === "completed").length
  const totalTasks = oneTimeTasks.length

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "stats":
        return (
          <Widget
            id="stats"
            title="İstatistikler"
            onRemove={handleRemoveWidget}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-[#60a5fa]" />
                  Günlük Alışkanlıklar
                </div>
                <div className="text-2xl font-bold text-[#60a5fa]">
                  {completedToday}/{totalHabits}
                </div>
                <div className="text-xs text-slate-500">
                  {totalHabits > 0
                    ? Math.round((completedToday / totalHabits) * 100)
                    : 0}
                  % tamamlandı
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="h-4 w-4 text-[#60a5fa]" />
                  Görevler
                </div>
                <div className="text-2xl font-bold text-[#60a5fa]">
                  {completedTasks}/{totalTasks}
                </div>
                <div className="text-xs text-slate-500">
                  {totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0}
                  % tamamlandı
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <TrendingUp className="h-4 w-4 text-[#60a5fa]" />
                  Toplam İlerleme
                </div>
                <div className="text-2xl font-bold text-[#60a5fa]">
                  {progressTrackers.length} takipçi
                </div>
              </div>
            </div>
          </Widget>
        )
      case "goals":
        return (
          <Widget
            id="goals"
            title="Hedefler"
            onRemove={handleRemoveWidget}
          >
            <div className="space-y-3">
              {progressTrackers.length > 0 ? (
                progressTrackers.slice(0, 3).map((trackable) => (
                  <div
                    key={trackable.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-slate-200">
                        {trackable.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {trackable.current_value}
                        {trackable.target_value
                          ? ` / ${trackable.target_value}`
                          : ""}
                      </div>
                    </div>
                    {trackable.target_value && (
                      <div className="text-xs font-medium ml-2 text-[#60a5fa]">
                        {Math.round(
                          (trackable.current_value / trackable.target_value) *
                            100
                        )}
                        %
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz hedef yok
                </p>
              )}
            </div>
          </Widget>
        )
      case "progress":
        return (
          <Widget
            id="progress"
            title="İlerleme"
            onRemove={handleRemoveWidget}
          >
            <div className="space-y-2">
              {progressTrackers.length > 0 ? (
                progressTrackers.map((trackable) => (
                  <div key={trackable.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{trackable.title}</span>
                      <span className="text-muted-foreground">
                        {trackable.current_value}
                        {trackable.target_value
                          ? ` / ${trackable.target_value}`
                          : ""}
                      </span>
                    </div>
                    {trackable.target_value && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              Math.min(
                                (trackable.current_value /
                                  trackable.target_value) *
                                  100,
                                100
                              )
                            }%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz ilerleme takipçisi yok
                </p>
              )}
            </div>
          </Widget>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Task View - Günlük/Haftalık/Aylık */}
      <TaskView
        allTrackables={allTrackables}
        dailyHabits={dailyHabits}
        oneTimeTasks={oneTimeTasks}
        progressTrackers={progressTrackers}
      />

      {/* Widgets Section - 2 widgets side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        {widgets.map((widgetId) => (
          <div key={widgetId} className="w-full">
            {renderWidget(widgetId)}
          </div>
        ))}
        
        {/* Widget Selector in empty slots */}
        {widgets.length < 2 && (
          <div className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-slate-700/50 rounded-lg">
            <WidgetSelector
              onAddWidget={handleAddWidget}
              existingWidgets={widgets}
            />
          </div>
        )}
      </div>

      {/* Trackables Sections */}
      <div className="space-y-8">
        {/* Daily Habits Section */}
        {dailyHabits.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-[#60a5fa]">
                {tr.dashboard.dailyHabits}
              </h2>
            </div>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-[#60a5fa]">
                {tr.dashboard.oneTimeTasks}
              </h2>
            </div>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-[#60a5fa]">
                {tr.dashboard.progressTrackers}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {progressTrackers.map((trackable) => (
                <ProgressTracker key={trackable.id} trackable={trackable} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {allTrackables.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg mb-4">
                {tr.dashboard.noTrackables}
              </p>
              <AddItemForm />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

