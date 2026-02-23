"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  ListTodo,
  BarChart3,
  Mic,
  MicOff,
  X,
  Hexagon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useHR } from "@/lib/hr-store"
import { toast } from "sonner"

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Interviews", href: "/interviews", icon: CalendarClock },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Reports", href: "/reports", icon: BarChart3 },
]

type VoiceStatus = "standby" | "listening" | "processing"

const voiceMessages: Record<VoiceStatus, string> = {
  standby: "Tap to speak",
  listening: "Listening...",
  processing: "Processing...",
}

const mockVoiceTasks = [
  "Follow up with Rachel Torres about DevOps role",
  "Send feedback form to Sarah Chen",
  "Schedule team sync for interview panel",
  "Review compliance checklist for Q1",
  "Prepare onboarding docs for new hires",
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { addTask } = useHR()
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("standby")

  const handleMicClick = useCallback(() => {
    if (voiceStatus !== "standby") return

    setVoiceStatus("listening")

    setTimeout(() => {
      setVoiceStatus("processing")

      setTimeout(() => {
        const randomTask = mockVoiceTasks[Math.floor(Math.random() * mockVoiceTasks.length)]
        addTask({
          title: randomTask,
          dueDate: "2026-02-14",
          priority: "medium",
          status: "pending",
          voiceCreated: true,
          category: "voice",
        })
        setVoiceStatus("standby")
        toast.success("Voice task created", {
          description: randomTask,
        })
      }, 1500)
    }, 2000)
  }, [voiceStatus, addTask])

  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden
          />
        )}
      </AnimatePresence>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card text-card-foreground transition-transform duration-300 ease-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Logo area */}
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-1">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Hexagon className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">Voxora</h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              HR Command Center
            </p>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="mx-4 mt-6 flex flex-col items-center rounded-xl border border-border bg-muted/50 px-4 py-5">
          {/* Avatar with animated states */}
          <div className="relative">
            {/* Pulse ring for listening state */}
            <AnimatePresence>
              {voiceStatus === "listening" && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
            <motion.div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors duration-300",
                voiceStatus === "standby" && "border-muted-foreground/30 bg-muted",
                voiceStatus === "listening" && "border-primary bg-primary/10",
                voiceStatus === "processing" && "border-accent-foreground/40 bg-accent"
              )}
              animate={
                voiceStatus === "standby"
                  ? { scale: [1, 1.02, 1] }
                  : voiceStatus === "listening"
                    ? { scale: [1, 1.05, 1] }
                    : { rotate: [0, 3, -3, 0] }
              }
              transition={
                voiceStatus === "standby"
                  ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  : voiceStatus === "listening"
                    ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <svg viewBox="0 0 40 40" className="h-10 w-10">
                <circle cx="20" cy="14" r="6" className="fill-muted-foreground/60" />
                <path d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12" className="fill-muted-foreground/40" />
              </svg>
            </motion.div>
          </div>

          <p className="mt-3 text-center text-sm leading-snug text-muted-foreground">
            Hi! Ready to help with your HR tasks?
          </p>

          {/* Mic button with glow */}
          <motion.div className="mt-3" whileTap={{ scale: 0.9 }}>
            <Button
              variant={voiceStatus === "listening" ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full transition-all duration-300",
                voiceStatus === "listening" && "animate-voice-glow"
              )}
              onClick={handleMicClick}
              disabled={voiceStatus === "processing"}
              aria-label={voiceStatus === "standby" ? "Start voice input" : "Voice input active"}
            >
              {voiceStatus === "listening" ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </motion.div>

          {/* Voice status with animated transition */}
          <AnimatePresence mode="wait">
            <motion.span
              key={voiceStatus}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "mt-2 flex items-center gap-1.5 text-xs font-medium",
                voiceStatus === "standby" && "text-muted-foreground",
                voiceStatus === "listening" && "text-primary",
                voiceStatus === "processing" && "text-muted-foreground"
              )}
            >
              {voiceStatus === "listening" && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-blink-dot" />
              )}
              {voiceStatus === "processing" && (
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
              {voiceMessages[voiceStatus]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Navigation with active indicator */}
        <nav className="mt-6 flex-1 px-3">
          <ul className="flex flex-col gap-1" role="list">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute inset-0 rounded-lg bg-primary"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-[11px] text-muted-foreground">Voxora HR Suite v2.4</p>
        </div>
      </aside>
    </>
  )
}
