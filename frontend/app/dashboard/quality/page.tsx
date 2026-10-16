"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { lfaApi } from "@/lib/api"
import { presentableText } from "@/lib/presentation"
import { toast } from "sonner"
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  BarChart3,
  FileText,
  Target,
  Lightbulb,
  AlertTriangle,
} from "lucide-react"

const pageForArea = (area: string) => {
  const value = area.toLowerCase().replaceAll("_", " ")
  if (value.includes("organization")) return "/dashboard/organization"
  if (value.includes("problem")) return "/dashboard/problem"
  if (value.includes("outcome")) return "/dashboard/outcomes"
  if (value.includes("method") || value.includes("intervention")) return "/dashboard/methodology"
  if (value.includes("stakeholder") || value.includes("practice")) return "/dashboard/stakeholders"
  if (value.includes("theory")) return "/dashboard/theory-of-change"
  if (value.includes("indicator") || value.includes("measurement") || value.includes("baseline")) return "/dashboard/indicators"
  return "/dashboard"
}

export default function QualityPage() {
  const { language, t } = useLanguage()
  const { currentOrganization, lfaSnapshot } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [completenessResult, setCompletenessResult] = useState<any>(null)
  const [qualityResult, setQualityResult] = useState<any>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const [completeness, quality] = await Promise.all([
        lfaApi.getCompleteness(
          {
            organization_id: currentOrganization!._id,
            lfa_snapshot: lfaSnapshot,
          },
          language,
        ),
        lfaApi.getQualityFeedback(
          {
            organization_id: currentOrganization!._id,
            lfa_snapshot: lfaSnapshot,
          },
          language,
        ),
      ])

      setCompletenessResult(completeness)
      setQualityResult(quality)
      toast.success(language === "en" ? "Analysis complete!" : "विश्लेषण पूर्ण!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getSectionIcon = (section: string) => {
    const icons: Record<string, any> = {
      organization_profile: FileText,
      problem_definition: AlertTriangle,
      problem_tree: AlertTriangle,
      outcomes: Target,
      methodology: BarChart3,
      theory_of_change: Lightbulb,
      measurement: BarChart3,
    }
    return icons[section] || FileText
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              {t("nav.quality")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === "en" ? "Check LFA completeness and design quality" : "LFA पूर्णता और डिज़ाइन गुणवत्ता की जांच करें"}
            </p>
          </div>
          <Button onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "en" ? "Analyzing..." : "विश्लेषण हो रहा है..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {language === "en" ? "Run Analysis" : "विश्लेषण चलाएं"}
              </>
            )}
          </Button>
        </div>

        {completenessResult && qualityResult ? (
          <>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader><CardTitle>{language === "hi" ? "निर्यात से पहले अगले सुधार" : "Next fixes before export"}</CardTitle><CardDescription>{language === "hi" ? "हर सुझाव उस भाग को खोलता है जहाँ आप बदलाव कर सकते हैं। पूर्णता और गुणवत्ता अलग-अलग माप हैं।" : "Each suggestion opens the section where you can act. Completeness and design quality measure different things."}</CardDescription></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {qualityResult.feedback_items.slice(0, 3).map((item: any, index: number) => <Link key={index} href={pageForArea(item.section_key || item.area)} className="rounded-lg border bg-background p-4 hover:border-primary">
                <p className="text-xs font-semibold uppercase text-primary">{item.area}</p><p className="mt-2 text-sm font-medium">{item.issue}</p><p className="mt-2 text-xs text-muted-foreground">{item.suggestion}</p><span className="mt-3 block text-xs font-semibold text-primary">{language === "hi" ? "यह भाग खोलें →" : "Open section →"}</span>
              </Link>)}
              {!qualityResult.feedback_items.length && <p className="text-sm text-muted-foreground">{language === "hi" ? "अभी कोई सुधार सूचीबद्ध नहीं है। निर्यात से पहले साक्ष्य और माप की जाँच करें।" : "No fixes are listed. Review evidence and measurements before export."}</p>}
            </CardContent>
          </Card>
          <Tabs defaultValue="completeness">
            <TabsList>
              <TabsTrigger value="completeness">{language === "en" ? "Completeness" : "पूर्णता"}</TabsTrigger>
              <TabsTrigger value="quality">{language === "en" ? "Quality" : "गुणवत्ता"}</TabsTrigger>
            </TabsList>

            <TabsContent value="completeness" className="mt-6 space-y-6">
              {/* Overall Score */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {language === "en" ? "Overall Completeness" : "समग्र पूर्णता"}
                      <Badge
                        variant={
                          completenessResult.completion_percentage >= 80
                            ? "default"
                            : completenessResult.completion_percentage >= 50
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {completenessResult.completion_percentage}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={completenessResult.completion_percentage} className="h-4" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {completenessResult.missing_sections.length > 0
                        ? language === "en"
                          ? `Missing sections: ${completenessResult.missing_sections.join(", ")}`
                          : `लापता अनुभाग: ${completenessResult.missing_sections.join(", ")}`
                        : language === "en"
                          ? "All sections started!"
                          : "सभी अनुभाग शुरू हो गए!"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section Breakdown */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completenessResult.section_breakdown.map((section: any) => {
                  const Icon = getSectionIcon(section.section)
                  const variant =
                    section.status === "complete" ? "success" : section.status === "partial" ? "warning" : "danger"

                  return (
                    <Card key={section.section}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {section.section.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </span>
                          <Badge
                            variant={
                              section.status === "complete"
                                ? "default"
                                : section.status === "partial"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {section.score}/{section.weight}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress
                          value={(section.score / section.weight) * 100}
                          className={`h-2 ${variant === "success" ? "[&>div]:bg-success" : variant === "warning" ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"}`}
                        />
                        {section.missing_fields && section.missing_fields.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {language === "en" ? "Missing: " : "लापता: "}
                            {section.missing_fields.join(", ")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="quality" className="mt-6 space-y-6">
              {/* Quality Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {language === "en" ? "Design Quality Score" : "डिज़ाइन गुणवत्ता स्कोर"}
                    <Badge
                      variant={
                        qualityResult.quality_score >= 80
                          ? "default"
                          : qualityResult.quality_score >= 50
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {qualityResult.quality_score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={qualityResult.quality_score}
                    className={`h-4 ${qualityResult.quality_score >= 80 ? "[&>div]:bg-success" : qualityResult.quality_score >= 50 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"}`}
                  />
                </CardContent>
              </Card>

              {/* Feedback Items */}
              {qualityResult.feedback_items.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === "en" ? "Improvement Suggestions" : "सुधार सुझाव"}
                  </h3>
                  {qualityResult.feedback_items.map((item: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{item.area}</Badge>
                            </div>
                            <p className="font-medium text-sm">{presentableText(item.issue, language)}</p>
                            {item.problems && (
                              <ul className="mt-1 text-sm text-muted-foreground">
                                {item.problems.map((problem: string, i: number) => (
                                  <li key={i}>• {presentableText(problem, language)}</li>
                                ))}
                              </ul>
                            )}
                            <div className="mt-2 flex items-start gap-2 text-sm text-primary">
                              <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                              <span>{presentableText(item.suggestion, language)}</span>
                            </div>
                            <Button asChild size="sm" variant="outline" className="mt-3"><Link href={pageForArea(item.section_key || item.area)}>{language === "hi" ? "यह भाग सुधारें" : "Improve this section"}</Link></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
                    <h3 className="text-lg font-semibold">{language === "en" ? "Great job!" : "बढ़िया काम!"}</h3>
                    <p className="text-muted-foreground">
                      {language === "en"
                        ? "No quality issues detected in your design"
                        : "आपके डिज़ाइन में कोई गुणवत्ता समस्या नहीं पाई गई"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold">
                {language === "en" ? "Ready for Analysis" : "विश्लेषण के लिए तैयार"}
              </h3>
              <p className="text-muted-foreground mt-1 mb-6">
                {language === "en"
                  ? "Click the button above to analyze your LFA completeness and quality"
                  : "अपनी LFA पूर्णता और गुणवत्ता का विश्लेषण करने के लिए ऊपर दिए गए बटन पर क्लिक करें"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
