"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { PracticeSuggestionBoard } from "@/components/practice-suggestion-board"
import { stakeholderApi, practiceApi, type PracticeChangeResponse } from "@/lib/api"
import { toast } from "sonner"
import {
  Users,
  Sparkles,
  Loader2,
  CheckCircle2,
  Star,
  ArrowRight,
  UserCircle,
  GraduationCap,
  School,
  Building,
  Briefcase,
  Heart,
  Plus,
} from "lucide-react"

const stakeholderIcons: Record<string, any> = {
  teacher: GraduationCap,
  student: UserCircle,
  parent: Heart,
  principal: Building,
  official: Briefcase,
  ngo: School,
}

export default function StakeholdersPage() {
  const { language, t } = useLanguage()
  const { currentOrganization, activeTheme, updateLFASnapshot } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [stakeholders, setStakeholders] = useState<any[]>([])
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([])
  const [recommended, setRecommended] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("select")

  // Practice change state
  const [selectedForPractice, setSelectedForPractice] = useState<string | null>(null)
  const [currentPractices, setCurrentPractices] = useState<string[]>([""])
  const [desiredPractices, setDesiredPractices] = useState<string[]>([""])
  const [practiceResult, setPracticeResult] = useState<PracticeChangeResponse | null>(null)

  const handleFetchStakeholders = async () => {
    setLoading(true)
    try {
      const result = await stakeholderApi.select(
        {
          organization_id: currentOrganization!._id,
          theme: activeTheme || currentOrganization!.thematic_focus[0],
        },
        language,
      )

      setStakeholders(result.available_stakeholders)
      setRecommended(result.recommended_stakeholders)
      setSelectedStakeholders(result.selected_stakeholders?.length ? result.selected_stakeholders : result.recommended_stakeholders)

      updateLFASnapshot("stakeholders", result.recommended_stakeholders)
      toast.success(language === "en" ? "Stakeholders loaded!" : "हितधारक लोड हो गए!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleStakeholder = (id: string) => {
    setSelectedStakeholders((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const saveStakeholders = async () => {
    if (!currentOrganization) return
    try {
      await stakeholderApi.saveSelection(currentOrganization._id, activeTheme || currentOrganization.thematic_focus[0], selectedStakeholders, language)
      updateLFASnapshot("stakeholders", selectedStakeholders)
      setActiveTab("practice")
    } catch (error: any) { toast.error(error.message) }
  }

  const handleDefinePractice = async () => {
    if (!selectedForPractice) return

    const filledCurrent = currentPractices.filter((p) => p.trim())
    const filledDesired = desiredPractices.filter((p) => p.trim())

    if (filledCurrent.length === 0 || filledDesired.length === 0) {
      toast.error(
        language === "en"
          ? "Please add at least one current and desired practice"
          : "कृपया कम से कम एक वर्तमान और वांछित अभ्यास जोड़ें",
      )
      return
    }

    setPracticeLoading(true)
    try {
      const result = await practiceApi.define(
        {
          organization_id: currentOrganization!._id,
          theme: activeTheme || currentOrganization!.thematic_focus[0],
          stakeholder_id: selectedForPractice,
          current_practices: filledCurrent,
          desired_practices: filledDesired,
        },
        language,
      )

      setPracticeResult(result)
      updateLFASnapshot("practice_changes", {
        ...(useAppStore.getState().lfaSnapshot as any).practice_changes,
        [selectedForPractice]: {
          current: filledCurrent,
          desired: filledDesired,
          ai_suggestions: result.ai_suggestions,
        },
      })

      toast.success(language === "en" ? "Practice change defined!" : "अभ्यास परिवर्तन परिभाषित!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setPracticeLoading(false)
    }
  }

  const addPractice = (type: "current" | "desired") => {
    setPracticeResult(null)
    if (type === "current") {
      setCurrentPractices([...currentPractices, ""])
    } else {
      setDesiredPractices([...desiredPractices, ""])
    }
  }

  const updatePractice = (type: "current" | "desired", index: number, value: string) => {
    setPracticeResult(null)
    if (type === "current") {
      const updated = [...currentPractices]
      updated[index] = value
      setCurrentPractices(updated)
    } else {
      const updated = [...desiredPractices]
      updated[index] = value
      setDesiredPractices(updated)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              {t("nav.stakeholders")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === "en"
                ? "Identify key stakeholders and define practice changes"
                : "प्रमुख हितधारकों की पहचान करें और अभ्यास परिवर्तनों को परिभाषित करें"}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="select">{language === "en" ? "Select Stakeholders" : "हितधारक चुनें"}</TabsTrigger>
            <TabsTrigger value="practice" disabled={selectedStakeholders.length === 0}>
              {language === "en" ? "Practice Changes" : "अभ्यास परिवर्तन"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="mt-6 space-y-6">
            {stakeholders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === "en" ? "Get AI-Recommended Stakeholders" : "AI-अनुशंसित हितधारक प्राप्त करें"}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    {language === "en"
                      ? "Based on your organization profile and thematic focus, we'll recommend the key stakeholders for your program."
                      : "आपकी संगठन प्रोफ़ाइल और विषयगत फोकस के आधार पर, हम आपके कार्यक्रम के लिए प्रमुख हितधारकों की सिफारिश करेंगे।"}
                  </p>
                  <Button onClick={handleFetchStakeholders} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === "en" ? "Loading..." : "लोड हो रहा है..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {language === "en" ? "Get Recommendations" : "सिफारिशें प्राप्त करें"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Available Stakeholders */}
                <Card>
                  <CardHeader>
                    <CardTitle>{language === "en" ? "Available Stakeholders" : "उपलब्ध हितधारक"}</CardTitle>
                    <CardDescription>
                      {language === "en"
                        ? "Select stakeholders relevant to your program"
                        : "अपने कार्यक्रम से संबंधित हितधारकों का चयन करें"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stakeholders.map((stakeholder) => {
                        const isSelected = selectedStakeholders.includes(stakeholder.stakeholder_id)
                        const isRecommended = recommended.includes(stakeholder.stakeholder_id)
                        const Icon = stakeholderIcons[stakeholder.stakeholder_id] || UserCircle

                        return (
                          <div
                            key={stakeholder.stakeholder_id}
                            onClick={() => toggleStakeholder(stakeholder.stakeholder_id)}
                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? "bg-primary/10 border-primary/50 shadow-sm"
                                : "hover:border-primary/30 hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{stakeholder.name}</p>
                                <div className="flex gap-1 mt-1">
                                  {stakeholder.themes?.slice(0, 2).map((theme: string) => (
                                    <Badge key={theme} variant="secondary" className="text-xs">
                                      {theme}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isRecommended && (
                                <Badge variant="outline" className="bg-warning/10 border-warning text-warning">
                                  <Star className="h-3 w-3 mr-1" />
                                  {language === "en" ? "Recommended" : "अनुशंसित"}
                                </Badge>
                              )}
                              {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>{language === "en" ? "Selected Stakeholders" : "चयनित हितधारक"}</CardTitle>
                    <CardDescription>
                      {selectedStakeholders.length} {language === "en" ? "stakeholders selected" : "हितधारक चयनित"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedStakeholders.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStakeholders.map((id) => {
                          const stakeholder = stakeholders.find((s) => s.stakeholder_id === id)
                          const Icon = stakeholderIcons[id] || UserCircle
                          return (
                            <div key={id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{stakeholder?.name || id}</span>
                            </div>
                          )
                        })}
                        <Button
                          className="w-full mt-4"
                          onClick={saveStakeholders}
                        >
                          {language === "en" ? "Continue to Practice Changes" : "अभ्यास परिवर्तनों पर जाएं"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {language === "en" ? "No stakeholders selected yet" : "अभी तक कोई हितधारक नहीं चुना गया"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="practice" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Stakeholder Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "en" ? "Select Stakeholder" : "हितधारक चुनें"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedStakeholders.map((id) => {
                      const stakeholder = stakeholders.find((s) => s.stakeholder_id === id)
                      const Icon = stakeholderIcons[id] || UserCircle
                      const isActive = selectedForPractice === id

                      return (
                        <div
                          key={id}
                          onClick={() => { setSelectedForPractice(id); setPracticeResult(null); setCurrentPractices([""]); setDesiredPractices([""]) }}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                            isActive ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                          <span className={isActive ? "font-medium" : ""}>{stakeholder?.name || id}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Practice Definition */}
              {selectedForPractice && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>{language === "en" ? "Define Practice Changes" : "अभ्यास परिवर्तन परिभाषित करें"}</CardTitle>
                    <CardDescription>
                      {language === "en"
                        ? "What changes do you want this stakeholder to make?"
                        : "आप इस हितधारक से क्या परिवर्तन चाहते हैं?"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Practices */}
                    <div className="space-y-3">
                      <Label>{language === "en" ? "Current Practices" : "वर्तमान अभ्यास"}</Label>
                      {currentPractices.map((practice, index) => (
                        <Textarea
                          key={index}
                          value={practice}
                          onChange={(e) => updatePractice("current", index, e.target.value)}
                          placeholder={
                            language === "en"
                              ? "Describe what this stakeholder currently does..."
                              : "वर्णन करें कि यह हितधारक वर्तमान में क्या करता है..."
                          }
                          className="min-h-[80px]"
                        />
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addPractice("current")}>
                        <Plus className="h-4 w-4 mr-1" />
                        {language === "en" ? "Add Practice" : "अभ्यास जोड़ें"}
                      </Button>
                    </div>

                    {/* Desired Practices */}
                    <div className="space-y-3">
                      <Label>{language === "en" ? "Desired Practices" : "वांछित अभ्यास"}</Label>
                      {desiredPractices.map((practice, index) => (
                        <Textarea
                          key={index}
                          value={practice}
                          onChange={(e) => updatePractice("desired", index, e.target.value)}
                          placeholder={
                            language === "en"
                              ? "Describe what you want this stakeholder to do..."
                              : "वर्णन करें कि आप इस हितधारक से क्या चाहते हैं..."
                          }
                          className="min-h-[80px]"
                        />
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addPractice("desired")}>
                        <Plus className="h-4 w-4 mr-1" />
                        {language === "en" ? "Add Practice" : "अभ्यास जोड़ें"}
                      </Button>
                    </div>

                    <Button onClick={handleDefinePractice} disabled={practiceLoading} className="w-full">
                      {practiceLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {language === "en" ? "Analyzing..." : "विश्लेषण हो रहा है..."}
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {language === "en" ? "Get AI Suggestions" : "AI सुझाव प्राप्त करें"}
                        </>
                      )}
                    </Button>

                  </CardContent>
                </Card>
              )}
            </div>
            {practiceResult && <PracticeSuggestionBoard result={practiceResult} language={language} />}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
