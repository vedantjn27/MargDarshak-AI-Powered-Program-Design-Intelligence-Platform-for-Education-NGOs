"use client"

import { ArrowRight, CalendarDays, ClipboardCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { presentableText } from "@/lib/presentation"

interface Milestone {
  month: number
  title: string
  action: string
  measure: string
}

export function OutcomeTimeline({ milestones, baseline, target, months, language }: {
  milestones: Milestone[]
  baseline: number
  target: number
  months: number
  language: string
}) {
  const ordered = [...milestones].sort((left, right) => left.month - right.month)

  return <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background">
    <CardHeader className="gap-2 border-b bg-background/60 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <CardTitle className="flex items-center gap-2 text-xl"><CalendarDays className="h-5 w-5 text-primary" />{language === "hi" ? "परिणाम की समयरेखा" : "Outcome timeline"}</CardTitle>
        <CardDescription className="mt-1">{language === "hi" ? "हर चरण की गतिविधि और जाँचने का प्रमाण; यह नियोजित कार्य है, हासिल की गई प्रगति नहीं।" : "A planned sequence of actions and evidence checks, not recorded progress."}</CardDescription>
      </div>
      <div className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm shadow-sm">
        <div><p className="text-xs text-muted-foreground">{language === "hi" ? "आधार" : "Baseline"}</p><p className="text-lg font-bold">{baseline}%</p></div>
        <ArrowRight className="h-5 w-5 text-primary" />
        <div><p className="text-xs text-muted-foreground">{language === "hi" ? "लक्ष्य" : "Target"}</p><p className="text-lg font-bold text-primary">{target}%</p></div>
        <Badge variant="secondary" className="ml-1">{months} {language === "hi" ? "महीने" : "months"}</Badge>
      </div>
    </CardHeader>
    <CardContent className="pt-7">
      <div className="overflow-x-auto pb-4">
        <ol className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(ordered.length, 1)}, minmax(250px, 1fr))`, minWidth: `${Math.max(ordered.length, 1) * 258}px` }}>
          {ordered.map((milestone, index) => <li key={`${milestone.month}-${index}`} className="relative flex h-full flex-col rounded-xl border border-primary/20 bg-background p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
              <Badge variant="outline">{language === "hi" ? "माह" : "Month"} {milestone.month}</Badge>
            </div>
            <h3 className="text-base font-semibold leading-snug">{presentableText(milestone.title, language)}</h3>
            <p className="mt-3 flex-1 text-sm leading-6">{presentableText(milestone.action, language)}</p>
            <div className="mt-5 rounded-lg bg-primary/5 p-3 text-sm">
              <p className="mb-1 flex items-center gap-1 font-semibold text-primary"><ClipboardCheck className="h-4 w-4" />{language === "hi" ? "क्या जाँचें" : "Evidence to check"}</p>
              <p className="leading-5 text-muted-foreground">{presentableText(milestone.measure, language)}</p>
            </div>
          </li>)}
        </ol>
      </div>
    </CardContent>
  </Card>
}
