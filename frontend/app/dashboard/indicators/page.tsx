"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { indicatorApi } from "@/lib/api"
import { presentableText } from "@/lib/presentation"
import { toast } from "sonner"
import { BarChart3, Sparkles, Loader2, CheckCircle2, AlertCircle, Target, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface IndicatorBaseline {
  indicator_name: string
  baseline_value: number
  current_value: number | null
  target_value: number
  start_date: string
  end_date: string
}

export default function IndicatorsPage() {
  const { language, t } = useLanguage()
  const { currentOrganization, activeTheme, updateLFASnapshot, lfaSnapshot } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [baselineLoading, setBaselineLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")

  const [outcomeIndicators, setOutcomeIndicators] = useState<Record<string, string>>({})
  const [practiceIndicators, setPracticeIndicators] = useState<Record<string, Record<string, string>>>({})
  const [baselines, setBaselines] = useState<IndicatorBaseline[]>([])
  const [baselineValidations, setBaselineValidations] = useState<any[]>([])

  useEffect(() => {
    const restore = () => {
      const saved = useAppStore.getState().lfaSnapshot
      setOutcomeIndicators(saved.indicators?.outcome_indicators || {})
      setPracticeIndicators(saved.indicators?.practice_indicators || {})
      setBaselines(saved.indicator_baselines || [])
    }
    if (useAppStore.persist.hasHydrated()) restore()
    return useAppStore.persist.onFinishHydration(restore)
  }, [])

  const handleAutoGenerate = async () => {
    setLoading(true)
    try {
      const studentOutcomes = lfaSnapshot?.outcomes?.smart_outcomes || []

      const practiceChanges = lfaSnapshot?.practice_changes
        ? Object.entries(lfaSnapshot.practice_changes).map(([stakeholder_id, data]: [string, any]) => ({
            stakeholder_id,
            desired_practices: data.desired || [],
          }))
        : []

      if (!studentOutcomes.length && !practiceChanges.length) {
        toast.error(language === "hi" ? "पहले छात्र परिणाम या अभ्यास परिवर्तन जोड़ें।" : "Add student outcomes or practice changes first.")
        return
      }

      const result = await indicatorApi.autoGenerate(
        {
          organization_id: currentOrganization!._id,
          theme: activeTheme || currentOrganization!.thematic_focus[0],
          student_outcomes: studentOutcomes,
          practice_changes: practiceChanges,
        },
        language,
      )

      setOutcomeIndicators(result.outcome_indicators)
      setPracticeIndicators(result.practice_indicators)

      // Initialize baselines for each indicator
      const allIndicators = [
        ...Object.values(result.outcome_indicators),
        ...Object.values(result.practice_indicators).flatMap((p) => Object.values(p)),
      ]
      setBaselines(
        allIndicators.map((name) => ({
          indicator_name: name,
          baseline_value: 0,
          current_value: null,
          target_value: 0,
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })),
      )

      updateLFASnapshot("indicators", {
        outcome_indicators: result.outcome_indicators,
        practice_indicators: result.practice_indicators,
      })

      toast.success(language === "en" ? "Indicators generated!" : "संकेतक उत्पन्न हुए!")
      setActiveTab("baseline")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateBaseline = (index: number, field: keyof IndicatorBaseline, value: string | number | null) => {
    const updated = [...baselines]
    updated[index] = { ...updated[index], [field]: value }
    setBaselines(updated)
  }

  const handleSetBaselines = async () => {
    const validBaselines = baselines.filter((b) => b.baseline_value >= 0 && b.target_value > 0)
    if (validBaselines.length === 0) {
      toast.error(
        language === "en" ? "Please set at least one baseline and target" : "कृपया कम से कम एक बेसलाइन और लक्ष्य सेट करें",
      )
      return
    }

    setBaselineLoading(true)
    try {
      const result = await indicatorApi.setBaseline(
        {
          organization_id: currentOrganization!._id,
          indicators: validBaselines,
        },
        language,
      )

      setBaselineValidations(result.validations)
      updateLFASnapshot("indicator_baselines", validBaselines)

      toast.success(language === "en" ? "Baselines validated!" : "बेसलाइन मान्य!")
      setActiveTab("visualize")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setBaselineLoading(false)
    }
  }

  const chartData = baselines
    .filter((b) => b.baseline_value >= 0 && b.target_value > 0)
    .map((b) => ({
      name: b.indicator_name.length > 20 ? b.indicator_name.substring(0, 20) + "..." : b.indicator_name,
      baseline: b.baseline_value,
      target: b.target_value,
      current: b.current_value,
      progress: b.current_value === null || b.target_value <= b.baseline_value ? null : Math.max(0, Math.min(100, Math.round((b.current_value - b.baseline_value) / (b.target_value - b.baseline_value) * 100))),
    }))

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            {t("nav.indicators")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Auto-generate indicators and set baseline targets"
              : "स्वचालित रूप से संकेतक उत्पन्न करें और बेसलाइन लक्ष्य सेट करें"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="generate">{language === "en" ? "Generate" : "उत्पन्न करें"}</TabsTrigger>
            <TabsTrigger value="baseline" disabled={Object.keys(outcomeIndicators).length === 0}>
              {language === "en" ? "Set Baselines" : "बेसलाइन सेट करें"}
            </TabsTrigger>
            <TabsTrigger value="visualize" disabled={baselines.filter((b) => b.target_value > 0).length === 0}>
              {language === "en" ? "Visualize" : "दृश्य"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6 space-y-6">
            {Object.keys(outcomeIndicators).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === "en" ? "Auto-Generate Indicators" : "संकेतक स्वचालित उत्पन्न करें"}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    {language === "en"
                      ? "Based on your student outcomes and practice changes, we'll generate relevant indicators for measurement."
                      : "आपके छात्र परिणामों और अभ्यास परिवर्तनों के आधार पर, हम माप के लिए प्रासंगिक संकेतक उत्पन्न करेंगे।"}
                  </p>
                  <Button onClick={handleAutoGenerate} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === "en" ? "Generating..." : "उत्पन्न हो रहा है..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {language === "en" ? "Generate Indicators" : "संकेतक उत्पन्न करें"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Outcome Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      {language === "en" ? "Outcome Indicators" : "परिणाम संकेतक"}
                    </CardTitle>
                    <CardDescription>
                      {language === "en" ? "Measures of student outcomes" : "छात्र परिणामों के माप"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(outcomeIndicators).map(([outcome, indicator]) => (
                        <div key={outcome} className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">{outcome}</p>
                          <p className="font-medium">{presentableText(indicator, language)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Practice Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-chart-2" />
                      {language === "en" ? "Practice Indicators" : "अभ्यास संकेतक"}
                    </CardTitle>
                    <CardDescription>
                      {language === "en" ? "Measures of practice changes" : "अभ्यास परिवर्तनों के माप"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(practiceIndicators).map(([stakeholder, practices]) => (
                        <div key={stakeholder}>
                          <Badge variant="outline" className="mb-2">
                            {stakeholder}
                          </Badge>
                          <div className="space-y-2">
                            {Object.entries(practices).map(([practice, indicator]) => (
                              <div key={practice} className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">{practice}</p>
                                <p className="text-sm font-medium">{presentableText(indicator, language)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="baseline" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Set Baseline & Targets" : "बेसलाइन और लक्ष्य सेट करें"}</CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Define current values and target goals for each indicator"
                    : "प्रत्येक संकेतक के लिए वर्तमान मान और लक्ष्य लक्ष्य परिभाषित करें"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {baselines.map((baseline, index) => {
                    const validation = baselineValidations.find((v) => v.indicator_name === baseline.indicator_name)

                    return (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{baseline.indicator_name}</p>
                            {validation && (
                              <div className="flex items-center gap-2 mt-1">
                                {validation.status === "valid" ? (
                                  <Badge variant="default" className="bg-success">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {language === "en" ? "Valid" : "मान्य"}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {language === "en" ? "Needs Review" : "समीक्षा आवश्यक"}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2">
                            <Label>{language === "en" ? "Baseline Value" : "बेसलाइन मान"}</Label>
                            <Input
                              type="number"
                              value={baseline.baseline_value}
                              onChange={(e) => updateBaseline(index, "baseline_value", Number(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{language === "hi" ? "अब तक मापा गया मान" : "Current measured value"}</Label>
                            <Input type="number" value={baseline.current_value ?? ""} onChange={(e) => updateBaseline(index, "current_value", e.target.value === "" ? null : Number(e.target.value))} placeholder={language === "hi" ? "अभी मापा नहीं गया" : "Not measured yet"} />
                          </div>
                          <div className="space-y-2">
                            <Label>{language === "en" ? "Target Value" : "लक्ष्य मान"}</Label>
                            <Input
                              type="number"
                              value={baseline.target_value}
                              onChange={(e) => updateBaseline(index, "target_value", Number(e.target.value))}
                              placeholder="100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{language === "en" ? "Start Date" : "प्रारंभ तिथि"}</Label>
                            <Input
                              type="date"
                              value={baseline.start_date}
                              onChange={(e) => updateBaseline(index, "start_date", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{language === "en" ? "End Date" : "समाप्ति तिथि"}</Label>
                            <Input
                              type="date"
                              value={baseline.end_date}
                              onChange={(e) => updateBaseline(index, "end_date", e.target.value)}
                            />
                          </div>
                        </div>

                        {validation?.warnings?.length > 0 && (
                          <div className="space-y-1">
                            {validation.warnings.map((warning: string, i: number) => (
                              <p key={i} className="text-sm text-warning flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {warning}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <Button onClick={handleSetBaselines} disabled={baselineLoading} className="w-full mt-6">
                  {baselineLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === "en" ? "Validating..." : "मान्य हो रहा है..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {language === "en" ? "Validate & Save Baselines" : "बेसलाइन मान्य और सहेजें"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualize" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "en" ? "Baseline vs Target" : "बेसलाइन बनाम लक्ष्य"}</CardTitle>
                  <CardDescription>
                    {language === "en" ? "Baseline, latest measured value, and target" : "आधार, नवीनतम माप और लक्ष्य"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      current: { label: language === "en" ? "Latest measurement" : "नवीनतम माप", color: "hsl(var(--chart-3))" },
                      baseline: { label: language === "en" ? "Baseline" : "बेसलाइन", color: "hsl(var(--chart-2))" },
                      target: { label: language === "en" ? "Target" : "लक्ष्य", color: "hsl(var(--chart-1))" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="baseline" fill="var(--color-baseline)" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="current" fill="var(--color-current)" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="target" fill="var(--color-target)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Progress Percentage */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "en" ? "Target Progress" : "लक्ष्य प्रगति"}</CardTitle>
                  <CardDescription>
                    {language === "en" ? "Measured progress from baseline to target" : "आधार से लक्ष्य तक मापी गई प्रगति"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chartData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                          <span className="text-primary font-semibold">{item.current === null ? (language === "hi" ? "अभी मापा नहीं गया" : "Not measured yet") : item.progress === null ? (language === "hi" ? "लक्ष्य जाँचें" : "Review target") : `${item.progress}%`}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${item.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>{language === "hi" ? "संकेतकों के माप" : "Indicator measurements"}</CardTitle><CardDescription>{language === "hi" ? "चार्ट के वही मान यहाँ पूरे नामों और तारीखों के साथ दिए गए हैं।" : "The exact values behind the charts, with full names and dates."}</CardDescription></CardHeader>
              <CardContent className="space-y-3">{baselines.filter((item) => item.target_value > 0).map((item, index) => <div key={`${item.indicator_name}-${index}`} className="rounded-lg border p-4">
                <p className="font-medium">{item.indicator_name}</p>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3"><p>{language === "hi" ? "आधार" : "Baseline"}: <strong>{item.baseline_value}</strong></p><p>{language === "hi" ? "नवीनतम माप" : "Latest measurement"}: <strong>{item.current_value === null ? (language === "hi" ? "अभी नहीं" : "Not measured") : item.current_value}</strong></p><p>{language === "hi" ? "लक्ष्य" : "Target"}: <strong>{item.target_value}</strong></p></div>
                <p className="mt-2 text-xs text-muted-foreground">{item.start_date} → {item.end_date}</p>
              </div>)}</CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary">{baselines.length}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "en" ? "Total Indicators" : "कुल संकेतक"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-chart-2">
                    {baselines.filter((b) => b.target_value > 0).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "en" ? "With Targets Set" : "लक्ष्य सेट के साथ"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-success">
                    {baselineValidations.filter((v) => v.status === "valid").length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{language === "en" ? "Validated" : "मान्य"}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
