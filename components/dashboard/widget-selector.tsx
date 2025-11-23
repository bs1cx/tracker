"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, BarChart3, Calendar, Target, TrendingUp } from "lucide-react"
import { tr } from "@/lib/i18n"

interface WidgetOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const availableWidgets: WidgetOption[] = [
  {
    id: "stats",
    title: "İstatistikler",
    description: "Genel istatistikleri görüntüle",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "calendar",
    title: "Takvim",
    description: "Aylık takvim görünümü",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "goals",
    title: "Hedefler",
    description: "Aktif hedeflerinizi görüntüle",
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: "progress",
    title: "İlerleme",
    description: "İlerleme grafikleri",
    icon: <TrendingUp className="h-5 w-5" />,
  },
]

interface WidgetSelectorProps {
  onAddWidget: (widgetId: string) => void
  existingWidgets: string[]
}

export function WidgetSelector({
  onAddWidget,
  existingWidgets,
}: WidgetSelectorProps) {
  const [open, setOpen] = useState(false)

  const availableWidgetsToShow = availableWidgets.filter(
    (widget) => !existingWidgets.includes(widget.id)
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2 border-slate-700/50 hover:border-[#60a5fa]/50 hover:bg-slate-700/30">
          <Plus className="h-5 w-5 text-[#60a5fa]" />
          <span className="text-slate-200">Widget Ekle</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Widget Ekle</DialogTitle>
          <DialogDescription>
            Dashboard'unuza eklemek istediğiniz widget'ı seçin
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {availableWidgetsToShow.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Tüm widget'lar eklenmiş
            </p>
          ) : (
            availableWidgetsToShow.map((widget) => (
              <Button
                key={widget.id}
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => {
                  onAddWidget(widget.id)
                  setOpen(false)
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  {widget.icon}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{widget.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {widget.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {tr.common.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

