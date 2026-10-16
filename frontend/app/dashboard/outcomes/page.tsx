"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { OutcomeTimeline } from "@/components/outcome-timeline"
import { SmartValidationCard } from "@/components/smart-validation-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { outcomesApi } from "@/lib/api"
import { normalizeOutcomeTimeline, presentableText } from "@/lib/presentation"
import { toast } from "sonner"
import { Target, Sparkles, Loader2, CheckCircle2, TrendingUp, Calendar } from "lucide-react"

const gradeRanges = [
  { value: "pre-primary", label: "Pre-Primary", labelHi: "पूर्व-प्राथमिक" },
  { value: "1-3", label: "Grades 1-3", labelHi: "कक्षा 1-3" },
  { value: "3-5", label: "Grades 3-5", labelHi: "कक्षा 3-5" },
  { value: "6-8", label: "Grades 6-8", labelHi: "कक्षा 6-8" },
  { value: "9-10", label: "Grades 9-10", labelHi: "कक्षा 9-10" },
  { value: "11-12", label: "Grades 11-12", labelHi: "कक्षा 11-12" },
]

export default function OutcomesPage() {
  const { language, t } = useLanguage()
  const { currentOrganization, activeTheme, addStudentOutcome, studentOutcomes, updateLatestOutcomeValidation, updateLFASnapshot, lfaSnapshot } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [storedOutcome, setCurrentOutcome] = useState<any>(null)
  const currentOutcome = storedOutcome ? normalizeOutcomeTimeline(storedOutcome, language) : null
  const [recheckFailed, setRecheckFailed] = useState(false)

  useEffect(() => { setCurrentOutcome(studentOutcomes.at(-1) || null) }, [studentOutcomes])

  const [formData, setFormData] = useState({
    grade_range: "",
    outcome_statement: "",
    baseline_value: 0,
    target_value: 0,
    timeline_months: 12,
  })

  const outcomeStatement = currentOutcome?.outcome_statement || lfaSnapshot.outcomes?.outcome_statement || ""
  const statedMonths = Number(outcomeStatement.match(/\b(\d+)\s*months?\b/i)?.[1]) || 0
  const outcomeMonths = currentOutcome?.timeline_months || lfaSnapshot.outcomes?.timeline_months || statedMonths || Math.max(12, ...(currentOutcome?.milestones || []).map((item: { month: number }) => item.month))
  const outcomeBaseline = currentOutcome?.baseline ?? lfaSnapshot.outcomes?.baseline_value ?? 0
  const outcomeTarget = currentOutcome?.target ?? lfaSnapshot.outcomes?.target_value ?? 0

  useEffect(() => {
    const previous = studentOutcomes.at(-1)
    if (!previous || previous.smart_validation.criteria || !currentOrganization?._id) return
    const statement = previous.outcome_statement || lfaSnapshot.outcomes?.outcome_statement
    const baseline = previous.baseline ?? lfaSnapshot.outcomes?.baseline_value
    const target = previous.target ?? lfaSnapshot.outcomes?.target_value
    const months = previous.timeline_months || lfaSnapshot.outcomes?.timeline_months || Number(statement?.match(/\b(\d+)\s*months?\b/i)?.[1]) || Math.max(12, ...previous.milestones.map((item) => item.month))
    if (!statement || baseline == null || target == null) {
      setRecheckFailed(true)
      return
    }
    let active = true
    setRecheckFailed(false)
    outcomesApi.validate({ organization_id: currentOrganization._id, theme: activeTheme || currentOrganization.thematic_focus[0], outcome_statement: statement, baseline_value: baseline, target_value: target, timeline_months: months }, language)
      .then((validation) => { if (active) updateLatestOutcomeValidation(validation) })
      .catch(() => { if (active) setRecheckFailed(true) })
    return () => { active = false }
  }, [studentOutcomes, currentOrganization?._id, activeTheme, lfaSnapshot.outcomes, language, updateLatestOutcomeValidation])

  const handleSubmit = async () => {
    if (!formData.outcome_statement || !formData.grade_range) {
      toast.error(language === "en" ? "Please fill required fields" : "कृपया आवश्यक फ़ील्ड भरें")
      return
    }

    setLoading(true)
    try {
      const payload = {
        organization_id: currentOrganization!._id,
        theme: activeTheme || currentOrganization!.thematic_focus[0],
        state: currentOrganization!.geography.state,
        grade_range: formData.grade_range,
        outcome_statement: formData.outcome_statement,
        baseline_value: formData.baseline_value,
        target_value: formData.target_value,
        timeline_months: formData.timeline_months,
      }

      const result = await outcomesApi.create(payload, language)
      const readable = normalizeOutcomeTimeline(result, language)
      setCurrentOutcome(readable)
      addStudentOutcome(readable)
      updateLFASnapshot("outcomes", {
        smart_outcomes: [...(useAppStore.getState().lfaSnapshot.outcomes?.smart_outcomes || []), formData.outcome_statement],
        outcome_statement: formData.outcome_statement,
        baseline_value: formData.baseline_value,
        target_value: formData.target_value,
        timeline_months: formData.timeline_months,
        milestones: readable.milestones,
      })

      toast.success(language === "en" ? "Outcome created and validated!" : "परिणाम बनाया और मान्य किया गया!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            {t("nav.outcomes")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Design SMART student outcomes with AI validation"
              : "AI मान्यता के साथ SMART छात्र परिणाम डिज़ाइन करें"}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("outcomes.statement")} *</CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Describe the measurable outcome you want to achieve"
                    : "उस मापने योग्य परिणाम का वर्णन करें जिसे आप प्राप्त करना चाहते हैं"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Grade Range" : "ग्रेड रेंज"} *</Label>
                  <Select
                    value={formData.grade_range}
                    onValueChange={(value) => setFormData({ ...formData, grade_range: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === "en" ? "Select grade range" : "ग्रेड रेंज चुनें"} />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {language === "en" ? range.label : range.labelHi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("outcomes.statement")} *</Label>
                  <Textarea
                    value={formData.outcome_statement}
                    onChange={(e) => setFormData({ ...formData, outcome_statement: e.target.value })}
                    placeholder={
                      language === "en"
                        ? "e.g., Increase percentage of Grade 3 students achieving reading fluency from 35% to 70% within 18 months"
                        : "उदा., 18 महीनों के भीतर पढ़ने की प्रवाहशीलता प्राप्त करने वाले कक्षा 3 के छात्रों का प्रतिशत 35% से बढ़ाकर 70% करें"
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {language === "en" ? "Baseline & Target" : "बेसलाइन और लक्ष्य"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("outcomes.baseline")} (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.baseline_value}
                      onChange={(e) =>
                        setFormData({ ...formData, baseline_value: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("outcomes.target")} (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.target_value}
                      onChange={(e) =>
                        setFormData({ ...formData, target_value: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("outcomes.timeline")}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={formData.timeline_months}
                    onChange={(e) =>
                      setFormData({ ...formData, timeline_months: Number.parseInt(e.target.value) || 12 })
                    }
                  />
                </div>

                {/* Progress Preview */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      {language === "en" ? "Baseline" : "बेसलाइन"}: {formData.baseline_value}%
                    </span>
                    <span>
                      {language === "en" ? "Target" : "लक्ष्य"}: {formData.target_value}%
                    </span>
                  </div>
                  <div className="relative h-4 bg-background rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-muted-foreground/30 rounded-full"
                      style={{ width: `${formData.baseline_value}%` }}
                    />
                    <div
                      className="absolute h-full bg-primary rounded-full"
                      style={{ width: `${formData.target_value}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "en"
                      ? `Expected improvement: ${(formData.target_value - formData.baseline_value).toFixed(1)} percentage points over ${formData.timeline_months} months`
                      : `अपेक्षित सुधार: ${formData.timeline_months} महीनों में ${(formData.target_value - formData.baseline_value).toFixed(1)} प्रतिशत अंक`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "en" ? "Validating..." : "मान्य हो रहा है..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {language === "en" ? "Create & Validate Outcome" : "परिणाम बनाएं और मान्य करें"}
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {currentOutcome ? (
              <>
                <Card><CardHeader><CardTitle>{language === "hi" ? "हम क्या हासिल करना चाहते हैं" : "What this outcome will achieve"}</CardTitle></CardHeader><CardContent><p className="leading-7">{presentableText(currentOutcome.outcome_explanation, language)}</p></CardContent></Card>

                <SmartValidationCard validation={currentOutcome.smart_validation} language={language} recheckFailed={recheckFailed} />

                {/* Aligned Competencies */}
                {currentOutcome.aligned_competencies.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{language === "en" ? "Aligned Competencies" : "संरेखित दक्षताएं"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {currentOutcome.aligned_competencies.map((comp: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {presentableText(comp, language)}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Policy References */}
                {currentOutcome.policy_references.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{language === "en" ? "Policy References" : "नीति संदर्भ"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentOutcome.policy_references.map((ref: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{presentableText(ref, language)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              </>
            ) : (
              <Card className="h-full">
                <CardContent className="h-full flex flex-col items-center justify-center py-16">
                  <Target className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    {language === "en" ? "No outcome created yet" : "अभी तक कोई परिणाम नहीं बनाया गया"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "en"
                      ? "Fill the form and submit to see validation results"
                      : "मान्यता परिणाम देखने के लिए फ़ॉर्म भरें और सबमिट करें"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        {currentOutcome && <section className="space-y-5" aria-label={language === "hi" ? "परिणाम समयरेखा" : "Outcome timeline"}>
          <OutcomeTimeline milestones={currentOutcome.milestones || []} baseline={outcomeBaseline} target={outcomeTarget} months={outcomeMonths} language={language} />
          <details className="rounded-xl border bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold text-primary">{language === "hi" ? "चित्र डाउनलोड करें या संपादित करें" : "View, download, or edit the diagram image"}</summary>
            <div className="mt-4">
              <MermaidDiagram
                title={language === "en" ? "Outcome Timeline Diagram" : "परिणाम समयरेखा चित्र"}
                diagram={currentOutcome.outcome_timeline_diagram}
                previewUrl={currentOutcome.timeline_preview_url}
                pngUrl={currentOutcome.timeline_png_url}
                svgUrl={currentOutcome.timeline_svg_url}
              />
            </div>
          </details>
        </section>}
      </div>
    </DashboardLayout>
  )
}
