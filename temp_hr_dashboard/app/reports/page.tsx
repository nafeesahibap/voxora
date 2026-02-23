"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, TrendingUp, Clock, CheckCircle, BarChart3, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useHR } from "@/lib/hr-store"
import { MetricCard } from "@/components/hr/metric-card"
import { toast } from "sonner"
import { PageTransition, FadeIn, AnimatedProgress, useCountUp } from "@/lib/animations"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

function ConversionRow({ label, value, delay }: { label: string; value: number; delay: number }) {
  const animated = useCountUp(Math.round(value * 10) / 10, 900)
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">{animated / 10 || value}%</span>
      </div>
      <AnimatedProgress value={value} delay={delay} className="mt-1.5" />
    </div>
  )
}

function TimeRow({ stage, days, max, delay }: { stage: string; days: number; max: number; delay: number }) {
  const animatedDays = useCountUp(days, 800)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{stage}</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">{animatedDays}d</span>
      </div>
      <AnimatedProgress value={(days / max) * 100} delay={delay} />
    </div>
  )
}

export default function ReportsPage() {
  const { reportData } = useHR()
  const [downloading, setDownloading] = useState(false)

  const pieData = [
    { name: "Completed", value: reportData.taskCompletionRate },
    { name: "Remaining", value: 100 - reportData.taskCompletionRate },
  ]

  const pieColors = ["hsl(215, 80%, 48%)", "hsl(220, 14%, 94%)"]

  function handleDownload() {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      toast.success("Report downloaded successfully")
    }, 1500)
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Hiring Reports</h2>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-4 w-4" />
              )}
              {downloading ? "Downloading..." : "Download Report"}
            </Button>
          </motion.div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Conversion Rate"
            value={`${reportData.conversionRate}%`}
            subtitle="Application to hire"
            icon={TrendingUp}
            trend={{ value: 3.2, label: "vs last month" }}
            index={0}
          />
          <MetricCard
            title="Task Completion"
            value={`${reportData.taskCompletionRate}%`}
            subtitle="This month"
            icon={CheckCircle}
            trend={{ value: 5, label: "vs last month" }}
            index={1}
          />
          <MetricCard
            title="Avg. Time to Hire"
            value={`${reportData.avgTimeToHire}d`}
            subtitle="Days from application"
            icon={Clock}
            trend={{ value: -8, label: "vs last month" }}
            index={2}
          />
          <MetricCard
            title="Total Hires"
            value={reportData.hiringPerformance.reduce((sum, m) => sum + m.hires, 0)}
            subtitle="Last 6 months"
            icon={BarChart3}
            trend={{ value: 12, label: "vs prior 6 months" }}
            index={3}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Hiring Performance</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.hiringPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }}
                      axisLine={{ stroke: "hsl(220, 13%, 90%)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }}
                      axisLine={{ stroke: "hsl(220, 13%, 90%)" }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 13%, 90%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px hsl(0, 0%, 0%, 0.08)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="applications"
                      name="Applications"
                      fill="hsl(215, 80%, 48%)"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                    <Bar
                      dataKey="hires"
                      name="Hires"
                      fill="hsl(160, 55%, 42%)"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      animationBegin={200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.25}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Task Completion Rate</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 13%, 90%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px hsl(0, 0%, 0%, 0.08)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Completed ({reportData.taskCompletionRate}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                    <span className="text-muted-foreground">Remaining ({100 - reportData.taskCompletionRate}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Conversion & Timeline */}
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.3}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Interview Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall conversion</span>
                  <span className="text-2xl font-bold tabular-nums text-foreground">{reportData.conversionRate}%</span>
                </div>
                <AnimatedProgress value={reportData.conversionRate} className="h-3" delay={0.4} />
                <div className="mt-6 flex flex-col gap-3">
                  <ConversionRow label="Phone Screen to On-site" value={53.6} delay={0.5} />
                  <ConversionRow label="On-site to Offer" value={33.3} delay={0.6} />
                  <ConversionRow label="Offer Acceptance Rate" value={60} delay={0.7} />
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.35}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Time-to-Hire Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average total time</span>
                  <span className="text-2xl font-bold tabular-nums text-foreground">{reportData.avgTimeToHire} days</span>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { stage: "Application to Screen", days: 3, max: 30 },
                    { stage: "Screen to Interview", days: 5, max: 30 },
                    { stage: "Interview to Decision", days: 8, max: 30 },
                    { stage: "Decision to Offer", days: 4, max: 30 },
                    { stage: "Offer to Start", days: 3, max: 30 },
                  ].map((item, i) => (
                    <TimeRow
                      key={item.stage}
                      stage={item.stage}
                      days={item.days}
                      max={item.max}
                      delay={0.4 + i * 0.1}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  )
}
