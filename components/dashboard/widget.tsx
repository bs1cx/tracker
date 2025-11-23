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
        "relative group transition-all hover:shadow-lg",
        isDragging && "opacity-50",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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

