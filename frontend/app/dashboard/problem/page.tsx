"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { problemApi } from "@/lib/api"
import { normalizeProblemRefinement, normalizeProblemTree } from "@/lib/presentation"
import { toast } from "sonner"
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  GitBranch,
  Plus,
  X,
} from "lucide-react"

const stakeholderOptions = [
  { value: "students", label: "Students", labelHi: "छात्र" },
  { value: "teachers", label: "Teachers", labelHi: "शिक्षक" },
  { value: "parents", label: "Parents", labelHi: "माता-पिता" },
  { value: "school_leaders", label: "School Leaders", labelHi: "स्कूल नेता" },
  { value: "administrators", label: "Administrators", labelHi: "प्रशासक" },
  { value: "community", label: "Community", labelHi: "समुदाय" },
]

export default function ProblemPage() {
  const { language, t } = useLanguage()
  const {
    currentOrganization,
    activeTheme,
    setCurrentRefinement,
    setProblemTree,
    currentRefinement: storedRefinement,
    problemTree: storedProblemTree,
    updateLFASnapshot,
    addProblemStatement,
    problemStatements,
    lfaSnapshot,
  } = useAppStore()
  const currentRefinement = storedRefinement ? normalizeProblemRefinement(storedRefinement, language) : null
  const problemTree = storedProblemTree ? normalizeProblemTree(storedProblemTree, language) : null
  const [loading, setLoading] = useState(false)
  const [refineLoading, setRefineLoading] = useState(false)
  const [treeLoading, setTreeLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("define")
  const [refinedDraft, setRefinedDraft] = useState("")
  const [reviewStatus, setReviewStatus] = useState<"pending" | "accepted" | "discarded">("pending")

  const [problemData, setProblemData] = useState({
    core_problem: "",
    affected_stakeholders: [] as string[],
    evidence: [{ source: "", description: "", year: undefined as number | undefined }],
  })

  const [createdProblemId, setCreatedProblemId] = useState<string | null>(null)

  useEffect(() => { setCreatedProblemId(problemStatements.at(-1)?._id || null) }, [problemStatements])
  useEffect(() => { if (currentRefinement) setRefinedDraft(currentRefinement.refined_problem_statement) }, [currentRefinement?.problem_statement_id])
  useEffect(() => { setReviewStatus(lfaSnapshot.problem_definition?.ai_review_status || "pending") }, [lfaSnapshot.problem_definition?.ai_review_status])

  const handleStakeholderToggle = (stakeholder: string) => {
    setProblemData((prev) => ({
      ...prev,
      affected_stakeholders: prev.affected_stakeholders.includes(stakeholder)
        ? prev.affected_stakeholders.filter((s) => s !== stakeholder)
        : [...prev.affected_stakeholders, stakeholder],
    }))
  }

  const addEvidence = () => {
    setProblemData((prev) => ({
      ...prev,
      evidence: [...prev.evidence, { source: "", description: "", year: undefined }],
    }))
  }

  const removeEvidence = (index: number) => {
    setProblemData((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index),
    }))
  }

  const updateEvidence = (index: number, field: string, value: any) => {
    setProblemData((prev) => ({
      ...prev,
      evidence: prev.evidence.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    }))
  }

  const handleSubmit = async () => {
    if (problemData.core_problem.trim().length < 20) {
      toast.error(language === "en" ? "Please fill required fields" : "कृपया आवश्यक फ़ील्ड भरें")
      return
    }

    setLoading(true)
    try {
      const payload = {
        organization_id: currentOrganization!._id,
        theme: activeTheme || currentOrganization!.thematic_focus[0],
        core_problem: problemData.core_problem,
        affected_stakeholders: problemData.affected_stakeholders,
        evidence: problemData.evidence
          .filter((e) => e.description)
          .map((e) => ({
            source: e.source || undefined,
            description: e.description,
            year: e.year || undefined,
          })),
      }

      const result = await problemApi.create(payload, language)
      addProblemStatement(result)
      setCurrentRefinement(null)
      setRefinedDraft("")
      setReviewStatus("pending")
      setProblemTree(null)
      setCreatedProblemId(result._id)
      updateLFASnapshot("problem_definition", {
        core_problem: problemData.core_problem,
        affected_group: problemData.affected_stakeholders,
        ai_review_status: "pending",
      })

      toast.success(language === "en" ? "Problem statement created!" : "समस्या कथन बनाया गया!")
      setActiveTab("refine")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefine = async () => {
    if (!createdProblemId) return

    setRefineLoading(true)
    try {
      const result = await problemApi.refine(createdProblemId, language)
      const readable = normalizeProblemRefinement(result, language)
      setCurrentRefinement(readable)
      setRefinedDraft(readable.refined_problem_statement)
      setReviewStatus("pending")
      toast.success(language === "en" ? "Problem refined successfully!" : "समस्या सफलतापूर्वक परिष्कृत!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setRefineLoading(false)
    }
  }

  const reviewRefinement = (accept: boolean) => {
    if (!currentRefinement) return
    const statement = accept ? refinedDraft.trim() : (problemStatements.at(-1)?.core_problem || problemData.core_problem)
    if (statement.length < 20) {
      toast.error(language === "hi" ? "समस्या विवरण कम से कम 20 अक्षरों का रखें।" : "Keep the problem statement at least 20 characters long.")
      return
    }
    setCurrentRefinement({ ...currentRefinement, refined_problem_statement: statement })
    updateLFASnapshot("problem_definition", {
      core_problem: statement,
      affected_group: accept ? [...problemData.affected_stakeholders, ...currentRefinement.suggested_stakeholders] : problemData.affected_stakeholders,
      evidence_to_verify: currentRefinement.evidence_suggestions,
      ai_review_status: accept ? "accepted" : "discarded",
    })
    setReviewStatus(accept ? "accepted" : "discarded")
    toast.success(language === "hi" ? "आपकी पसंद योजना में सहेजी गई।" : "Your choice was saved to the design.")
  }

  const handleGenerateTree = async () => {
    if (!currentRefinement || !currentOrganization) return

    setTreeLoading(true)
    try {
      const payload = {
        organization_id: currentOrganization._id,
        state: currentOrganization.geography.state,
        district: currentOrganization.geography.district || "",
        theme: activeTheme || currentOrganization.thematic_focus[0],
        refined_problem_statement: currentRefinement.refined_problem_statement,
        suggested_root_causes: currentRefinement.suggested_root_causes,
      }

      const result = await problemApi.generateTree(payload, language)
      const readable = normalizeProblemTree(result, language)
      setProblemTree(readable)
      updateLFASnapshot("problem_tree", {
        root_causes: readable.problem_tree.causes.map((c) => c.label),
        core_problem: readable.problem_tree.core_problem.label,
        effects: readable.problem_tree.effects.map((e) => e.label),
      })

      toast.success(language === "en" ? "Problem tree generated!" : "समस्या वृक्ष उत्पन्न!")
      setActiveTab("tree")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setTreeLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-primary" />
            {t("nav.problem")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Define, refine, and analyze your core problem with AI assistance"
              : "AI सहायता के साथ अपनी मुख्य समस्या को परिभाषित, परिष्कृत और विश्लेषित करें"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="define" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {language === "en" ? "Define" : "परिभाषित"}
            </TabsTrigger>
            <TabsTrigger value="refine" className="flex items-center gap-2" disabled={!createdProblemId}>
              <Sparkles className="h-4 w-4" />
              {language === "en" ? "AI Refine" : "AI परिष्कृत"}
            </TabsTrigger>
            <TabsTrigger value="tree" className="flex items-center gap-2" disabled={!currentRefinement}>
              <GitBranch className="h-4 w-4" />
              {t("problem.tree")}
            </TabsTrigger>
          </TabsList>

          {/* Define Tab */}
          <TabsContent value="define" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("problem.core")} *</CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Describe the core problem your program addresses"
                    : "उस मुख्य समस्या का वर्णन करें जिसे आपका कार्यक्रम संबोधित करता है"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={problemData.core_problem}
                  onChange={(e) => setProblemData({ ...problemData, core_problem: e.target.value })}
                  placeholder={
                    language === "en"
                      ? "e.g., Students in Grade 3-5 in rural Rajasthan lack foundational literacy skills, with only 35% achieving grade-level reading proficiency..."
                      : "उदा., ग्रामीण राजस्थान में कक्षा 3-5 के छात्रों में बुनियादी साक्षरता कौशल की कमी है, केवल 35% ग्रेड-स्तरीय पढ़ने की दक्षता प्राप्त कर रहे हैं..."
                  }
                  className="min-h-[150px]"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {language === "en" ? "Minimum 20 characters" : "न्यूनतम 20 अक्षर"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("problem.stakeholders")} *</CardTitle>
                <CardDescription>
                  {language === "en" ? "Who is affected by this problem?" : "इस समस्या से कौन प्रभावित है?"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stakeholderOptions.map((stakeholder) => (
                    <Badge
                      key={stakeholder.value}
                      variant={problemData.affected_stakeholders.includes(stakeholder.value) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-2 px-4"
                      onClick={() => handleStakeholderToggle(stakeholder.value)}
                    >
                      {language === "en" ? stakeholder.label : stakeholder.labelHi}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t("problem.evidence")}
                  <Button variant="outline" size="sm" onClick={addEvidence}>
                    <Plus className="h-4 w-4 mr-1" />
                    {language === "en" ? "Add" : "जोड़ें"}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {language === "en" ? "Add supporting evidence (optional)" : "सहायक साक्ष्य जोड़ें (वैकल्पिक)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {problemData.evidence.map((evidence, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-3 p-4 border rounded-lg relative">
                    {problemData.evidence.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeEvidence(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="space-y-2">
                      <Label>{language === "en" ? "Source" : "स्रोत"}</Label>
                      <Input
                        value={evidence.source}
                        onChange={(e) => updateEvidence(index, "source", e.target.value)}
                        placeholder="e.g., ASER 2023"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{language === "en" ? "Description" : "विवरण"}</Label>
                      <Input
                        value={evidence.description}
                        onChange={(e) => updateEvidence(index, "description", e.target.value)}
                        placeholder={language === "en" ? "Describe the evidence" : "साक्ष्य का वर्णन करें"}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "en" ? "Creating..." : "बना रहा है..."}
                  </>
                ) : (
                  <>
                    {t("common.submit")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Refine Tab */}
          <TabsContent value="refine" className="space-y-6 mt-6">
            {!currentRefinement ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === "en" ? "AI Problem Refinement" : "AI समस्या परिष्करण"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {language === "en"
                      ? "Let AI analyze and refine your problem statement"
                      : "AI को अपने समस्या कथन का विश्लेषण और परिष्कृत करने दें"}
                  </p>
                  <Button onClick={handleRefine} disabled={refineLoading}>
                    {refineLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === "en" ? "Analyzing..." : "विश्लेषण हो रहा है..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t("problem.refine")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Clarity Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {t("problem.clarity")}
                      <Badge
                        variant={
                          currentRefinement.clarity_score >= 4
                            ? "default"
                            : currentRefinement.clarity_score >= 3
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {currentRefinement.clarity_score}/5
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={currentRefinement.clarity_score * 20} className="h-3" />
                  </CardContent>
                </Card>

                {/* Identified Issues */}
                {currentRefinement.identified_issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-warning" />
                        {language === "en" ? "Identified Issues" : "पहचाने गए मुद्दे"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentRefinement.identified_issues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                            <div>
                              <Badge variant="outline" className="mb-1">
                                {issue.issue_type}
                              </Badge>
                              <p className="text-sm">{issue.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Refined Statement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      {language === "en" ? "Refined Problem Statement" : "परिष्कृत समस्या कथन"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border bg-muted/30 p-4"><p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{language === "hi" ? "आपका मूल विवरण" : "Your original statement"}</p><p className="text-sm whitespace-pre-wrap">{problemStatements.at(-1)?.core_problem || problemData.core_problem}</p></div>
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4"><Label htmlFor="refined-review" className="mb-2 block text-xs font-semibold uppercase">{language === "hi" ? "AI का सुझाव — बदल सकते हैं" : "AI suggestion — editable"}</Label><Textarea id="refined-review" value={refinedDraft} onChange={(event) => { setRefinedDraft(event.target.value); setReviewStatus("pending") }} className="min-h-32 bg-background" /></div>
                    </div>
                    <p className="text-xs text-muted-foreground">{language === "hi" ? "AI के सुझाए साक्ष्य को उपयोग से पहले जाँचें। आपकी स्वीकृति के बाद ही नया सार योजना में जाएगा।" : "Verify suggested evidence before use. The revised statement enters your design only after you accept it."}</p>
                    <div className="flex flex-wrap items-center gap-2"><Button onClick={() => reviewRefinement(true)}>{language === "hi" ? "सार स्वीकारें" : "Accept edited summary"}</Button><Button variant="outline" onClick={() => reviewRefinement(false)}>{language === "hi" ? "मूल विवरण रखें" : "Keep original"}</Button>{reviewStatus !== "pending" && <Badge variant="secondary">{reviewStatus === "accepted" ? (language === "hi" ? "सार सहेजा गया" : "Summary saved") : (language === "hi" ? "मूल विवरण सहेजा गया" : "Original saved")}</Badge>}</div>
                  </CardContent>
                </Card>

                {/* Root Causes */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card><CardHeader><CardTitle>{language === "hi" ? "सुझाए गए हितधारक" : "Suggested stakeholders"}</CardTitle></CardHeader><CardContent className="space-y-2">
                    {currentRefinement.suggested_stakeholders?.map((person, index) => <div key={index} className="flex items-start gap-3 rounded-lg bg-muted p-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{index + 1}</span><p className="leading-6">{person}</p></div>)}
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle>{language === "hi" ? "जाँचने के लिए साक्ष्य" : "Evidence to verify"}</CardTitle></CardHeader><CardContent className="space-y-2">
                    {currentRefinement.evidence_suggestions?.map((item, index) => <div key={index} className="flex items-start gap-3 rounded-lg bg-muted p-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{index + 1}</span><p className="leading-6">{item}</p></div>)}
                  </CardContent></Card>
                </div>

                {/* Root Causes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      {language === "en" ? "Suggested Root Causes" : "सुझाए गए मूल कारण"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentRefinement.suggested_root_causes.map((cause, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-medium">{cause.cause}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{cause.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleGenerateTree} disabled={treeLoading || reviewStatus === "pending"}>
                    {treeLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === "en" ? "Generating..." : "उत्पन्न हो रहा है..."}
                      </>
                    ) : (
                      <>
                        <GitBranch className="mr-2 h-4 w-4" />
                        {language === "en" ? "Generate Problem Tree" : "समस्या वृक्ष उत्पन्न करें"}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Tree Tab */}
          <TabsContent value="tree" className="space-y-6 mt-6">
            {problemTree && (
              <>
                <MermaidDiagram
                  title={t("problem.tree")}
                  diagram={problemTree.mermaid_diagram}
                  previewUrl={problemTree.mermaid_preview_url}
                  pngUrl={problemTree.mermaid_png_url}
                  svgUrl={problemTree.mermaid_svg_url}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle>{language === "hi" ? "संभावित कारण" : "Possible causes"}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {problemTree.problem_tree.causes.map((cause, index) => (
                        <p key={cause.id} className="rounded-lg bg-muted p-3 text-sm"><span className="mr-2 font-semibold text-primary">{index + 1}.</span>{cause.label}</p>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>{language === "hi" ? "संभावित प्रभाव" : "Potential effects"}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {problemTree.problem_tree.effects.map((effect, index) => (
                        <p key={effect.id} className="rounded-lg bg-muted p-3 text-sm"><span className="mr-2 font-semibold text-primary">{index + 1}.</span>{effect.label}</p>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {problemTree.validation_feedback.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{language === "en" ? "Validation Feedback" : "मान्यता प्रतिक्रिया"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {problemTree.validation_feedback.map((feedback, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                            <span>{feedback}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {problemTree.ai_suggestions.district_challenges &&
                  problemTree.ai_suggestions.district_challenges.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {language === "en" ? "District-Specific Challenges" : "जिला-विशिष्ट चुनौतियां"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {problemTree.ai_suggestions.district_challenges.map((challenge, index) => (
                            <Badge key={index} variant="secondary">
                              {challenge}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
