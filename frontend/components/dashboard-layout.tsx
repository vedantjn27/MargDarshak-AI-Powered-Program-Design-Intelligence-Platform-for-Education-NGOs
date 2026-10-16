"use client"

import type React from "react"

import { Header } from "./header"
import { SidebarNav } from "./sidebar-nav"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BackgroundEffects } from "./background-effects"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "./language-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { WorkflowGuide } from "./workflow-guide"
import { authApi } from "@/lib/api"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const organization = useAppStore((state) => state.currentOrganization)
  const activeTheme = useAppStore((state) => state.activeTheme)
  const setActiveTheme = useAppStore((state) => state.setActiveTheme)
  const setCurrentOrganization = useAppStore((state) => state.setCurrentOrganization)
  const { language } = useLanguage()
  const [ready, setReady] = useState(false)
  const [verifiedPath, setVerifiedPath] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    setReady(useAppStore.persist.hasHydrated())
    return useAppStore.persist.onFinishHydration(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    authApi.me().then((session) => {
      if (cancelled) return
      if (useAppStore.getState().currentOrganization?._id !== session.organization?._id) {
        setCurrentOrganization(session.organization)
      }
      setRegistered(Boolean(session.organization))
      if (!session.organization && pathname !== "/dashboard/organization") {
        router.replace("/dashboard/organization")
      } else {
        setVerifiedPath(pathname)
      }
    }).catch(() => {
      if (cancelled) return
      useAppStore.getState().resetState()
      router.replace("/auth")
    })
    return () => { cancelled = true }
  }, [ready, pathname, router, setCurrentOrganization])

  if (!ready || verifiedPath !== pathname || (pathname !== "/dashboard/organization" && !registered)) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{language === "hi" ? "संगठन प्रोफ़ाइल खोल रहे हैं..." : "Opening organization registration..."}</div>
  }
  if (!registered) {
    return <div className="relative min-h-screen bg-background">
      <BackgroundEffects variant="dashboard" />
      <Header />
      <div className="relative z-10 mx-auto flex max-w-5xl justify-end px-4 pt-4 md:px-8"><Button variant="outline" onClick={async () => { try { await authApi.logout(); useAppStore.getState().resetState(); router.replace("/auth") } catch { toast.error(language === "hi" ? "साइन आउट नहीं हो सका" : "Could not sign out") } }}>{language === "hi" ? "साइन आउट" : "Sign out"}</Button></div>
      <main className="relative z-10 mx-auto max-w-5xl p-4 py-8 md:p-8">{children}</main>
    </div>
  }
  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundEffects variant="dashboard" />

      <Header />
      {organization && <div className="relative z-10 flex items-center justify-between gap-4 border-b bg-background/85 px-4 py-2 text-sm backdrop-blur-sm">
        <span className="truncate font-medium">{organization.organization_name}</span>
        {organization.thematic_focus.length > 1 && <Select value={activeTheme || organization.thematic_focus[0]} onValueChange={(theme) => { setActiveTheme(theme); router.push("/dashboard") }}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>{organization.thematic_focus.map((theme) => <SelectItem key={theme} value={theme}>{theme.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
        </Select>}
      </div>}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-sidebar/95 backdrop-blur-sm md:flex">
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary animate-pulse-glow">
                <Sparkles className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground text-sm">MargDarshak</span>
                <span className="text-[10px] text-sidebar-foreground/60">From Blank Page to Blueprint</span>
              </div>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-3 py-4">
            <SidebarNav />
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8"><WorkflowGuide />{children}</div>
        </main>
      </div>
    </div>
  )
}
