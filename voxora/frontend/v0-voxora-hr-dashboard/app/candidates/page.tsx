"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Upload, Eye, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useHR } from "@/lib/hr-store"
import type { Candidate } from "@/lib/hr-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PageTransition, AnimatedProgress } from "@/lib/animations"

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

const nextStage: Record<string, Candidate["status"]> = {
  applied: "screening",
  screening: "interview",
  interview: "offer",
  offer: "hired",
}

export default function CandidatesPage() {
  const { candidates, addCandidate, updateCandidate } = useHR()
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false)
  const [resumeUrl, setResumeUrl] = useState("")
  const [form, setForm] = useState({
    name: "",
    role: "",
    experience: "",
    email: "",
    phone: "",
  })

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
    const matchesStage = stageFilter === "all" || c.status === stageFilter
    return matchesSearch && matchesStage
  })

  function handleAddCandidate() {
    if (!form.name || !form.role) return
    addCandidate({
      name: form.name,
      role: form.role,
      experience: form.experience || "Not specified",
      matchScore: Math.floor(Math.random() * 30) + 65,
      status: "applied",
      lastUpdated: "2026-02-13",
      email: form.email,
      phone: form.phone,
      skills: [],
      interviewHistory: [],
      linkedTasks: [],
    })
    setForm({ name: "", role: "", experience: "", email: "", phone: "" })
    setAddDialogOpen(false)
    toast.success("Candidate added successfully")
  }

  function handleResumeUpload() {
    if (!resumeUrl.trim()) return
    toast.success("Resume link submitted for parsing", { description: resumeUrl })
    setResumeUrl("")
    setResumeDialogOpen(false)
  }

  function handleMoveStage(id: string, currentStatus: Candidate["status"]) {
    const next = nextStage[currentStatus]
    if (next) {
      updateCandidate(id, { status: next, lastUpdated: "2026-02-13" })
      toast.success(`Candidate moved to ${statusLabels[next]}`)
    }
  }

  function getMatchScoreColor(score: number) {
    if (score >= 90) return "text-[hsl(var(--success))]"
    if (score >= 75) return "text-primary"
    if (score >= 60) return "text-[hsl(var(--warning-foreground))]"
    return "text-destructive"
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Top Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Candidate
              </Button>
            </motion.div>
            <Button variant="outline" onClick={() => setResumeDialogOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" />
              Upload Resume
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                className="w-56 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer Extended</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Candidates Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              All Candidates ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role Applied</TableHead>
                    <TableHead className="hidden md:table-cell">Experience</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          No candidates found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.04 }}
                          className="group border-b transition-colors hover:bg-accent/50"
                        >
                          <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                          <TableCell className="text-muted-foreground">{c.role}</TableCell>
                          <TableCell className="hidden text-muted-foreground md:table-cell">
                            {c.experience}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn("font-semibold tabular-nums", getMatchScoreColor(c.matchScore))}>
                                {c.matchScore}%
                              </span>
                              <div className="hidden w-16 lg:block">
                                <AnimatedProgress
                                  value={c.matchScore}
                                  delay={0.2 + i * 0.05}
                                  barClassName={
                                    c.matchScore >= 90
                                      ? "bg-[hsl(var(--success))]"
                                      : c.matchScore >= 75
                                        ? "bg-primary"
                                        : "bg-[hsl(var(--warning))]"
                                  }
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-xs", statusColors[c.status])}>
                              {statusLabels[c.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden text-muted-foreground lg:table-cell">
                            {c.lastUpdated}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/candidates/${c.id}`}>
                                <Button variant="ghost" size="sm" className="h-7">
                                  <Eye className="mr-1 h-3.5 w-3.5" />
                                  View
                                </Button>
                              </Link>
                              {nextStage[c.status] && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 opacity-0 transition-opacity group-hover:opacity-100"
                                  onClick={() => handleMoveStage(c.id, c.status)}
                                >
                                  <ArrowRight className="mr-1 h-3.5 w-3.5" />
                                  Move
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Candidate Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
              <DialogDescription>Enter the candidate details to add them to your pipeline.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  className="mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Role Applied</label>
                <Input
                  className="mt-1"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Senior Backend Engineer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Experience</label>
                  <Input
                    className="mt-1"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="e.g. 5 years"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    className="mt-1"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCandidate} disabled={!form.name || !form.role}>
                Add Candidate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resume Upload Dialog */}
        <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Resume</DialogTitle>
              <DialogDescription>Paste a link to the resume to parse and import candidate data.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <label className="text-sm font-medium text-foreground">Resume URL</label>
              <Input
                className="mt-1"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/resume.pdf"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResumeDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleResumeUpload} disabled={!resumeUrl.trim()}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
