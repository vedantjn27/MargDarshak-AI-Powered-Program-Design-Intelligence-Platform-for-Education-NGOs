"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Lightbulb } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { workflow, workflowPages, hasPageData } from "@/lib/workflow"
import { Button } from "@/components/ui/button"

export function WorkflowGuide() {
  const pathname = usePathname()
  const { language } = useLanguage()
  const snapshot = useAppStore((state) => state.lfaSnapshot) as Record<string, any>
  const pageIndex = workflowPages.findIndex((page) => page.href === pathname)
  if (pageIndex < 0) return null

  const page = workflowPages[pageIndex]
  const stageIndex = workflow.findIndex((stage) => stage.pages.some((item) => item.href === pathname))
  const stage = workflow[stageIndex]
  const next = workflowPages[pageIndex + 1]
  const previous = workflowPages[pageIndex - 1]

  return <section className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-5" aria-label={language === "hi" ? "कार्यक्रम मार्गदर्शिका" : "Program guide"}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{language === "hi" ? "चरण" : "Stage"} {stageIndex + 1} / {workflow.length} · {language === "hi" ? stage.hi : stage.en}</p>
      <div className="flex items-center gap-1.5" aria-label={language === "hi" ? "चरणों की प्रगति" : "Stage progress"}>
        {workflow.map((item, index) => <span key={item.en} className={`h-2 w-8 rounded-full ${index === stageIndex ? "bg-primary" : index < stageIndex ? "bg-primary/40" : "bg-muted-foreground/20"}`} title={language === "hi" ? item.hi : item.en} />)}
      </div>
    </div>
    <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold">{language === "hi" ? page.hi : page.en}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{language === "hi" ? page.purposeHi : page.purposeEn}</p>
        <p className="mt-3 flex items-start gap-2 text-sm"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong>{language === "hi" ? "अब करें:" : "Your task:"}</strong> {language === "hi" ? page.actionHi : page.actionEn}</span></p>
      </div>
      {page.snapshotKey && <span className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
        {hasPageData(snapshot, page) ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
        {hasPageData(snapshot, page) ? (language === "hi" ? "विवरण सहेजे गए" : "Details saved") : (language === "hi" ? "अभी पूरा नहीं" : "Not complete yet")}
      </span>}
    </div>
    <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
      {previous && <Button asChild size="sm" variant="outline"><Link href={previous.href}><ArrowLeft className="mr-1 h-4 w-4" />{language === "hi" ? previous.hi : previous.en}</Link></Button>}
      <Button asChild size="sm" variant="ghost"><Link href="/dashboard">{language === "hi" ? "पूरी योजना देखें" : "View program workspace"}</Link></Button>
      {next && <Button asChild size="sm" variant="outline" className="ml-auto"><Link href={next.href}>{language === "hi" ? next.hi : next.en}<ArrowRight className="ml-1 h-4 w-4" /></Link></Button>}
    </div>
  </section>
}
