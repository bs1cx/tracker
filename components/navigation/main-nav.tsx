"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Heart,
  Brain,
  Target,
  DollarSign,
  BarChart3,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { tr } from "@/lib/i18n"

const navItems = [
  { href: "/", label: tr.dashboard.title, icon: Home },
  { href: "/health", label: tr.health.title, icon: Heart },
  { href: "/mental", label: tr.mental.title, icon: Brain },
  { href: "/productivity", label: tr.productivity.title, icon: Target },
  { href: "/finance", label: tr.finance.title, icon: DollarSign },
  { href: "/statistics", label: tr.statistics.title, icon: BarChart3 },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Menu className="h-6 w-6" />
              <span className="font-bold text-lg">{tr.dashboard.title}</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "gap-2",
                        isActive && "bg-secondary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

