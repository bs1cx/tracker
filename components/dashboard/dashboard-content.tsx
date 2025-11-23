"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "@/components/trackables/task-card"
import { ProgressTracker } from "@/components/trackables/progress-tracker"
import { Widget } from "./widget"
import { WidgetSelector } from "./widget-selector"
import { AddItemForm } from "@/components/trackables/add-item-form"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Calendar, Target, TrendingUp, CheckCircle2, Clock } from "lucide-react"
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
  const [widgets, setWidgets] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboard-widgets")
      return saved ? JSON.parse(saved) : ["stats", "goals"]
    }
    return ["stats", "goals"]
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard-widgets", JSON.stringify(widgets))
    }
  }, [widgets])

  const handleAddWidget = (widgetId: string) => {
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  Günlük Alışkanlıklar
                </div>
                <div className="text-2xl font-bold">
                  {completedToday}/{totalHabits}
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalHabits > 0
                    ? Math.round((completedToday / totalHabits) * 100)
                    : 0}
                  % tamamlandı
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Görevler
                </div>
                <div className="text-2xl font-bold">
                  {completedTasks}/{totalTasks}
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0}
                  % tamamlandı
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Toplam İlerleme
                </div>
                <div className="text-2xl font-bold">
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
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {trackable.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trackable.current_value}
                        {trackable.target_value
                          ? ` / ${trackable.target_value}`
                          : ""}
                      </div>
                    </div>
                    {trackable.target_value && (
                      <div className="text-xs font-medium ml-2">
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
      case "calendar":
        return (
          <Widget
            id="calendar"
            title="Takvim"
            onRemove={handleRemoveWidget}
          >
            <div className="text-sm text-muted-foreground text-center py-8">
              Takvim görünümü yakında eklenecek
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
      {/* Widgets Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {widgets.map((widgetId) => (
          <div key={widgetId}>{renderWidget(widgetId)}</div>
        ))}
        {widgets.length < 2 && (
          <div className="flex items-center justify-center min-h-[200px]">
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
              <h2 className="text-2xl font-semibold">
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
              <h2 className="text-2xl font-semibold">
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
              <h2 className="text-2xl font-semibold">
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

