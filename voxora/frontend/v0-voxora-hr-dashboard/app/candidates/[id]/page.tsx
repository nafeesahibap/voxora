"use client"

import { use } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHR } from "@/lib/hr-store"
import type { Candidate } from "@/lib/hr-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PageTransition, FadeIn, AnimatedProgress, CircularScore } from "@/lib/animations"

const statusLabels: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer Extended",
  hired: "Hired",
  rejected: "Rejected",
}

const statusColors: Record<string, string> = {
  applied: "bg-muted text-muted-foreground",
  screening: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning-foreground))]",
  interview: "bg-primary/10 text-primary",
  offer: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  hired: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  rejected: "bg-destructive/10 text-destructive",
}

export default function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { candidates, tasks, updateCandidate } = useHR()
  const candidate = candidates.find((c) => c.id === id)

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">Candidate not found</p>
        <Link href="/candidates">
          <Button variant="outline">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Candidates
          </Button>
        </Link>
      </div>
    )
  }

  const linkedTasks = tasks.filter((t) => candidate.linkedTasks.includes(t.id))

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/candidates">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-foreground">{candidate.name}</h2>
              <p className="text-sm text-muted-foreground">{candidate.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => toast.success("Interview brief generated for " + candidate.name)}
              >
                <FileText className="mr-1.5 h-4 w-4" />
                Generate Interview Brief
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => toast.success("Offer letter generated for " + candidate.name)}
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Generate Offer Letter
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Contact & Status */}
            <FadeIn delay={0.1}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {candidate.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {candidate.phone}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Experience: {candidate.experience}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Status</label>
                        <Select
                          value={candidate.status}
                          onValueChange={(v) => {
                            updateCandidate(candidate.id, {
                              status: v as Candidate["status"],
                              lastUpdated: "2026-02-13",
                            })
                            toast.success(`Status updated to ${statusLabels[v]}`)
                          }}
                        >
                          <SelectTrigger className="mt-1 w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("mt-5 text-xs", statusColors[candidate.status])}
                      >
                        {statusLabels[candidate.status]}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Skills Breakdown */}
            <FadeIn delay={0.2}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Skill Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {candidate.skills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No skills data available</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {candidate.skills.map((skill, i) => (
                        <div key={skill.name}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{skill.name}</span>
                            <span className="text-sm tabular-nums text-muted-foreground">{skill.level}%</span>
                          </div>
                          <AnimatedProgress value={skill.level} delay={0.3 + i * 0.1} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            {/* Interview History */}
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Interview History</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {candidate.interviewHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No interviews conducted yet</p>
                  ) : (
                    <div className="relative flex flex-col gap-3">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                      {candidate.interviewHistory.map((interview, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.4 + i * 0.1 }}
                          className="relative rounded-lg border border-border bg-background p-3 ml-6"
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-[30px] top-4 h-2.5 w-2.5 rounded-full border-2 border-primary bg-card" />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {interview.type}
                              </Badge>
                              <span className="text-sm font-medium text-foreground">
                                {interview.interviewer}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{interview.date}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{interview.notes}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* AI Match Score - Circular */}
            <FadeIn delay={0.15}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">AI Match Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center pb-5">
                  <CircularScore score={candidate.matchScore} size={120} strokeWidth={8} />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {candidate.matchScore >= 90
                      ? "Excellent match"
                      : candidate.matchScore >= 75
                        ? "Strong match"
                        : "Moderate match"}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Resume Preview */}
            <FadeIn delay={0.25}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Resume</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50">
                    <FileText className="mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">
                      {candidate.resumeUrl ? "Resume available" : "No resume uploaded"}
                    </p>
                    <Button variant="link" size="sm" className="mt-1 text-xs">
                      View Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Linked Tasks */}
            <FadeIn delay={0.35}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Linked Tasks</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  {linkedTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No linked tasks</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {linkedTasks.map((task, i) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.4 + i * 0.06 }}
                          className="rounded-lg border border-border bg-background p-2.5 text-sm transition-colors hover:bg-accent/50"
                        >
                          <p className="font-medium text-foreground">{task.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Due: {task.dueDate}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
