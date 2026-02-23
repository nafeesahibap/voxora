"use client"

import { CalendarClock, ListTodo, Users, Briefcase } from "lucide-react"
import { MetricCard } from "@/components/hr/metric-card"
import { TaskListPanel } from "@/components/hr/task-list-panel"
import { UpcomingInterviewsPanel } from "@/components/hr/upcoming-interviews-panel"
import { PipelinePanel } from "@/components/hr/pipeline-panel"
import { useHR } from "@/lib/hr-store"
import { PageTransition, FadeIn } from "@/lib/animations"

export default function DashboardPage() {
  const { metrics } = useHR()

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Today's Interviews"
            value={metrics.todayInterviews}
            subtitle="Scheduled for today"
            icon={CalendarClock}
            trend={{ value: 12, label: "vs last week" }}
            index={0}
          />
          <MetricCard
            title="Pending HR Tasks"
            value={metrics.pendingTasks}
            subtitle="Tasks due this week"
            icon={ListTodo}
            trend={{ value: -5, label: "vs last week" }}
            index={1}
          />
          <MetricCard
            title="Active Candidates"
            value={metrics.activeCandidates}
            subtitle="2 new this week"
            icon={Users}
            trend={{ value: 18, label: "vs last week" }}
            index={2}
          />
          <MetricCard
            title="Open Positions"
            value={metrics.openPositions}
            subtitle="Currently hiring"
            icon={Briefcase}
            trend={{ value: 0, label: "unchanged" }}
            index={3}
          />
        </div>

        {/* Task List */}
        <FadeIn delay={0.2}>
          <TaskListPanel compact />
        </FadeIn>

        {/* Interviews & Pipeline */}
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.3}>
            <UpcomingInterviewsPanel compact />
          </FadeIn>
          <FadeIn delay={0.35}>
            <PipelinePanel />
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  )
}
