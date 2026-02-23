"use client"

import { use, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  FileText,
  Upload,
  Send,
  Sparkles,
  Plus,
  User,
  CalendarClock,
  Briefcase,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useHR } from "@/lib/hr-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PageTransition, FadeIn } from "@/lib/animations"

const statusColor: Record<string, string> = {
  "Likely Hire": "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  Pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning-foreground))]",
  Rejected: "bg-destructive/10 text-destructive",
}

const typeColor: Record<string, string> = {
  Technical: "bg-primary/10 text-primary",
  HR: "bg-secondary text-secondary-foreground",
  Final: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
}

export default function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { interviews, updateInterview, addTask } = useHR()
  const interview = interviews.find((i) => i.id === id)
  const [notes, setNotes] = useState(interview?.notes || "")
  const [followUpTitle, setFollowUpTitle] = useState("")

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">Interview not found</p>
        <Link href="/interviews">
          <Button variant="outline">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Interviews
          </Button>
        </Link>
      </div>
    )
  }

  function saveNotes() {
    updateInterview(interview!.id, { notes })
    toast.success("Interview notes saved")
  }

  function handleAddFollowUp() {
    if (!followUpTitle.trim()) return
    addTask({
      title: followUpTitle,
      candidate: interview!.candidateName,
      dueDate: "2026-02-16",
      priority: "medium",
      status: "pending",
      voiceCreated: false,
      category: "follow-up",
    })
    setFollowUpTitle("")
    toast.success("Follow-up task added")
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/interviews">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Interview with {interview.candidateName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {interview.date} at {interview.time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-sm", typeColor[interview.type])}>
              {interview.type}
            </Badge>
            <Badge variant="outline" className={cn("text-sm", statusColor[interview.status])}>
              {interview.status}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Candidate Details</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{interview.candidateName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{interview.position}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {interview.date} at {interview.time}
                      </span>
                    </div>
                    <Link href={`/candidates/${interview.candidateId}`}>
                      <Button variant="link" className="h-auto p-0 text-sm">
                        View full candidate profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Interview Notes</CardTitle>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button size="sm" onClick={saveNotes}>
                      Save Notes
                    </Button>
                  </motion.div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your interview notes here..."
                    className="min-h-40 resize-y transition-shadow focus:shadow-sm"
                  />
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Add Follow-up Task</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex gap-2">
                    <Input
                      value={followUpTitle}
                      onChange={(e) => setFollowUpTitle(e.target.value)}
                      placeholder="e.g. Send technical assessment results to hiring manager"
                      className="flex-1"
                    />
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button onClick={handleAddFollowUp} disabled={!followUpTitle.trim()}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Task
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <FadeIn delay={0.15}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 px-5 pb-5">
                  {[
                    { icon: Upload, label: "Upload Recording", action: () => toast.info("Recording upload dialog would open here") },
                    { icon: Sparkles, label: "Generate Summary", action: () => toast.success("Interview summary generated for " + interview.candidateName) },
                    { icon: Send, label: "Send Summary Email", action: () => toast.success("Summary email sent to hiring team") },
                    { icon: FileText, label: "Generate Brief", action: () => toast.success("Interview brief generated") },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.2 + i * 0.06 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start transition-all duration-200 hover:shadow-sm"
                        onClick={item.action}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.25}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Recording</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="flex h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50">
                    <Upload className="mb-1.5 h-6 w-6 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">
                      {interview.recording ? "Recording available" : "No recording uploaded"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
