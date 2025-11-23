"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CircularProgressProps {
  title: string
  value: number
  target: number
  unit: string
  color: string
  icon?: React.ReactNode
}

export function CircularProgress({
  title,
  value,
  target,
  unit,
  color,
  icon,
}: CircularProgressProps) {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0
  const remaining = Math.max(target - value, 0)

  const data = [
    { name: "Tamamlanan", value: value },
    { name: "Kalan", value: remaining },
  ]

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                <Cell fill={color} />
                <Cell fill="#1e293b" />
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-2">
          <p className="text-2xl font-bold text-slate-200">
            {value.toLocaleString()} / {target.toLocaleString()}
          </p>
          <p className="text-sm text-slate-400">{unit}</p>
          <p className="text-xs text-slate-500 mt-1">
            %{percentage.toFixed(0)} tamamlandı
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

