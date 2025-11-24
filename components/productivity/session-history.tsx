"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timer, Focus, Clock, CheckCircle2, XCircle } from "lucide-react"
import { getRecentSessions } from "@/app/actions-productivity"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export function SessionHistory() {
  const [sessions, setSessions] = useState<{ pomodoro: any[]; focus: any[] }>({ pomodoro: [], focus: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await getRecentSessions()
        setSessions(data)
      } catch (error) {
        console.error("Error loading sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [])

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: tr })
    } catch {
      return dateStr
    }
  }

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Clock className="h-5 w-5 text-[#60a5fa]" />
          Son Seanslar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pomodoro" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="pomodoro" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
              <Timer className="h-4 w-4 mr-2" />
              Pomodoro
            </TabsTrigger>
            <TabsTrigger value="focus" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
              <Focus className="h-4 w-4 mr-2" />
              Odaklanma
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pomodoro" className="mt-4">
            {loading ? (
              <div className="text-center py-4 text-slate-400">Yükleniyor...</div>
            ) : sessions.pomodoro.length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                Henüz Pomodoro seansı yok
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sessions.pomodoro.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border border-slate-700 rounded-lg bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {session.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="font-semibold text-slate-200">
                            {session.task_name || "Görev adı yok"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration_minutes} dakika
                          </span>
                          <span>{formatDate(session.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="focus" className="mt-4">
            {loading ? (
              <div className="text-center py-4 text-slate-400">Yükleniyor...</div>
            ) : sessions.focus.length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                Henüz odaklanma seansı yok
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sessions.focus.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border border-slate-700 rounded-lg bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Focus className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-slate-200">
                            Odaklanma Seansı
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration_minutes} dakika
                          </span>
                          {session.distractions !== undefined && session.distractions > 0 && (
                            <span className="text-yellow-500">
                              {session.distractions} dikkat dağıtıcı
                            </span>
                          )}
                        </div>
                        {session.notes && (
                          <p className="text-sm text-slate-500 mt-2 italic">
                            "{session.notes}"
                          </p>
                        )}
                        <span className="text-xs text-slate-500 mt-1 block">
                          {formatDate(session.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

