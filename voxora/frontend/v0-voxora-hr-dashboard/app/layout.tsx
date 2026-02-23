import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { HRProvider } from "@/lib/hr-store"
import { DashboardShell } from "@/components/hr/dashboard-shell"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Voxora - HR Command Center",
  description: "Enterprise HR management suite for modern teams. Manage candidates, interviews, tasks, and hiring workflows.",
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <HRProvider>
          <DashboardShell>{children}</DashboardShell>
          <Toaster position="bottom-right" richColors />
        </HRProvider>
      </body>
    </html>
  )
}
