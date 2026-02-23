"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  type HRTask,
  type Candidate,
  type Interview,
  initialTasks,
  initialCandidates,
  initialInterviews,
  pipelineStages as initialPipeline,
  reportData,
} from "./hr-data"

interface HRState {
  tasks: HRTask[]
  candidates: Candidate[]
  interviews: Interview[]
  pipelineStages: typeof initialPipeline
  reportData: typeof reportData
  metrics: { todayInterviews: number; pendingTasks: number; activeCandidates: number; openPositions: number }
  addTask: (task: Omit<HRTask, "id">) => void
  updateTask: (id: string, updates: Partial<HRTask>) => void
  deleteTask: (id: string) => void
  addCandidate: (candidate: Omit<Candidate, "id">) => void
  updateCandidate: (id: string, updates: Partial<Candidate>) => void
  addInterview: (interview: Omit<Interview, "id">) => void
  updateInterview: (id: string, updates: Partial<Interview>) => void
}

const HRContext = createContext<HRState | null>(null)

export function HRProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<HRTask[]>(initialTasks)
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews)

  const addTask = useCallback((task: Omit<HRTask, "id">) => {
    setTasks((prev) => [...prev, { ...task, id: `t${Date.now()}` }])
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<HRTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addCandidate = useCallback((candidate: Omit<Candidate, "id">) => {
    setCandidates((prev) => [...prev, { ...candidate, id: `c${Date.now()}` }])
  }, [])

  const updateCandidate = useCallback((id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }, [])

  const addInterview = useCallback((interview: Omit<Interview, "id">) => {
    setInterviews((prev) => [...prev, { ...interview, id: `i${Date.now()}` }])
  }, [])

  const updateInterview = useCallback((id: string, updates: Partial<Interview>) => {
    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
  }, [])

  const metrics = {
    todayInterviews: interviews.filter((i) => i.date === "2026-02-13").length,
    pendingTasks: tasks.filter((t) => t.status === "pending").length,
    activeCandidates: candidates.filter((c) => c.status !== "hired" && c.status !== "rejected").length,
    openPositions: 8,
  }

  return (
    <HRContext.Provider
      value={{
        tasks,
        candidates,
        interviews,
        pipelineStages: initialPipeline,
        reportData,
        metrics,
        addTask,
        updateTask,
        deleteTask,
        addCandidate,
        updateCandidate,
        addInterview,
        updateInterview,
      }}
    >
      {children}
    </HRContext.Provider>
  )
}

export function useHR() {
  const ctx = useContext(HRContext)
  if (!ctx) throw new Error("useHR must be used within HRProvider")
  return ctx
}
