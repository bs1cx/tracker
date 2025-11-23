"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface WidgetProps {
  id: string
  title: string
  children: ReactNode
  className?: string
  onRemove?: (id: string) => void
  isDragging?: boolean
}

export function Widget({
  id,
  title,
  children,
  className,
  onRemove,
  isDragging,
}: WidgetProps) {
  return (
    <Card
      className={cn(
        "relative group transition-all hover:shadow-xl border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm w-full",
        isDragging && "opacity-50",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-500 cursor-move" />
          <CardTitle className="text-base font-semibold text-[#60a5fa]">{title}</CardTitle>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200"
            onClick={() => onRemove(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

