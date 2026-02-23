"use client"

import { motion } from "framer-motion"
import { CalendarClock, Eye, RefreshCw, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHR } from "@/lib/hr-store"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

const statusColor: Record<string, string> = {
  "Likely Hire": "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20",
  Pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning-foreground))] border-[hsl(var(--warning))]/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

const typeColor: Record<string, string> = {
  Technical: "bg-primary/10 text-primary border-primary/20",
  HR: "bg-secondary text-secondary-foreground border-border",
  Final: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20",
}

export function UpcomingInterviewsPanel({ compact = false }: { compact?: boolean }) {
  const { interviews } = useHR()
  const display = compact ? interviews.slice(0, 3) : interviews

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Upcoming Interviews</CardTitle>
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {display.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <CalendarClock className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No upcoming interviews</p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-2">
            {/* Timeline accent line */}
            <div className="absolute left-5 top-3 bottom-3 hidden w-px bg-border sm:block" />
            {display.map((interview, i) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="group flex flex-col gap-2 rounded-lg border border-border bg-background p-3 transition-all duration-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {interview.time}
                    </span>
                    <span className="text-sm text-muted-foreground">-</span>
                    <span className="text-sm font-medium text-foreground">
                      {interview.candidateName}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{interview.position}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", typeColor[interview.type])}>
                    {interview.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0",
                      statusColor[interview.status],
                      interview.status === "Likely Hire" && "animate-pulse"
                    )}
                  >
                    {interview.status}
                  </Badge>
                  {!compact && (
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <Link href={`/interviews/${interview.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="View details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toast.info("Reschedule request sent")}
                        aria-label="Reschedule"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toast.success("Reminder sent to candidate")}
                        aria-label="Send reminder"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
