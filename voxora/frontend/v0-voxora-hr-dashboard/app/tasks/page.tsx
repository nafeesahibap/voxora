"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Pencil, Mic, Check, Filter, ListTodo } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { HRTask } from "@/lib/hr-data"
import { cn } from "@/lib/utils"
import { PageTransition } from "@/lib/animations"

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning-foreground))] border-[hsl(var(--warning))]/20",
  low: "bg-muted text-muted-foreground border-border",
}

const categoryLabels: Record<string, string> = {
  interview: "Interview Tasks",
  compliance: "Compliance Tasks",
  "follow-up": "Follow-ups",
  voice: "Voice Created",
}

type StatusFilter = "all" | "pending" | "completed"

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useHR()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<HRTask | null>(null)
  const [detailTask, setDetailTask] = useState<HRTask | null>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formCandidate, setFormCandidate] = useState("")
  const [formDueDate, setFormDueDate] = useState("2026-02-14")
  const [formPriority, setFormPriority] = useState<"high" | "medium" | "low">("medium")
  const [formCategory, setFormCategory] = useState<HRTask["category"]>("follow-up")

  function getFilteredTasks(category?: string) {
    return tasks.filter((t) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && t.status === "pending") ||
        (statusFilter === "completed" && t.status === "completed")
      const matchesCategory = !category || t.category === category
      return matchesStatus && matchesCategory
    })
  }

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

  function renderTaskList(taskList: HRTask[]) {
    if (taskList.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-8"
        >
          <ListTodo className="mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No tasks in this category</p>
        </motion.div>
      )
    }
    return (
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {taskList.map((task, i) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className={cn(
                "group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:shadow-sm",
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
              <button
                className="flex-1 min-w-0 text-left"
                onClick={() => setDetailTask(task)}
              >
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
              </button>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])}>
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
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(task)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Top Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button onClick={openAddDialog}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Task
              </Button>
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["all", "pending", "completed"] as StatusFilter[]).map((f) => (
              <Button
                key={f}
                variant={statusFilter === f ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 text-xs capitalize transition-all duration-200",
                  statusFilter === f && "shadow-sm"
                )}
                onClick={() => setStatusFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="follow-up">Follow-ups</TabsTrigger>
            <TabsTrigger value="voice">Voice Created</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  All Tasks ({getFilteredTasks().length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {renderTaskList(getFilteredTasks())}
              </CardContent>
            </Card>
          </TabsContent>

          {(["interview", "compliance", "follow-up", "voice"] as const).map((cat) => (
            <TabsContent key={cat} value={cat}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    {categoryLabels[cat]} ({getFilteredTasks(cat).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {renderTaskList(getFilteredTasks(cat))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Task Detail Dialog */}
        <Dialog open={!!detailTask} onOpenChange={(open) => !open && setDetailTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
              <DialogDescription>View and manage this task.</DialogDescription>
            </DialogHeader>
            {detailTask && (
              <div className="flex flex-col gap-3 py-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <p className="text-sm font-medium text-foreground">{detailTask.title}</p>
                </div>
                {detailTask.candidate && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Linked Candidate</label>
                    <p className="text-sm text-foreground">{detailTask.candidate}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                    <p className="text-sm text-foreground">{detailTask.dueDate}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Priority</label>
                    <Badge variant="outline" className={cn("mt-0.5 text-xs", priorityColors[detailTask.priority])}>
                      {detailTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <p className="text-sm text-foreground capitalize">{detailTask.status}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <p className="text-sm text-foreground">{categoryLabels[detailTask.category]}</p>
                </div>
                {detailTask.voiceCreated && (
                  <Badge variant="outline" className="w-fit border-primary/30 text-primary text-xs">
                    <Mic className="mr-1 h-3 w-3" />
                    Created via Voice
                  </Badge>
                )}
              </div>
            )}
            <DialogFooter>
              {detailTask && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateTask(detailTask.id, {
                        status: detailTask.status === "completed" ? "pending" : "completed",
                      })
                      setDetailTask(null)
                    }}
                  >
                    {detailTask.status === "completed" ? "Mark Pending" : "Mark Complete"}
                  </Button>
                  <Button onClick={() => setDetailTask(null)}>Close</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                <label className="text-sm font-medium text-foreground">Task Title</label>
                <Input
                  className="mt-1"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Related Candidate (optional)</label>
                <Input
                  className="mt-1"
                  value={formCandidate}
                  onChange={(e) => setFormCandidate(e.target.value)}
                  placeholder="Candidate name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Due Date</label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!formTitle.trim()}>
                {editingTask ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
