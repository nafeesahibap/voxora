"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, CalendarDays, List, Eye, RefreshCw, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHR } from "@/lib/hr-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PageTransition } from "@/lib/animations"

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

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const weekDates = ["2026-02-09", "2026-02-10", "2026-02-11", "2026-02-12", "2026-02-13"]

export default function InterviewsPage() {
  const { interviews, candidates, addInterview } = useHR()
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [form, setForm] = useState({
    candidateId: "",
    date: "2026-02-16",
    time: "10:00 AM",
    type: "Technical" as "Technical" | "HR" | "Final",
  })

  function handleSchedule() {
    const candidate = candidates.find((c) => c.id === form.candidateId)
    if (!candidate) return
    addInterview({
      candidateName: candidate.name,
      candidateId: candidate.id,
      position: candidate.role,
      date: form.date,
      time: form.time,
      type: form.type,
      status: "Pending",
      notes: "",
    })
    setScheduleOpen(false)
    toast.success("Interview scheduled successfully")
  }

  const byDate: Record<string, typeof interviews> = {}
  interviews.forEach((i) => {
    if (!byDate[i.date]) byDate[i.date] = []
    byDate[i.date].push(i)
  })

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setScheduleOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Schedule Interview
            </Button>
          </motion.div>
        </div>

        {/* Views */}
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list" className="gap-1.5">
              <List className="h-3.5 w-3.5" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Calendar View
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  All Interviews ({interviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {interviews.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No interviews scheduled
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <AnimatePresence>
                      {interviews.map((interview, i) => (
                        <motion.div
                          key={interview.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.05 }}
                          className="group flex flex-col gap-2 rounded-lg border border-border bg-background p-4 transition-all duration-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {interview.date}
                              </span>
                              <span className="text-sm text-muted-foreground">at</span>
                              <span className="text-sm font-medium text-foreground">
                                {interview.time}
                              </span>
                            </div>
                            <p className="mt-1 font-medium text-foreground">{interview.candidateName}</p>
                            <p className="text-sm text-muted-foreground">{interview.position}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs", typeColor[interview.type])}>
                              {interview.type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                statusColor[interview.status],
                                interview.status === "Likely Hire" && "animate-pulse"
                              )}
                            >
                              {interview.status}
                            </Badge>
                            <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <Link href={`/interviews/${interview.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View details">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toast.info("Reschedule request sent")}
                                aria-label="Reschedule"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toast.success("Reminder sent to candidate")}
                                aria-label="Send reminder"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Week of February 9 - 13, 2026
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-5 gap-2">
                  {weekDays.map((day, idx) => {
                    const date = weekDates[idx]
                    const dayInterviews = byDate[date] || []
                    const isToday = date === "2026-02-13"
                    return (
                      <motion.div
                        key={day}
                        className="flex flex-col"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.06 }}
                      >
                        <div
                          className={cn(
                            "mb-2 rounded-md px-2 py-1.5 text-center text-sm font-medium transition-colors",
                            isToday
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {day} {date.split("-")[2]}
                        </div>
                        <div className="flex min-h-32 flex-col gap-1.5">
                          {dayInterviews.map((interview) => (
                            <Link key={interview.id} href={`/interviews/${interview.id}`}>
                              <motion.div
                                className="rounded-md border border-border bg-background p-2 text-xs transition-all duration-200 hover:shadow-sm hover:bg-accent"
                                whileHover={{ y: -1 }}
                              >
                                <p className="font-medium text-foreground">{interview.time}</p>
                                <p className="mt-0.5 truncate text-muted-foreground">
                                  {interview.candidateName}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={cn("mt-1 text-[9px] px-1 py-0", typeColor[interview.type])}
                                >
                                  {interview.type}
                                </Badge>
                              </motion.div>
                            </Link>
                          ))}
                          {dayInterviews.length === 0 && (
                            <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border p-2">
                              <span className="text-[10px] text-muted-foreground">No interviews</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Schedule Dialog */}
        <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>Select a candidate and time slot for the interview.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div>
                <label className="text-sm font-medium text-foreground">Candidate</label>
                <Select value={form.candidateId} onValueChange={(v) => setForm({ ...form, candidateId: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates
                      .filter((c) => c.status !== "hired" && c.status !== "rejected")
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Time</label>
                  <Input
                    className="mt-1"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Interview Type</label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as "Technical" | "HR" | "Final" })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSchedule} disabled={!form.candidateId}>
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
