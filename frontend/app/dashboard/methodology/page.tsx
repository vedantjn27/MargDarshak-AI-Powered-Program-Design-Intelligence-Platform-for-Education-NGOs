"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MethodologyDetailDialog } from "@/components/methodology-detail-dialog"
import { CatalogCover } from "@/components/catalog-cover"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { presentableText } from "@/lib/presentation"
import { methodologyApi } from "@/lib/api"
import { toast } from "sonner"
import {
  Workflow,
  Sparkles,
  Loader2,
  CheckCircle2,
  MapPin,
  IndianRupee,
  School,
  Lightbulb,
  Library,
} from "lucide-react"

const focusLabels: Record<string, { en: string; hi: string }> = {
  fln: { en: "Foundational literacy and numeracy", hi: "बुनियादी साक्षरता और संख्यात्मकता" },
  career_readiness: { en: "Career readiness", hi: "करियर तैयारी" },
  teacher_development: { en: "Teacher development", hi: "शिक्षक विकास" },
  digital_learning: { en: "Digital learning", hi: "डिजिटल शिक्षा" },
  stem: { en: "STEM education", hi: "STEM शिक्षा" },
  inclusive_education: { en: "Inclusive education", hi: "समावेशी शिक्षा" },
}

export default function MethodologyPage() {
  const { language, t } = useLanguage()
  const { currentOrganization, activeTheme, updateLFASnapshot } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [selectLoading, setSelectLoading] = useState(false)
  const [allMethodologiesLoading, setAllMethodologiesLoading] = useState(false)
  const [allMethodologies, setAllMethodologies] = useState<any[]>([])
  const [libraryError, setLibraryError] = useState("")
  const [savedMethodologies, setSavedMethodologies] = useState<string[]>([])
  const [detail, setDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const detailRequestId = useRef(0)
  const [activeTab, setActiveTab] = useState("browse")

  const [filters, setFilters] = useState({
    theme: activeTheme || currentOrganization?.thematic_focus[0] || "",
    state: currentOrganization?.geography.state || "",
    scale_schools: currentOrganization?.reach_metrics?.schools || 0,
    budget_lakhs: 10,
  })

  const [methodologies, setMethodologies] = useState<any[]>([])
  const [alternativeMethodologies, setAlternativeMethodologies] = useState<any[]>([])
  const [filterMessage, setFilterMessage] = useState("")
  const [selectedMethodologies, setSelectedMethodologies] = useState<string[]>([])
  const [customComponents, setCustomComponents] = useState<string[]>([])
  const [newComponent, setNewComponent] = useState("")

  useEffect(() => {
    if (currentOrganization?._id) {
      setFilters((previous) => ({ ...previous, theme: activeTheme || currentOrganization.thematic_focus[0], state: currentOrganization.geography.state, scale_schools: currentOrganization.reach_metrics?.schools || 0 }))
      fetchAllMethodologies()
      methodologyApi.getSaved(currentOrganization._id, activeTheme || currentOrganization.thematic_focus[0], language).then((saved) => {
        setSavedMethodologies(saved.selected_methodology_ids)
        setSelectedMethodologies(saved.selected_methodology_ids)
        setCustomComponents(saved.custom_components)
      }).catch(() => {})
    }
  }, [currentOrganization?._id, activeTheme, language])

  const fetchAllMethodologies = async () => {
    setAllMethodologiesLoading(true)
    setLibraryError("")
    try {
      if (!currentOrganization) return
      const result = await methodologyApi.getAll(currentOrganization._id, activeTheme || currentOrganization.thematic_focus[0], language)
      setAllMethodologies(result.methodologies)
    } catch (error: any) {
      setAllMethodologies([])
      setLibraryError(error.message || (language === "hi" ? "पद्धतियाँ लोड नहीं हो सकीं।" : "Could not load methodologies."))
    } finally {
      setAllMethodologiesLoading(false)
    }
  }

  const handleFetchMethodologies = async () => {
    setLoading(true)
    try {
      if (!currentOrganization) return
      const result = await methodologyApi.filter({ ...filters, organization_id: currentOrganization._id }, language)
      setMethodologies(result.methodologies)
      setAlternativeMethodologies(result.alternatives || [])
      setFilterMessage(result.methodologies.length ? "" : result.alternatives?.length
        ? (language === "hi" ? "सभी फ़िल्टर से सटीक मिलान नहीं मिला। नीचे दी गई पद्धतियाँ आपके विषय से संबंधित हैं, लेकिन इन्हें स्थानीय परिस्थिति या बजट के अनुसार ढालना होगा।" : "No exact match. These methods fit your focus, but need a local or budget review.")
        : (language === "hi" ? "इस विषय के लिए लाइब्रेरी में अभी कोई पद्धति नहीं है।" : "No library methods are available for this focus yet."))
      if (result.methodologies.length || result.alternatives?.length) {
        toast.success(language === "en" ? "Methodologies loaded!" : "पद्धतियां लोड हो गईं!")
      }
    } catch (error: any) {
      setMethodologies([])
      setAlternativeMethodologies([])
      toast.error(error.message)
      setFilterMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleMethodology = (name: string) => {
    setSelectedMethodologies((prev) => (prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]))
  }

  const openDetail = async (name: string) => {
    if (!currentOrganization) return
    const requestId = ++detailRequestId.current
    setDetail({ name })
    setDetailLoading(true)
    try {
      const result = await methodologyApi.getDetail(currentOrganization._id, name, language)
      if (detailRequestId.current === requestId) setDetail(result)
    } catch (error: any) {
      if (detailRequestId.current === requestId) {
        toast.error(error.message)
        setDetail(null)
      }
    } finally {
      if (detailRequestId.current === requestId) setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    detailRequestId.current += 1
    setDetail(null)
    setDetailLoading(false)
  }

  const addCustomComponent = () => {
    if (newComponent.trim() && !customComponents.includes(newComponent.trim())) {
      setCustomComponents([...customComponents, newComponent.trim()])
      setNewComponent("")
    }
  }

  const removeCustomComponent = (component: string) => {
    setCustomComponents(customComponents.filter((c) => c !== component))
  }

  const handleSelectMethodologies = async () => {
    if (selectedMethodologies.length === 0) {
      toast.error(language === "en" ? "Please select at least one methodology" : "कृपया कम से कम एक पद्धति चुनें")
      return
    }

    setSelectLoading(true)
    try {
      await methodologyApi.select(
        {
          organization_id: currentOrganization!._id,
          theme: activeTheme || currentOrganization!.thematic_focus[0],
          selected_methodology_ids: selectedMethodologies,
          custom_components: customComponents,
        },
        language,
      )

      updateLFASnapshot("methodology", {
        selected: selectedMethodologies,
        custom_components: customComponents,
      })
      setSavedMethodologies(selectedMethodologies)
      setActiveTab("saved")

      toast.success(language === "en" ? "Methodologies saved!" : "पद्धतियां सहेज दी गईं!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSelectLoading(false)
    }
  }

  const MethodologyCard = ({
    methodology,
    index,
    showCheckbox = true,
  }: { methodology: any; index: number; showCheckbox?: boolean }) => {
    const catalogName = methodology.catalog_name || methodology.name
    const isSelected = selectedMethodologies.includes(catalogName)
    const localExperience = methodology.geographies?.some((place: string) => place.toLowerCase() === "all" || place.toLowerCase() === currentOrganization?.geography.state.toLowerCase())

    return (
      <Card
        key={index}
        className={`group cursor-pointer overflow-hidden p-0 transition-all ${
          isSelected ? "border-primary bg-primary/5 shadow-md" : "hover:border-primary/30"
        }`}
        onClick={() => showCheckbox && toggleMethodology(catalogName)}
      >
        <CatalogCover title={methodology.name} theme={methodology.theme || activeTheme || ""} category={language === "hi" ? "कार्यपद्धति" : "Methodology"} />
        <CardHeader>
          <div className="flex items-start justify-end">
            {showCheckbox && <Checkbox checked={isSelected} />}
          </div>
          <CardDescription>{presentableText(methodology.description, language)}</CardDescription>
          {methodology.fit_reason && <p className="text-sm text-primary">{presentableText(methodology.fit_reason, language)}</p>}
          {methodology.filter_note && <p className="text-sm text-muted-foreground">{presentableText(methodology.filter_note, language)}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); openDetail(catalogName) }}>{language === "hi" ? "विस्तार से देखें" : "Explore full method"}</Button>
          {/* Components */}
          {methodology.components && (
            <div>
              <p className="text-sm font-medium mb-2">{language === "en" ? "Components:" : "घटक:"}</p>
              <div className="flex flex-wrap gap-2">
                {methodology.components.map((component: string, i: number) => (
                  <Badge key={i} variant="secondary">
                    {component}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Geographies */}
          {methodology.geographies && (
            <div>
              <p className="text-sm font-medium mb-2">{language === "en" ? "Used in:" : "में उपयोग किया गया:"}</p>
              <div className="flex flex-wrap gap-2">
                {methodology.geographies.map((geo: string, i: number) => (
                  <Badge key={i} variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    {geo}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {methodology.geographies?.length > 0 && !localExperience && <p className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">{language === "hi" ? "इस पद्धति का अनुभव दूसरे राज्यों से है। सहेजने से पहले अपने क्षेत्र में उपयुक्तता जाँचें।" : "Catalog experience is from other states. Check local fit before saving this method."}</p>}

          {/* Budget Range */}
          {methodology.budget_range_lakhs && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              {language === "en" ? "Budget:" : "बजट:"} ₹{methodology.budget_range_lakhs[0]}L - ₹
              {methodology.budget_range_lakhs[1]}L
            </div>
          )}

          {/* Theme */}
          {methodology.theme && (
            <Badge variant="outline" className="bg-primary/10">
              {methodology.theme}
            </Badge>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Workflow className="h-8 w-8 text-primary" />
            {t("nav.methodology")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Browse all methodologies or filter based on your context"
              : "सभी पद्धतियां ब्राउज़ करें या अपने संदर्भ के आधार पर फ़िल्टर करें"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">
              <Library className="h-4 w-4 mr-2" />
              {language === "en" ? "Browse All" : "सभी ब्राउज़ करें"}
            </TabsTrigger>
            <TabsTrigger value="filter">
              <Sparkles className="h-4 w-4 mr-2" />
              {language === "en" ? "Filter & Select" : "फ़िल्टर और चुनें"}
            </TabsTrigger>
            <TabsTrigger value="saved">{language === "hi" ? "सहेजे गए" : "Saved"}</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6 space-y-6">
            {allMethodologiesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : libraryError ? (
              <Card className="border-warning/40">
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <h3 className="text-lg font-semibold">{language === "hi" ? "पद्धतियाँ लोड नहीं हो सकीं" : "Could not load methodologies"}</h3>
                  <p className="max-w-xl text-sm text-muted-foreground">{libraryError}</p>
                  <Button variant="outline" onClick={fetchAllMethodologies}>{language === "hi" ? "फिर से कोशिश करें" : "Try again"}</Button>
                </CardContent>
              </Card>
            ) : allMethodologies.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Library className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {language === "en" ? "No methodologies available" : "कोई पद्धति उपलब्ध नहीं"}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {language === "en"
                      ? `No library methods currently match ${activeTheme || currentOrganization?.thematic_focus[0] || "this focus"}. Choose another registered focus or add methods for this area.`
                      : "इस चुने हुए विषय के लिए लाइब्रेरी में अभी कोई पद्धति नहीं है। दूसरे पंजीकृत विषय को चुनें या इस विषय की पद्धतियाँ जोड़ें।"}
                  </p>
                  <Button variant="outline" className="mt-3" onClick={fetchAllMethodologies}>{language === "hi" ? "रीफ्रेश" : "Refresh"}</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {language === "en"
                      ? `${allMethodologies.length} methodologies available`
                      : `${allMethodologies.length} पद्धतियां उपलब्ध`}
                  </p>
                  <Button variant="outline" onClick={fetchAllMethodologies}>
                    <Loader2 className={`h-4 w-4 mr-2 ${allMethodologiesLoading ? "animate-spin" : ""}`} />
                    {language === "en" ? "Refresh" : "रीफ्रेश"}
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {allMethodologies.map((methodology, index) => (
                    <MethodologyCard key={index} methodology={methodology} index={index} showCheckbox={true} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6 space-y-4">
            {savedMethodologies.length ? <div className="grid gap-4 md:grid-cols-2">{savedMethodologies.map((name, index) => <MethodologyCard key={name} index={index} showCheckbox={false} methodology={allMethodologies.find((item) => item.catalog_name === name || item.name === name) || { name, theme: activeTheme || currentOrganization?.thematic_focus[0], description: "" }} />)}</div> : <p className="text-muted-foreground">{language === "hi" ? "अभी कोई पद्धति सहेजी नहीं गई है।" : "No methodologies saved yet."}</p>}
          </TabsContent>

          {/* Filter Tab - existing functionality */}
          <TabsContent value="filter" className="mt-6 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Filter Methodologies" : "पद्धतियां फ़िल्टर करें"}</CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Set your parameters to find relevant approaches"
                    : "प्रासंगिक दृष्टिकोण खोजने के लिए अपने पैरामीटर सेट करें"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      {language === "en" ? "Theme" : "विषय"}
                    </Label>
                    <Select value={filters.theme} onValueChange={(theme) => setFilters({ ...filters, theme })}>
                      <SelectTrigger><SelectValue placeholder={language === "hi" ? "विषय चुनें" : "Choose focus"} /></SelectTrigger>
                      <SelectContent>{currentOrganization?.thematic_focus.map((focus) => <SelectItem key={focus} value={focus}>{focusLabels[focus]?.[language] || focus.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {language === "en" ? "State" : "राज्य"}
                    </Label>
                    <Input
                      value={filters.state}
                      onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                      placeholder="e.g., Rajasthan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <School className="h-4 w-4" />
                      {language === "en" ? "Number of Schools" : "स्कूलों की संख्या"}
                    </Label>
                    <Input
                      type="number"
                      value={filters.scale_schools}
                      onChange={(e) => setFilters({ ...filters, scale_schools: Number(e.target.value) })}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      {language === "en" ? "Budget (Lakhs)" : "बजट (लाख)"}
                    </Label>
                    <Input
                      type="number"
                      value={filters.budget_lakhs}
                      onChange={(e) => setFilters({ ...filters, budget_lakhs: Number(e.target.value) })}
                      placeholder="10"
                    />
                  </div>
                </div>
                <Button onClick={handleFetchMethodologies} disabled={loading} className="mt-4">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === "en" ? "Searching..." : "खोज रहा है..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {language === "en" ? "Find Methodologies" : "पद्धतियां खोजें"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Methodologies Grid */}
            {filterMessage && <p className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">{filterMessage}</p>}
            {alternativeMethodologies.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">{language === "hi" ? "अनुकूलन के लिए विकल्प" : "Options to adapt"}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {alternativeMethodologies.map((methodology, index) => (
                    <MethodologyCard key={methodology.name} methodology={methodology} index={index} />
                  ))}
                </div>
              </div>
            )}
            {methodologies.length > 0 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {methodologies.map((methodology, index) => (
                    <MethodologyCard key={index} methodology={methodology} index={index} />
                  ))}
                </div>

                {/* Custom Components */}
                <Card>
                  <CardHeader>
                    <CardTitle>{language === "en" ? "Custom Components" : "कस्टम घटक"}</CardTitle>
                    <CardDescription>
                      {language === "en"
                        ? "Add any additional components specific to your program"
                        : "अपने कार्यक्रम के लिए विशिष्ट कोई अतिरिक्त घटक जोड़ें"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newComponent}
                        onChange={(e) => setNewComponent(e.target.value)}
                        placeholder={language === "en" ? "Enter component name..." : "घटक का नाम दर्ज करें..."}
                        onKeyDown={(e) => e.key === "Enter" && addCustomComponent()}
                      />
                      <Button onClick={addCustomComponent} variant="outline">
                        {language === "en" ? "Add" : "जोड़ें"}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {customComponents.map((component, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {component}
                          <button
                            onClick={() => removeCustomComponent(component)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

      <MethodologyDetailDialog detail={detail} loading={detailLoading} language={language} theme={activeTheme || currentOrganization?.thematic_focus[0]} onClose={closeDetail} />

        {/* Save Button - show when methodologies are selected */}
        {selectedMethodologies.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSelectMethodologies} disabled={selectLoading}>
              {selectLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "en" ? "Saving..." : "सहेज रहा है..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {language === "en"
                    ? `Save ${selectedMethodologies.length} Methodologies`
                    : `${selectedMethodologies.length} पद्धतियां सहेजें`}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
