"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { presentableText } from "@/lib/presentation"
import type { SmartValidation } from "@/lib/api"

const names: Record<string, { letter: string; en: string; hi: string }> = {
  specific: { letter: "S", en: "Specific", hi: "विशिष्ट" },
  measurable: { letter: "M", en: "Measurable", hi: "मापनीय" },
  achievable: { letter: "A", en: "Achievable", hi: "प्राप्त करने योग्य" },
  relevant: { letter: "R", en: "Relevant", hi: "प्रासंगिक" },
  time_bound: { letter: "T", en: "Time-bound", hi: "समयबद्ध" },
}

export function SmartValidationCard({ validation, language, recheckFailed }: {
  validation: SmartValidation
  language: string
  recheckFailed: boolean
}) {
  const criteria = validation.criteria
  return <Card>
    <CardHeader>
      <CardTitle className="flex flex-wrap items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="cursor-help underline decoration-dotted underline-offset-4" aria-label="SMART: Specific, Measurable, Achievable, Relevant, Time-bound">SMART</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm p-3 text-sm">
            <p className="font-semibold">{language === "hi" ? "SMART का पूरा अर्थ" : "SMART means"}</p>
            <p>{language === "hi" ? "विशिष्ट (Specific), मापनीय (Measurable), प्राप्त करने योग्य (Achievable), प्रासंगिक (Relevant), समयबद्ध (Time-bound)" : "Specific, Measurable, Achievable, Relevant, Time-bound"}</p>
          </TooltipContent>
        </Tooltip>
        <span>{language === "hi" ? "मान्यता" : "Validation"}</span>
        {criteria && <Badge variant={validation.is_valid ? "default" : "secondary"}>{validation.smart_score}/5</Badge>}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {criteria ? <>
        <Progress value={validation.smart_score * 20} className="h-3" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {criteria.map((criterion) => {
            const name = names[criterion.key]
            return <div key={criterion.key} className={`rounded-lg border p-3 ${criterion.passed ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {criterion.passed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <AlertCircle className="h-4 w-4 shrink-0 text-warning" />}
                <span>{name?.letter} — {language === "hi" ? name?.hi : name?.en}</span>
              </div>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">{presentableText(criterion.reason, language)}</p>
            </div>
          })}
        </div>
        <p className="mt-4 text-sm font-medium">{validation.is_valid ? (language === "hi" ? "SMART लक्ष्य स्पष्ट रूप से लिखा गया है।" : "The SMART goal is clearly written.") : (language === "hi" ? "ऊपर बताए गए भागों को सुधारें।" : "Improve the criteria marked above.")}</p>
        {validation.note && <p className="mt-2 text-xs text-muted-foreground">{presentableText(validation.note, language)}</p>}
      </> : <p className="text-sm text-muted-foreground">{recheckFailed ? (language === "hi" ? "पुरानी जाँच को अपडेट नहीं किया जा सका। कृपया परिणाम फिर से बनाएँ।" : "Could not update the previous assessment. Please create the outcome again.") : (language === "hi" ? "पुरानी SMART जाँच को नए नियमों से अपडेट किया जा रहा है…" : "Updating the previous SMART assessment with the new criteria…")}</p>}
    </CardContent>
  </Card>
}
