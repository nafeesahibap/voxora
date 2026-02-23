"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Pencil, Mic, Check, ListTodo } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
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
import type { HRTask } from "@/lib/hr-data"
import { cn } from "@/lib/utils"

type FilterType = "all" | "pending" | "completed" | "voice"

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning-foreground))] border-[hsl(var(--warning))]/20",
  low: "bg-muted text-muted-foreground border-border",
}

export function TaskListPanel({ compact = false }: { compact?: boolean }) {
  const { tasks, addTask, updateTask, deleteTask } = useHR()
  const [filter, setFilter] = useState<FilterType>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<HRTask | null>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formCandidate, setFormCandidate] = useState("")
  const [formDueDate, setFormDueDate] = useState("")
  const [formPriority, setFormPriority] = useState<"high" | "medium" | "low">("medium")
  const [formCategory, setFormCategory] = useState<HRTask["category"]>("follow-up")

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending"
    if (filter === "completed") return t.status === "completed"
    if (filter === "voice") return t.voiceCreated
    return true
  })

  const displayTasks = compact ? filtered.slice(0, 5) : filtered

  function openAddDialog() {
    setEditingTask(null)
    setFormTitle("")
    setFormCandidate("")
    setFormDueDate("2026-02-14")
    setFormPriority("medium")
    setFormCategory("follow-up")
    setDialogOpen(true)
  }

  function openEditDialog(task: HRTask) {
    setEditingTask(task)
    setFormTitle(task.title)
    setFormCandidate(task.candidate || "")
    setFormDueDate(task.dueDate)
    setFormPriority(task.priority)
    setFormCategory(task.category)
    setDialogOpen(true)
  }

  function handleSave() {
    if (!formTitle.trim()) return
    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle,
        candidate: formCandidate || undefined,
        dueDate: formDueDate,
        priority: formPriority,
        category: formCategory,
      })
    } else {
      addTask({
        title: formTitle,
        candidate: formCandidate || undefined,
        dueDate: formDueDate,
        priority: formPriority,
        status: "pending",
        voiceCreated: false,
        category: formCategory,
      })
    }
    setDialogOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">HR Task List</CardTitle>
          <div className="flex items-center gap-2">
            {/* Filters */}
            <div className="hidden flex-wrap gap-1 sm:flex">
              {(["all", "pending", "completed", "voice"] as FilterType[]).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs capitalize transition-all duration-200",
                    filter === f && "shadow-sm"
                  )}
                  onClick={() => setFilter(f)}
                >
                  {f === "voice" ? "Voice Created" : f}
                </Button>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button size="sm" className="h-8" onClick={openAddDialog}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Task
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {displayTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8"
            >
              <ListTodo className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No tasks found</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {displayTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-all duration-200 hover:shadow-sm",
                      task.status === "completed" && "opacity-60"
                    )}
                  >
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={(checked) =>
                        updateTask(task.id, { status: checked ? "completed" : "pending" })
                      }
                      aria-label={`Mark ${task.title} as ${task.status === "completed" ? "pending" : "complete"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium text-foreground transition-all duration-300",
                          task.status === "completed" && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {task.candidate && (
                          <span className="text-xs text-muted-foreground">{task.candidate}</span>
                        )}
                        <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])}
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        variant={task.status === "completed" ? "default" : "secondary"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {task.status === "completed" ? (
                          <span className="flex items-center gap-0.5">
                            <Check className="h-2.5 w-2.5" /> Done
                          </span>
                        ) : (
                          "Pending"
                        )}
                      </Badge>
                      {task.voiceCreated && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary animate-shimmer">
                          <Mic className="mr-0.5 h-2.5 w-2.5" />
                          Voice
                        </Badge>
                      )}
                    </div>
                    {!compact && (
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditDialog(task)}
                          aria-label={`Edit ${task.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Update the task details below." : "Fill in the details to create a new HR task."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="taskTitle">Task Title</label>
              <Input
                id="taskTitle"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter task title"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="taskCandidate">
                Related Candidate (optional)
              </label>
              <Input
                id="taskCandidate"
                value={formCandidate}
                onChange={(e) => setFormCandidate(e.target.value)}
                placeholder="Candidate name"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="taskDueDate">Due Date</label>
                <Input
                  id="taskDueDate"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as "high" | "medium" | "low")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v as HRTask["category"])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview">Interview Tasks</SelectItem>
                  <SelectItem value="compliance">Compliance Tasks</SelectItem>
                  <SelectItem value="follow-up">Follow-ups</SelectItem>
                  <SelectItem value="voice">Voice Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formTitle.trim()}>
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
