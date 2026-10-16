"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { workflow } from "@/lib/workflow"
import { authApi } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  Target,
  Workflow,
  Network,
  Users,
  BarChart3,
  CheckCircle2,
  Download,
  BookTemplate as FileTemplate,
  Menu,
  ChevronRight,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react"

const pageIcons: Record<string, typeof LayoutDashboard> = {
  "/dashboard/problem": AlertTriangle,
  "/dashboard/outcomes": Target,
  "/dashboard/methodology": Workflow,
  "/dashboard/theory-of-change": Network,
  "/dashboard/stakeholders": Users,
  "/dashboard/indicators": BarChart3,
  "/dashboard/quality": CheckCircle2,
  "/dashboard/export": Download,
  "/dashboard/templates": FileTemplate,
}

interface SidebarNavProps {
  className?: string
  onNavigate?: () => void
}

export function SidebarNav({ className, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()

  const signOut = async () => {
    try {
      await authApi.logout()
      useAppStore.getState().resetState()
      onNavigate?.()
      router.replace("/auth")
    } catch {
      toast.error(language === "hi" ? "साइन आउट नहीं हो सका। फिर प्रयास करें।" : "Could not sign out. Please try again.")
    }
  }

  const navLink = (href: string, label: string, Icon: typeof LayoutDashboard) => {
    const active = pathname === href
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={onNavigate}>
      <Button variant={active ? "secondary" : "ghost"} className={cn("h-10 w-full justify-start gap-3", active && "bg-primary/10 text-primary hover:bg-primary/15")}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
        {active && <ChevronRight className="ml-auto h-4 w-4" />}
      </Button>
    </Link>
  }

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navLink("/dashboard", language === "hi" ? "कार्यक्रम कार्यस्थल" : "Program workspace", LayoutDashboard)}
      {workflow.map((stage, index) => <div key={stage.en} className="mt-4 space-y-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{index + 1}. {language === "hi" ? stage.hi : stage.en}</p>
        {stage.pages.map((page) => navLink(page.href, language === "hi" ? page.hi : page.en, pageIcons[page.href]))}
      </div>)}

      <Separator className="my-4" />
      {navLink("/dashboard/organization", language === "hi" ? "संगठन पंजीकरण" : "Organization", Building2)}
      {navLink("/dashboard/settings", language === "hi" ? "सेटिंग्स" : "Settings", Settings)}

        <Button type="button" onClick={signOut}
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>{language === "en" ? "Sign out" : "साइन आउट"}</span>
        </Button>
    </nav>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const { t, language } = useLanguage()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">{language === "en" ? "MargDarshak" : "मार्गदर्शक"}</span>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
