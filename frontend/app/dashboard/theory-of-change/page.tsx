"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { TocSuggestionBoard } from "@/components/toc-suggestion-board"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { presentableText } from "@/lib/presentation"
import { tocApi } from "@/lib/api"
import { toast } from "sonner"
import {
  Network,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ArrowDown,
  ArrowRight,
  Zap,
  FileOutput,
  Target,
  TrendingUp,
} from "lucide-react"

interface ToCNode {
  id: string
  type: "activity" | "output" | "outcome" | "impact"
  label: string
}

interface ToCEdge {
  source: string
  target: string
}

interface NodeSectionProps {
  type: ToCNode["type"]
  title: string
  titleHi: string
  icon: any
  color: string
  nodes: ToCNode[]
  language: string
  onAddNode: (type: ToCNode["type"]) => void
  onRemoveNode: (id: string) => void
  onUpdateLabel: (id: string, label: string) => void
}

function NodeSection({
  type,
  title,
  titleHi,
  icon: Icon,
  color,
  nodes,
  language,
  onAddNode,
  onRemoveNode,
  onUpdateLabel,
}: NodeSectionProps) {
  const sectionNodes = nodes.filter((n) => n.type === type)

  return (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {language === "en" ? title : titleHi}
          </span>
          <Button variant="ghost" size="sm" onClick={() => onAddNode(type)}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sectionNodes.map((node) => (
          <div key={node.id} className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-1.5">
              <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-bold tracking-wide text-primary">{node.id}</span>
              <Textarea
                value={node.label}
                onChange={(e) => onUpdateLabel(node.id, e.target.value)}
                placeholder={
                  language === "en"
                    ? `Enter ${type}... (You can type full sentences here)`
                    : `${type === "activity" ? "गतिविधि" : type === "output" ? "आउटपुट" : type === "outcome" ? "परिणाम" : "प्रभाव"} दर्ज करें... (आप यहां पूर्ण वाक्य टाइप कर सकते हैं)`
                }
                className="min-h-[80px] resize-y"
              />
            </div>
            {sectionNodes.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => onRemoveNode(node.id)} className="mt-1">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function TheoryOfChangePage() {
  const { language, t } = useLanguage()
  const { currentOrganization, activeTheme, lfaSnapshot, theoryOfChange, setTheoryOfChange, updateLFASnapshot } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("build")

  const [nodes, setNodes] = useState<ToCNode[]>([
    { id: "A1", type: "activity", label: "" },
    { id: "O1", type: "output", label: "" },
    { id: "OC1", type: "outcome", label: "" },
    { id: "I1", type: "impact", label: "" },
  ])

  const [edges, setEdges] = useState<ToCEdge[]>([
    { source: "A1", target: "O1" },
    { source: "O1", target: "OC1" },
    { source: "OC1", target: "I1" },
  ])
  const [edgeSource, setEdgeSource] = useState("A1")
  const [edgeTarget, setEdgeTarget] = useState("O1")

  useEffect(() => {
    if (lfaSnapshot.theory_of_change?.nodes?.length) {
      setNodes(lfaSnapshot.theory_of_change.nodes as ToCNode[])
      setEdges(lfaSnapshot.theory_of_change.edges || [])
    }
  }, [lfaSnapshot.theory_of_change])

  const addNode = (type: ToCNode["type"]) => {
    const prefix = type === "activity" ? "A" : type === "output" ? "O" : type === "outcome" ? "OC" : "I"
    const existingNumbers = nodes.filter((n) => n.type === type).map((n) => Number(n.id.slice(prefix.length)) || 0)
    const newId = `${prefix}${Math.max(0, ...existingNumbers) + 1}`
    setNodes([...nodes, { id: newId, type, label: "" }])
    setTheoryOfChange(null)
  }

  const removeNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id))
    setEdges(edges.filter((e) => e.source !== id && e.target !== id))
    setTheoryOfChange(null)
  }

  const updateNodeLabel = (id: string, label: string) => {
    setNodes((prevNodes) => prevNodes.map((n) => (n.id === id ? { ...n, label } : n)))
    setTheoryOfChange(null)
  }

  const addEdge = (source: string, target: string) => {
    if (!nodes.some((node) => node.id === source) || !nodes.some((node) => node.id === target)) {
      toast.error(language === "hi" ? "दो मान्य चरण चुनें।" : "Choose two existing steps.")
      return
    }
    if (source === target) {
      toast.error(language === "hi" ? "किसी चरण को स्वयं से नहीं जोड़ सकते।" : "A step cannot connect to itself.")
      return
    }
    if (!edges.find((e) => e.source === source && e.target === target)) {
      setEdges([...edges, { source, target }])
      setTheoryOfChange(null)
    }
  }

  const removeEdge = (source: string, target: string) => {
    setEdges(edges.filter((edge) => edge.source !== source || edge.target !== target))
    setTheoryOfChange(null)
  }

  const handleSubmit = async () => {
    if (nodes.some((node) => !node.label.trim())) {
      toast.error(
        language === "en" ? "Describe every step before checking the diagram." : "डायग्राम जाँचने से पहले हर चरण का विवरण दें।",
      )
      return
    }

    setLoading(true)
    try {
      const payload = {
        organization_id: currentOrganization!._id,
        theme: activeTheme || currentOrganization!.thematic_focus[0],
        nodes: nodes.map((n) => ({ id: n.id, type: n.type, label: n.label })),
        edges,
      }

      const result = await tocApi.build(payload, language)
      setTheoryOfChange(result)
      updateLFASnapshot("theory_of_change", {
        activities: nodes.filter((n) => n.type === "activity").map((n) => n.label),
        outputs: nodes.filter((n) => n.type === "output").map((n) => n.label),
        outcomes: nodes.filter((n) => n.type === "outcome").map((n) => n.label),
        impact: nodes.filter((n) => n.type === "impact").map((n) => n.label),
        nodes: payload.nodes,
        edges: payload.edges,
        is_valid: result.is_valid,
      })

      if (result.is_valid) toast.success(language === "en" ? "Structure checked: all steps connect." : "संरचना जाँची गई: सभी चरण जुड़े हैं।")
      else toast.warning(language === "en" ? "Review the connection issues shown in the preview." : "पूर्वावलोकन में दिखाए गए संबंधों की समीक्षा करें।")
      setActiveTab("preview")
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
            <Network className="h-8 w-8 text-primary" />
            {t("nav.toc")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Build your Theory of Change with visual logic validation"
              : "दृश्य तर्क मान्यता के साथ अपना परिवर्तन का सिद्धांत बनाएं"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="build">{language === "en" ? "Build" : "निर्माण"}</TabsTrigger>
            <TabsTrigger value="preview" disabled={!theoryOfChange}>
              {language === "en" ? "Preview & Validate" : "पूर्वावलोकन और मान्य"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="mt-6 space-y-6">
            <div className="grid gap-4">
              {/* Visual Flow Indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                <Badge variant="outline" className="bg-chart-1/10 border-chart-1">
                  {t("toc.activities")}
                </Badge>
                <ArrowDown className="h-4 w-4" />
                <Badge variant="outline" className="bg-chart-2/10 border-chart-2">
                  {t("toc.outputs")}
                </Badge>
                <ArrowDown className="h-4 w-4" />
                <Badge variant="outline" className="bg-chart-3/10 border-chart-3">
                  {t("toc.outcomes")}
                </Badge>
                <ArrowDown className="h-4 w-4" />
                <Badge variant="outline" className="bg-chart-4/10 border-chart-4">
                  {t("toc.impact")}
                </Badge>
              </div>

              <NodeSection
                type="activity"
                title="Activities"
                titleHi="गतिविधियां"
                icon={Zap}
                color="border-l-chart-1"
                nodes={nodes}
                language={language}
                onAddNode={addNode}
                onRemoveNode={removeNode}
                onUpdateLabel={updateNodeLabel}
              />

              <NodeSection
                type="output"
                title="Outputs"
                titleHi="आउटपुट"
                icon={FileOutput}
                color="border-l-chart-2"
                nodes={nodes}
                language={language}
                onAddNode={addNode}
                onRemoveNode={removeNode}
                onUpdateLabel={updateNodeLabel}
              />

              <NodeSection
                type="outcome"
                title="Outcomes"
                titleHi="परिणाम"
                icon={Target}
                color="border-l-chart-3"
                nodes={nodes}
                language={language}
                onAddNode={addNode}
                onRemoveNode={removeNode}
                onUpdateLabel={updateNodeLabel}
              />

              <NodeSection
                type="impact"
                title="Impact"
                titleHi="प्रभाव"
                icon={TrendingUp}
                color="border-l-chart-4"
                nodes={nodes}
                language={language}
                onAddNode={addNode}
                onRemoveNode={removeNode}
                onUpdateLabel={updateNodeLabel}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Network className="h-5 w-5 text-primary" />{language === "hi" ? "चरणों को जोड़ें" : "Connect the steps"}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {language === "hi" ? "तीर आपके कारण-प्रभाव संबंध दिखाते हैं। एक चरण से कई शाखाएँ जुड़ सकती हैं।" : "Arrows show how change happens. One step can lead to several branches."}
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Select value={edgeSource} onValueChange={setEdgeSource}>
                      <SelectTrigger className="w-full sm:max-w-[220px]" aria-label={language === "hi" ? "शुरुआती चरण" : "From step"}><SelectValue placeholder={language === "hi" ? "किस चरण से" : "From step"} /></SelectTrigger>
                      <SelectContent>{nodes.map((node) => <SelectItem key={node.id} value={node.id}>{node.id} · {language === "hi" ? node.type === "activity" ? "गतिविधि" : node.type === "output" ? "आउटपुट" : node.type === "outcome" ? "परिणाम" : "प्रभाव" : node.type}</SelectItem>)}</SelectContent>
                    </Select>
                    <ArrowRight className="hidden h-4 w-4 shrink-0 text-primary sm:block" aria-hidden="true" />
                    <Select value={edgeTarget} onValueChange={setEdgeTarget}>
                      <SelectTrigger className="w-full sm:max-w-[220px]" aria-label={language === "hi" ? "अगला चरण" : "To step"}><SelectValue placeholder={language === "hi" ? "किस चरण तक" : "To step"} /></SelectTrigger>
                      <SelectContent>{nodes.map((node) => <SelectItem key={node.id} value={node.id}>{node.id} · {language === "hi" ? node.type === "activity" ? "गतिविधि" : node.type === "output" ? "आउटपुट" : node.type === "outcome" ? "परिणाम" : "प्रभाव" : node.type}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={() => addEdge(edgeSource, edgeTarget)} className="sm:ml-auto"><Plus className="mr-2 h-4 w-4" />{language === "hi" ? "संबंध जोड़ें" : "Add connection"}</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {edges.map((edge) => (
                      <div key={`${edge.source}-${edge.target}`} className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm" title={`${nodes.find((node) => node.id === edge.source)?.label || edge.source} → ${nodes.find((node) => node.id === edge.target)?.label || edge.target}`}>
                        <span className="font-bold text-primary">{edge.source}</span><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" /><span className="font-bold text-primary">{edge.target}</span>
                        <button type="button" className="ml-1 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`${language === "hi" ? "संबंध हटाएँ" : "Remove connection"} ${edge.source} ${edge.target}`} onClick={() => removeEdge(edge.source, edge.target)}><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "en" ? "Validating..." : "मान्य हो रहा है..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("toc.validate")}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6 space-y-6">
            {theoryOfChange && (
              <>
                {/* Validation Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {theoryOfChange.is_valid ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-warning" />
                      )}
                      {language === "en" ? "Connection check" : "संबंध जाँच"}
                      <Badge variant={theoryOfChange.is_valid ? "default" : "secondary"}>
                        {theoryOfChange.is_valid
                          ? language === "en"
                            ? "Structure valid"
                            : "संरचना सही है"
                          : language === "en"
                            ? "Needs Review"
                            : "समीक्षा आवश्यक"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  {theoryOfChange.is_valid && <CardContent className="text-sm text-muted-foreground">{language === "hi" ? "सभी चरण गतिविधि से प्रभाव तक जुड़े हैं। प्रभाव की मान्यताओं को वास्तविक प्रमाण से जाँचें।" : "Every step connects from an activity to impact. Verify the causal assumptions with evidence."}</CardContent>}
                  {theoryOfChange.logic_issues.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {theoryOfChange.logic_issues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm p-3 bg-warning/10 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                            <span>{presentableText(issue, language)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* AI Suggestions */}
                <TocSuggestionBoard result={theoryOfChange} language={language} onEdit={() => setActiveTab("build")} />

                {/* Diagram */}
                <MermaidDiagram
                  title={t("nav.toc")}
                  diagram={theoryOfChange.mermaid_diagram}
                  previewUrl={theoryOfChange.mermaid_preview_url}
                  pngUrl={theoryOfChange.mermaid_png_url}
                  svgUrl={theoryOfChange.mermaid_svg_url}
                  widePreview
                  language={language}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
