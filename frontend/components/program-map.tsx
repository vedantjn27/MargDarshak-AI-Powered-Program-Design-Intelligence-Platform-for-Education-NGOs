"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { presentableText } from "@/lib/presentation"

type MapItem = { en: string; hi: string; href: string; value?: string }

export function ProgramMap({ snapshot }: { snapshot: Record<string, any> }) {
  const { language } = useLanguage()
  const firstIndicator = Object.values(snapshot.indicators?.outcome_indicators || {})[0]
  const items: MapItem[] = [
    { en: "Problem", hi: "समस्या", href: "/dashboard/problem", value: snapshot.problem_definition?.core_problem },
    { en: "Likely causes", hi: "संभावित कारण", href: "/dashboard/problem", value: snapshot.problem_tree?.root_causes?.map((cause: unknown) => presentableText(cause, language)).join(" · ") },
    { en: "Student outcome", hi: "छात्र परिणाम", href: "/dashboard/outcomes", value: snapshot.outcomes?.outcome_statement || snapshot.outcomes?.smart_outcomes?.[0] },
    { en: "Chosen methods", hi: "चुनी हुई पद्धतियाँ", href: "/dashboard/methodology", value: snapshot.methodology?.selected?.join(" · ") },
    { en: "Theory of change", hi: "परिवर्तन का सिद्धांत", href: "/dashboard/theory-of-change", value: snapshot.theory_of_change?.activities?.[0] && snapshot.theory_of_change?.outcomes?.[0] ? `${snapshot.theory_of_change.activities[0]} → ${snapshot.theory_of_change.outcomes[0]}` : undefined },
    { en: "Practice changes", hi: "अभ्यास में बदलाव", href: "/dashboard/stakeholders", value: Object.keys(snapshot.practice_changes || {}).length ? `${Object.keys(snapshot.practice_changes).length} ${language === "hi" ? "हितधारक" : "stakeholders"}` : undefined },
    { en: "Measurement", hi: "मापन", href: "/dashboard/indicators", value: typeof firstIndicator === "string" ? firstIndicator : undefined },
  ]

  return <Card>
    <CardHeader>
      <CardTitle>{language === "hi" ? "आपके कार्यक्रम का मानचित्र" : "Your program map"}</CardTitle>
      <CardDescription>{language === "hi" ? "हर कड़ी मौजूदा संगठन और विषय के सहेजे गए काम से आती है। किसी कड़ी पर जाकर उसे सुधारें।" : "Each link reflects saved work for this organization and theme. Open any card to improve it."}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => <Link href={item.href} key={item.en} className="group rounded-xl border bg-background p-4 transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{index + 1}. {language === "hi" ? item.hi : item.en}</span>
            {item.value ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <CircleDashed className="h-4 w-4" />}
          </div>
          <p className={`mt-3 line-clamp-3 min-h-12 text-sm ${item.value ? "font-medium" : "text-muted-foreground"}`}>{item.value ? presentableText(item.value, language) : (language === "hi" ? "इसे जोड़ने के लिए खोलें" : "Open to add this link")}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">{language === "hi" ? "खोलें" : "Open"}<ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" /></span>
        </Link>)}
      </div>
      {items.some((item, index) => index > 0 && item.value && !items[index - 1].value) && <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
        {language === "hi" ? "कुछ बाद के भाग भरे गए हैं, लेकिन पहले की कड़ी खाली है। निर्यात से पहले उसे जाँचें।" : "A later part is filled while an earlier link is missing. Review that gap before export."}
      </p>}
    </CardContent>
  </Card>
}
