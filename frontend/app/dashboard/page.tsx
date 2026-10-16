"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { lfaApi, coachApi } from "@/lib/api"
import { ArrowRight, Building2, CheckCircle2, FileText, Target, Users } from "lucide-react"
import { workflow, workflowPages, hasPageData } from "@/lib/workflow"
import { ProgramMap } from "@/components/program-map"
import { CatalogCover } from "@/components/catalog-cover"
import { presentableText } from "@/lib/presentation"

const steps = [
  { key: "organization_profile", href: "/dashboard/organization", en: "Organization", hi: "संगठन" },
  { key: "problem_definition", href: "/dashboard/problem", en: "Problem definition", hi: "समस्या परिभाषा" },
  { key: "problem_tree", href: "/dashboard/problem", en: "Problem tree", hi: "समस्या वृक्ष" },
  { key: "outcomes", href: "/dashboard/outcomes", en: "Student outcomes", hi: "छात्र परिणाम" },
  { key: "methodology", href: "/dashboard/methodology", en: "Methodology", hi: "कार्यपद्धति" },
  { key: "theory_of_change", href: "/dashboard/theory-of-change", en: "Theory of change", hi: "परिवर्तन का सिद्धांत" },
  { key: "stakeholders", href: "/dashboard/stakeholders", en: "Stakeholders", hi: "हितधारक" },
  { key: "practice_changes", href: "/dashboard/stakeholders", en: "Practice changes", hi: "अभ्यास परिवर्तन" },
  { key: "indicators", href: "/dashboard/indicators", en: "Indicators", hi: "संकेतक" },
  { key: "indicator_baselines", href: "/dashboard/indicators", en: "Targets and baseline", hi: "लक्ष्य और आधार" },
]

export default function DashboardPage() {
  const { language } = useLanguage()
  const { currentOrganization, activeTheme, lfaSnapshot, problemStatements } = useAppStore()
  const [assessment, setAssessment] = useState<{ completeness: number; quality: number; sections: any[]; feedback: any[] }>({ completeness: 0, quality: 0, sections: [], feedback: [] })
  const [coach, setCoach] = useState<{ headline: string; advice: string; next_action: string; evidence_note: string } | null>(null)
  const [coachBusy, setCoachBusy] = useState(false)
  const snapshot = lfaSnapshot as Record<string, any>
  const focusKey = activeTheme || currentOrganization?.thematic_focus[0] || "fln"
  const focusName = focusKey.toLowerCase() === "fln"
    ? (language === "hi" ? "बुनियादी साक्षरता और संख्यात्मकता" : "Foundational Literacy and Numeracy")
    : focusKey.replaceAll("_", " ")

  useEffect(() => { setCoach(null) }, [activeTheme, currentOrganization?._id])

  useEffect(() => {
    if (!currentOrganization?._id) return
    let active = true
    Promise.all([
      lfaApi.getCompleteness({ organization_id: currentOrganization._id, lfa_snapshot: snapshot }),
      lfaApi.getQualityFeedback({ organization_id: currentOrganization._id, lfa_snapshot: snapshot }),
    ]).then(([complete, quality]) => {
      if (active) setAssessment({ completeness: complete.completion_percentage, quality: quality.quality_score, sections: complete.section_breakdown, feedback: quality.feedback_items })
    }).catch(() => { if (active) setAssessment({ completeness: 0, quality: 0, sections: [], feedback: [] }) })
    return () => { active = false }
  }, [currentOrganization?._id, lfaSnapshot])

  const nextStep = workflowPages.find((page) => page.snapshotKey && !hasPageData(snapshot, page)) || workflowPages.find((page) => page.href === "/dashboard/quality")!
  const stakeholderCount = Array.isArray(snapshot.stakeholders) ? snapshot.stakeholders.length : 0
  const outcomeCount = snapshot.outcomes?.smart_outcomes?.length || 0
  const askCoach = async () => {
    if (!currentOrganization) return
    setCoachBusy(true)
    try { setCoach(await coachApi.review(currentOrganization._id, snapshot, language)) }
    catch (error: any) { setCoach({ headline: language === "hi" ? "मार्गदर्शन उपलब्ध नहीं" : "Guidance unavailable", advice: error.message, next_action: "", evidence_note: "" }) }
    finally { setCoachBusy(false) }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{currentOrganization?.geography.state} · {focusName}</p>
            <h1 className="text-3xl font-bold tracking-tight">{currentOrganization?.organization_name}</h1>
            <p className="text-muted-foreground mt-1">{language === "hi" ? "आपके संगठन की कार्यक्रम डिज़ाइन प्रगति" : "Your organization's program design progress"}</p>
          </div>
          <Link href={nextStep.href}><Button>{language === "hi" ? `अगला: ${nextStep.hi}` : `Continue: ${nextStep.en}`}<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>

        <CatalogCover
          title={focusName}
          theme={focusKey}
          category={language === "hi" ? "आपका कार्यक्रम क्षेत्र" : "Your program focus"}
          className="rounded-2xl border border-border"
          imagePosition={focusKey.toLowerCase() === "fln" ? "52% 24%" : undefined}
          large
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title={language === "hi" ? "पूर्णता" : "Completeness"} value={`${assessment.completeness}%`} icon={<FileText className="h-5 w-5" />} />
          <StatCard title={language === "hi" ? "गुणवत्ता" : "Design quality"} value={`${assessment.quality}%`} icon={<CheckCircle2 className="h-5 w-5" />} />
          <StatCard title={language === "hi" ? "समस्याएँ और परिणाम" : "Problems and outcomes"} value={`${problemStatements.length} / ${outcomeCount}`} icon={<Target className="h-5 w-5" />} />
          <StatCard title={language === "hi" ? "हितधारक" : "Stakeholders"} value={String(stakeholderCount)} icon={<Users className="h-5 w-5" />} />
        </div>

        <section aria-label={language === "hi" ? "कार्यक्रम के चरण" : "Program stages"}>
          <div className="mb-4"><h2 className="text-2xl font-semibold">{language === "hi" ? "कार्यक्रम बनाने के पाँच चरण" : "Five stages to build your program"}</h2><p className="text-sm text-muted-foreground">{language === "hi" ? "किसी भी भाग को खोलें। प्रगति सहेजी गई जानकारी से आती है।" : "Open any section. Progress reflects saved information."}</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workflow.map((stage, index) => {
              const tracked = stage.pages.filter((page) => page.snapshotKey)
              const complete = tracked.filter((page) => hasPageData(snapshot, page)).length
              return <Card key={stage.en} className="h-full">
                <CardHeader><p className="text-xs font-semibold uppercase tracking-widest text-primary">{language === "hi" ? "चरण" : "Stage"} {index + 1} / {workflow.length}</p><CardTitle className="text-lg">{language === "hi" ? stage.hi : stage.en}</CardTitle><CardDescription>{language === "hi" ? stage.descriptionHi : stage.descriptionEn}</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {tracked.length > 0 && <div className="space-y-1"><p className="text-xs text-muted-foreground">{complete} / {tracked.length} {language === "hi" ? "भागों में विवरण सहेजे गए" : "sections with saved details"}</p><Progress value={complete / tracked.length * 100} /></div>}
                  {stage.pages.map((page) => <Link key={page.href} href={page.href} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:border-primary hover:bg-primary/5"><span>{language === "hi" ? page.hi : page.en}</span>{page.snapshotKey && (hasPageData(snapshot, page) ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />)}</Link>)}
                </CardContent>
              </Card>
            })}
          </div>
        </section>

        <ProgramMap snapshot={snapshot} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>{language === "hi" ? "डिज़ाइन के चरण" : "Design sections"}</CardTitle><CardDescription>{language === "hi" ? "सहेजे गए विवरणों के आधार पर" : "Calculated from your saved inputs"}</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              {steps.map((step) => {
                const result = assessment.sections.find((part) => part.section === step.key)
                const value = result ? Math.round(result.score / result.weight * 100) : 0
                return <Link key={step.key} href={step.href} className="block space-y-2 rounded-lg p-2 hover:bg-muted/60">
                  <div className="flex justify-between text-sm"><span>{language === "hi" ? step.hi : step.en}</span><span className="font-medium">{value}%</span></div>
                  <Progress value={value} />
                </Link>
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{language === "hi" ? "अगले सुधार" : "Next improvements"}</CardTitle><CardDescription>{language === "hi" ? "आपके वर्तमान डिज़ाइन पर आधारित" : "Based on this organization's design"}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {assessment.feedback.length ? assessment.feedback.slice(0, 5).map((item, index) => <div key={index} className="rounded-lg border bg-muted/30 p-4">
                <p className="font-medium">{presentableText(item.area, language)}</p><p className="text-sm text-muted-foreground">{presentableText(item.suggestion, language)}</p>
              </div>) : <p className="text-sm text-muted-foreground">{language === "hi" ? "अपने कार्यक्रम का विवरण जोड़ें और समीक्षा करें।" : "Add and review your program details to see tailored guidance."}</p>}
              <Link href="/dashboard/quality"><Button variant="outline" className="w-full">{language === "hi" ? "पूरी समीक्षा देखें" : "View full review"}</Button></Link>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader><CardTitle>{language === "hi" ? "AI डिज़ाइन कोच" : "AI design coach"}</CardTitle><CardDescription>{language === "hi" ? "आपके संगठन की प्रगति और संदर्भ से अगला कदम" : "A next step grounded in your organization's work"}</CardDescription></CardHeader>
          <CardContent className="space-y-4"><Button onClick={askCoach} disabled={coachBusy}>{coachBusy ? (language === "hi" ? "विश्लेषण हो रहा है..." : "Reviewing...") : (language === "hi" ? "सलाह प्राप्त करें" : "Get tailored guidance")}</Button>
            {coach && <div className="rounded-xl border bg-background p-5 space-y-2"><h3 className="text-lg font-semibold">{presentableText(coach.headline, language)}</h3><p>{presentableText(coach.advice, language)}</p>{coach.next_action && <p className="font-medium text-primary">{presentableText(coach.next_action, language)}</p>}{coach.evidence_note && <p className="text-sm text-muted-foreground">{presentableText(coach.evidence_note, language)}</p>}</div>}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/dashboard/templates"><Card className="transition hover:border-primary"><CardContent className="flex items-center gap-4 p-6"><Building2 className="text-primary" /><span>{language === "hi" ? "अपने संगठन के लिए टेम्पलेट चुनें" : "Explore templates for your organization"}</span><ArrowRight className="ml-auto h-4 w-4" /></CardContent></Card></Link>
          <Link href="/dashboard/export"><Card className="transition hover:border-primary"><CardContent className="flex items-center gap-4 p-6"><FileText className="text-primary" /><span>{language === "hi" ? "अपना कार्यक्रम दस्तावेज़ बनाएँ" : "Create your program documents"}</span><ArrowRight className="ml-auto h-4 w-4" /></CardContent></Card></Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
