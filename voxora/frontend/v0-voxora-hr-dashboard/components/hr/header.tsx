"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/candidates": "Candidates",
  "/interviews": "Interviews",
  "/tasks": "Tasks",
  "/reports": "Reports",
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/candidates/")) return "Candidate Profile"
  if (pathname.startsWith("/interviews/")) return "Interview Details"
  return pageTitles[pathname] || "Dashboard"
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const [time, setTime] = useState(new Date())
  const [scrolled, setScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  // Live clock updating every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Detect scroll for shadow
  useEffect(() => {
    const main = document.querySelector("main")
    if (!main) return
    const handler = () => setScrolled(main.scrollTop > 4)
    main.addEventListener("scroll", handler, { passive: true })
    return () => main.removeEventListener("scroll", handler)
  }, [])

  const formatted = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const timeStr = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 transition-shadow duration-300 lg:px-6",
        scrolled && "shadow-[0_1px_8px_hsl(var(--foreground)/0.06)]"
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <AnimatePresence mode="wait">
          <motion.h2
            key={pathname}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-semibold text-foreground"
          >
            {getPageTitle(pathname)}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        {/* Search with focus animation */}
        <motion.div
          className="relative hidden md:block"
          animate={{ width: searchFocused ? 300 : 256 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Search className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200",
            searchFocused ? "text-primary" : "text-muted-foreground"
          )} />
          <Input
            placeholder="Search candidates, tasks..."
            className={cn(
              "pl-9 transition-all duration-200",
              searchFocused && "ring-2 ring-primary/20"
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </motion.div>

        {/* Date & Time - smooth number change */}
        <div className="hidden text-right text-sm lg:block">
          <p className="font-medium tabular-nums text-foreground">{timeStr}</p>
          <p className="text-xs text-muted-foreground">{formatted}</p>
        </div>

        {/* Notifications with ping */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive animate-notification-ping" />
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">MC</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium leading-tight text-foreground">Megan Cole</p>
                <p className="text-xs text-muted-foreground">HR Director</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
            <DropdownMenuItem>My Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
