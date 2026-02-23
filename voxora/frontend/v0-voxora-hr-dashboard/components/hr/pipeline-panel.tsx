"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHR } from "@/lib/hr-store"
import { useCountUp, AnimatedProgress } from "@/lib/animations"

function PipelineStageRow({ name, count, maxCount, index }: { name: string; count: number; maxCount: number; index: number }) {
  const animatedCount = useCountUp(count, 800)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">{animatedCount}</span>
      </div>
      <AnimatedProgress value={(count / maxCount) * 100} delay={0.2 + index * 0.1} />
    </motion.div>
  )
}

export function PipelinePanel() {
  const { pipelineStages } = useHR()
  const maxCount = Math.max(...pipelineStages.map((s) => s.count))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Hiring Pipeline Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-4">
          {pipelineStages.map((stage, i) => (
            <PipelineStageRow
              key={stage.name}
              name={stage.name}
              count={stage.count}
              maxCount={maxCount}
              index={i}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
