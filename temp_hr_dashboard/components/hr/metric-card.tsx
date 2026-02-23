"use client"

import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useCountUp } from "@/lib/animations"

interface MetricCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  className?: string
  index?: number
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className, index = 0 }: MetricCardProps) {
  const numericValue = typeof value === "number" ? value : null
  const animatedValue = useCountUp(numericValue ?? 0, 900)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.08 }}
    >
      <Card className={cn("transition-lift group cursor-default", className)}>
        <CardContent className="flex items-start justify-between p-5">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {numericValue !== null ? animatedValue : value}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{subtitle}</p>
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    trend.value >= 0
                      ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {trend.value >= 0 ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {trend.value >= 0 ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <motion.div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover:bg-primary/15"
            whileHover={{ scale: 1.05 }}
          >
            <Icon className="h-5 w-5 text-primary" />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
