"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { organizationApi, type OrganizationCreate } from "@/lib/api"
import { toast } from "sonner"
import {
  Building2,
  MapPin,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  X,
  Loader2,
  Plus,
  Trash2,
  Briefcase,
} from "lucide-react"

const states = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
]

const themes = [
  { value: "fln", label: "Foundational Literacy & Numeracy (FLN)", labelHi: "बुनियादी साक्षरता और संख्यात्मकता (FLN)" },
  { value: "career_readiness", label: "Career Readiness", labelHi: "करियर तैयारी" },
  { value: "teacher_development", label: "Teacher Development", labelHi: "शिक्षक विकास" },
  { value: "digital_learning", label: "Digital Learning", labelHi: "डिजिटल शिक्षा" },
  { value: "stem", label: "STEM Education", labelHi: "STEM शिक्षा" },
  { value: "inclusive_education", label: "Inclusive Education", labelHi: "समावेशी शिक्षा" },
]

const maturityLevels = [
  { value: "startup", label: "Startup (0-2 years)", labelHi: "स्टार्टअप (0-2 वर्ष)" },
  { value: "growth", label: "Growth (2-5 years)", labelHi: "विकास (2-5 वर्ष)" },
  { value: "scale", label: "Scale (5-10 years)", labelHi: "स्केल (5-10 वर्ष)" },
  { value: "mature", label: "Mature (10+ years)", labelHi: "परिपक्व (10+ वर्ष)" },
]

const teamRoles = [
  { value: "program_manager", label: "Program Manager", labelHi: "कार्यक्रम प्रबंधक" },
  { value: "field_coordinator", label: "Field Coordinator", labelHi: "फील्ड समन्वयक" },
  { value: "teacher_trainer", label: "Teacher Trainer", labelHi: "शिक्षक प्रशिक्षक" },
  { value: "content_developer", label: "Content Developer", labelHi: "सामग्री विकासकर्ता" },
  { value: "data_analyst", label: "Data Analyst", labelHi: "डेटा विश्लेषक" },
  { value: "monitoring_officer", label: "Monitoring Officer", labelHi: "निगरानी अधिकारी" },
  { value: "community_mobilizer", label: "Community Mobilizer", labelHi: "सामुदायिक संगठनकर्ता" },
  { value: "technology_lead", label: "Technology Lead", labelHi: "प्रौद्योगिकी प्रमुख" },
  { value: "research_associate", label: "Research Associate", labelHi: "शोध सहयोगी" },
  { value: "admin_finance", label: "Admin & Finance", labelHi: "प्रशासन और वित्त" },
  { value: "other", label: "Other", labelHi: "अन्य" },
]

interface TeamExpertiseItem {
  role: string
  count: number
}

export default function OrganizationPage() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const { setCurrentOrganization, updateLFASnapshot } = useAppStore()
  const currentOrganization = useAppStore((state) => state.currentOrganization)
  const [loading, setLoading] = useState(false)
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [teamExpertise, setTeamExpertise] = useState<TeamExpertiseItem[]>([])

  const handleThemeToggle = (theme: string) => {
    setSelectedThemes((prev) => (prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]))
  }

  const addTeamExpertise = () => {
    setTeamExpertise([...teamExpertise, { role: "", count: 1 }])
  }

  const updateTeamExpertise = (index: number, field: keyof TeamExpertiseItem, value: string | number) => {
    const updated = [...teamExpertise]
    updated[index] = { ...updated[index], [field]: value }
    setTeamExpertise(updated)
  }

  const removeTeamExpertise = (index: number) => {
    setTeamExpertise(teamExpertise.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.organization_name || !formData.state || selectedThemes.length === 0 || !formData.maturity_level) {
      toast.error(language === "en" ? "Please fill all required fields" : "कृपया सभी आवश्यक फ़ील्ड भरें")
      return
    }

    setLoading(true)

    try {
      const validTeamExpertise = teamExpertise.filter((item) => item.role && item.count > 0)

      const payload: OrganizationCreate = {
        organization_name: formData.organization_name,
        geography: {
          state: formData.state,
          district: formData.district || undefined,
          block: formData.block || undefined,
        },
        thematic_focus: selectedThemes,
        maturity_level: formData.maturity_level,
        team_size: formData.team_size,
        reach_metrics: {
          schools: formData.schools || undefined,
          students: formData.students || undefined,
          teachers: formData.teachers || undefined,
        },
        team_expertise: validTeamExpertise.length > 0 ? validTeamExpertise : undefined,
      }

      const result = await organizationApi.create(payload, language)
      setCurrentOrganization(result)
      updateLFASnapshot("organization_profile", {
        organization_id: result._id,
        theme: selectedThemes[0],
        geography: result.geography,
        scale: formData.schools,
      })

      toast.success(language === "en" ? "Organization profile created!" : "संगठन प्रोफ़ाइल बनाई गई!")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("[v0] Organization creation error:", error)

      const errorMessage = error.message || ""
      if (
        errorMessage.includes("v0 preview") ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("Network error")
      ) {
        toast.error(
          language === "en"
            ? "Cannot connect to backend from preview. Please test locally or deploy your backend."
            : "पूर्वावलोकन से बैकएंड से कनेक्ट नहीं हो सकता। कृपया स्थानीय रूप से परीक्षण करें।",
        )
      } else {
        toast.error(errorMessage || (language === "en" ? "Failed to create profile" : "प्रोफ़ाइल बनाने में विफल"))
      }
    } finally {
      setLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    organization_name: "",
    state: "",
    district: "",
    block: "",
    maturity_level: "",
    team_size: 1,
    schools: 0,
    students: 0,
    teachers: 0,
  })

  if (currentOrganization) return <DashboardLayout>
    <div className="mx-auto max-w-4xl space-y-6">
      <div><h1 className="text-3xl font-bold">{language === "hi" ? "आपका संगठन" : "Your organization"}</h1><p className="text-muted-foreground">{language === "hi" ? "इस खाते से जुड़ी पंजीकृत जानकारी" : "The registered profile linked to this account"}</p></div>
      <Card><CardHeader><CardTitle>{currentOrganization.organization_name}</CardTitle><CardDescription>{currentOrganization.geography.state}{currentOrganization.geography.district ? `, ${currentOrganization.geography.district}` : ""}</CardDescription></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div><p className="text-sm text-muted-foreground">{language === "hi" ? "मुख्य विषय" : "Focus areas"}</p><div className="mt-2 flex flex-wrap gap-2">{currentOrganization.thematic_focus.map((theme) => <Badge key={theme} variant="secondary">{theme.replaceAll("_", " ")}</Badge>)}</div></div>
          <div><p className="text-sm text-muted-foreground">{language === "hi" ? "संगठन का चरण" : "Organization stage"}</p><p className="font-medium capitalize">{currentOrganization.maturity_level}</p></div>
          <div><p className="text-sm text-muted-foreground">{language === "hi" ? "टीम का आकार" : "Team size"}</p><p className="font-medium">{currentOrganization.team_size}</p></div>
          <div><p className="text-sm text-muted-foreground">{language === "hi" ? "पहुँच" : "Reach"}</p><p className="font-medium">{currentOrganization.reach_metrics?.schools || 0} {language === "hi" ? "स्कूल" : "schools"}, {currentOrganization.reach_metrics?.students || 0} {language === "hi" ? "छात्र" : "students"}</p></div>
        </CardContent></Card>
        <Button onClick={() => router.push("/dashboard")}>{language === "hi" ? "कार्यस्थल खोलें" : "Open workspace"}<ArrowRight className="ml-2 h-4 w-4" /></Button>
    </div>
  </DashboardLayout>

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.organization")}</h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Set up your organization profile to get personalized recommendations"
              : "व्यक्तिगत सिफारिशें प्राप्त करने के लिए अपनी संगठन प्रोफ़ाइल सेट करें"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {language === "en" ? "Basic Information" : "मूल जानकारी"}
              </CardTitle>
              <CardDescription>
                {language === "en" ? "Tell us about your organization" : "हमें अपने संगठन के बारे में बताएं"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org_name">{t("org.name")} *</Label>
                <Input
                  id="org_name"
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  placeholder={language === "en" ? "Enter organization name" : "संगठन का नाम दर्ज करें"}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("org.maturity")} *</Label>
                <Select
                  value={formData.maturity_level}
                  onValueChange={(value) => setFormData({ ...formData, maturity_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === "en" ? "Select maturity level" : "परिपक्वता स्तर चुनें"} />
                  </SelectTrigger>
                  <SelectContent>
                    {maturityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {language === "en" ? level.label : level.labelHi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_size">{t("org.team")} *</Label>
                <Input
                  id="team_size"
                  type="number"
                  min={1}
                  value={formData.team_size}
                  onChange={(e) => setFormData({ ...formData, team_size: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {language === "en" ? "Team Expertise" : "टीम विशेषज्ञता"}
              </CardTitle>
              <CardDescription>
                {language === "en"
                  ? "Add the roles and expertise available in your team"
                  : "अपनी टीम में उपलब्ध भूमिकाएं और विशेषज्ञता जोड़ें"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamExpertise.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Select value={item.role} onValueChange={(value) => updateTeamExpertise(index, "role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select role" : "भूमिका चुनें"} />
                      </SelectTrigger>
                      <SelectContent>
                        {teamRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {language === "en" ? role.label : role.labelHi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min={1}
                      value={item.count}
                      onChange={(e) => updateTeamExpertise(index, "count", Number.parseInt(e.target.value) || 1)}
                      placeholder={language === "en" ? "Count" : "संख्या"}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeamExpertise(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addTeamExpertise} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                {language === "en" ? "Add Team Role" : "टीम भूमिका जोड़ें"}
              </Button>

              {teamExpertise.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {language === "en"
                    ? "No team expertise added yet. Click above to add roles."
                    : "अभी तक कोई टीम विशेषज्ञता नहीं जोड़ी गई। भूमिकाएं जोड़ने के लिए ऊपर क्लिक करें।"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Geography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {language === "en" ? "Geography" : "भूगोल"}
              </CardTitle>
              <CardDescription>
                {language === "en" ? "Where does your organization operate?" : "आपका संगठन कहां काम करता है?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("org.state")} *</Label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "en" ? "Select state" : "राज्य चुनें"} />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">{t("org.district")}</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder={language === "en" ? "Enter district" : "जिला दर्ज करें"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block">{language === "en" ? "Block" : "ब्लॉक"}</Label>
                  <Input
                    id="block"
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    placeholder={language === "en" ? "Enter block" : "ब्लॉक दर्ज करें"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thematic Focus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t("org.theme")} *
              </CardTitle>
              <CardDescription>
                {language === "en" ? "Select one or more focus areas" : "एक या अधिक फोकस क्षेत्र चुनें"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <Badge
                    key={theme.value}
                    variant={selectedThemes.includes(theme.value) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-2 px-4"
                    onClick={() => handleThemeToggle(theme.value)}
                  >
                    {language === "en" ? theme.label : theme.labelHi}
                    {selectedThemes.includes(theme.value) && <X className="ml-2 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reach Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t("org.reach")}
              </CardTitle>
              <CardDescription>
                {language === "en" ? "Approximate scale of your operations" : "आपके संचालन का अनुमानित पैमाना"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="schools">{language === "en" ? "Schools" : "स्कूल"}</Label>
                  <Input
                    id="schools"
                    type="number"
                    min={0}
                    value={formData.schools}
                    onChange={(e) => setFormData({ ...formData, schools: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="students">{language === "en" ? "Students" : "छात्र"}</Label>
                  <Input
                    id="students"
                    type="number"
                    min={0}
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teachers">{language === "en" ? "Teachers" : "शिक्षक"}</Label>
                  <Input
                    id="teachers"
                    type="number"
                    min={0}
                    value={formData.teachers}
                    onChange={(e) => setFormData({ ...formData, teachers: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "en" ? "Creating..." : "बना रहा है..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {language === "en" ? "Create & Get AI Analysis" : "बनाएं और AI विश्लेषण प्राप्त करें"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
