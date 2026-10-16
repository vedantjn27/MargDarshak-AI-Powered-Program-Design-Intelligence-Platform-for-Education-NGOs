"use client"

import { ArrowRight, BookTemplate, Check, ClipboardList, GitFork, Lightbulb, Loader2, Target, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { presentableText } from "@/lib/presentation"
import type { LFATemplate } from "@/lib/api"
import { CatalogCover } from "@/components/catalog-cover"

export type TemplateDetail = {
  name: string
  theme?: string
  system_level?: string
  overview?: string
  best_for?: string
  sections?: string[]
  section_cards?: { title: string; description: string }[]
  workflow?: { title: string; description: string }[]
  adaptation_tips?: string[]
}

type Props = {
  detail: TemplateDetail | null
  template?: LFATemplate | null
  loading: boolean
  language: string
  onClose: () => void
  onFork?: () => void
}

const sectionGuidance = {
  en: [
    "Who needs support, and what evidence shows the gap?",
    "What measurable change should happen, and by when?",
    "What will your team deliver to create that change?",
    "How will you check progress and adjust the plan?",
  ],
  hi: [
    "किसे सहायता चाहिए और इसका प्रमाण क्या है?",
    "कौन-सा मापने योग्य बदलाव कब तक चाहिए?",
    "उस बदलाव के लिए आपकी टीम क्या करेगी?",
    "प्रगति कैसे जाँचेंगे और योजना कैसे सुधारेंगे?",
  ],
}

const fallbackTitles: Record<string, { en: string[]; hi: string[] }> = {
  fln: {
    en: ["Learning gap", "Reading or numeracy goal", "Classroom practice", "Assessment and progress"],
    hi: ["सीखने में कमी", "पढ़ने या गणित का लक्ष्य", "कक्षा में अभ्यास", "मूल्यांकन और प्रगति"],
  },
  career_readiness: {
    en: ["Student aspirations", "Career readiness goal", "Mentoring and exposure", "Transition evidence"],
    hi: ["विद्यार्थियों की आकांक्षाएँ", "करियर तैयारी का लक्ष्य", "मार्गदर्शन और अनुभव", "आगे बढ़ने का प्रमाण"],
  },
  teacher_development: {
    en: ["Teaching challenge", "Classroom change", "Coaching plan", "Observation evidence"],
    hi: ["शिक्षण की चुनौती", "कक्षा में बदलाव", "कोचिंग योजना", "अवलोकन का प्रमाण"],
  },
  digital_learning: {
    en: ["Access barrier", "Learning purpose", "Tools and teacher support", "Use and learning evidence"],
    hi: ["पहुँच की बाधा", "सीखने का उद्देश्य", "उपकरण और शिक्षक सहायता", "उपयोग और सीखने का प्रमाण"],
  },
  stem: {
    en: ["Skill gap", "Inquiry goal", "Hands-on activities", "Student work and evidence"],
    hi: ["कौशल में कमी", "खोज का लक्ष्य", "व्यावहारिक गतिविधियाँ", "विद्यार्थी कार्य और प्रमाण"],
  },
  inclusive_education: {
    en: ["Participation barrier", "Inclusion goal", "Classroom adaptations", "Learner feedback"],
    hi: ["भागीदारी की बाधा", "समावेशन का लक्ष्य", "कक्षा में अनुकूलन", "विद्यार्थियों की प्रतिक्रिया"],
  },
}

function sectionsForDisplay(detail: TemplateDetail | null, template: LFATemplate | null | undefined, language: string) {
  const locale = language === "hi" ? "hi" : "en"
  const descriptions = sectionGuidance[locale]
  const withDescription = (title: unknown, description: unknown, index: number) => ({
    title: presentableText(title, language).trim(),
    description: presentableText(description, language).trim() || descriptions[index % descriptions.length],
  })

  const cards = (detail?.section_cards || [])
    .map((section, index) => withDescription(section?.title, section?.description, index))
    .filter((section) => section.title)
  if (cards.length) return cards

  const legacy = (detail?.sections || [])
    .map((title, index) => withDescription(title, "", index))
    .filter((section) => section.title)
  if (legacy.length) return legacy

  const structure = template?.lfa_structure || {}
  const listed = Array.isArray(structure.sections) ? structure.sections : []
  const fromList = listed
    .map((section: unknown, index: number) => typeof section === "object" && section !== null
      ? withDescription((section as Record<string, unknown>).title || (section as Record<string, unknown>).name, (section as Record<string, unknown>).description, index)
      : withDescription(section, "", index))
    .filter((section: { title: string }) => section.title)
  if (fromList.length) return fromList.slice(0, 6)

  const fromStructure = Object.entries(structure)
    .filter(([key, value]) => key !== "sections" && value != null && value !== "" && !(Array.isArray(value) && !value.length))
    .slice(0, 4)
    .map(([key, value], index) => withDescription(key.replaceAll("_", " "), value, index))
  if (fromStructure.length) return fromStructure

  const theme = (detail?.theme || template?.theme || "").toLowerCase().replaceAll(" ", "_")
  const titles = fallbackTitles[theme]?.[locale] || (locale === "hi"
    ? ["समस्या और लोग", "अपेक्षित बदलाव", "गतिविधियाँ और परिणाम", "प्रगति का प्रमाण"]
    : ["Need and people", "Expected change", "Activities and outputs", "Evidence of progress"])
  return titles.map((title, index) => withDescription(title, "", index))
}

export function TemplateDetailDialog({ detail, template, loading, language, onClose, onFork }: Props) {
  const hindi = language === "hi"
  const sections = sectionsForDisplay(detail, template, language)
  const workflow = detail?.workflow || []

  return (
    <Dialog open={!!detail} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="!fixed !inset-0 !left-0 !top-0 !flex !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 overflow-hidden !rounded-none !border-0 !p-0 sm:!max-w-none"
      >
        <header className="shrink-0 border-b bg-background px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
            <DialogHeader className="min-w-0 flex-1 text-left">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <BookTemplate className="h-4 w-4" aria-hidden="true" />
                {hindi ? "टेम्पलेट गाइड" : "Template guide"}
              </p>
              <DialogTitle className="text-2xl leading-tight sm:text-3xl">{detail?.name || (hindi ? "टेम्पलेट" : "Template")}</DialogTitle>
              <DialogDescription>{hindi ? "इस योजना में क्या है और इसे अपने कार्यक्रम के लिए कैसे अपनाएँ" : "See the plan, then make it your own"}</DialogDescription>
            </DialogHeader>
            <div className="flex shrink-0 items-center gap-2">
              {onFork && <Button onClick={onFork} size="sm" className="hidden sm:inline-flex"><GitFork className="mr-2 h-4 w-4" />{hindi ? "अपनी कॉपी बनाएँ" : "Use this template"}</Button>}
              <DialogClose asChild>
                <Button variant="outline" size="icon" aria-label={hindi ? "टेम्पलेट विवरण बंद करें" : "Close template details"}>
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
          <main className="mx-auto max-w-7xl space-y-7 px-5 py-7 sm:px-8 sm:py-9">
            {loading ? (
              <div className="flex min-h-[50vh] items-center justify-center gap-3 text-muted-foreground" role="status">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                {hindi ? "टेम्पलेट तैयार हो रहा है..." : "Preparing the template guide..."}
              </div>
            ) : (
              <>
                <CatalogCover title={detail?.name || template?.name || ""} theme={detail?.theme || template?.theme} category={hindi ? "टेम्पलेट" : "Template"} large className="rounded-2xl" />
                <div className="flex flex-wrap gap-2">
                  {detail?.theme && <Badge variant="secondary" className="px-3 py-1 text-xs">{detail.theme.replaceAll("_", " ")}</Badge>}
                  {detail?.system_level && <Badge variant="outline" className="px-3 py-1 text-xs">{detail.system_level.replaceAll("_", " ")}</Badge>}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.5fr)]">
                  <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Target className="h-4 w-4" />{hindi ? "मुख्य विचार" : "The idea"}</p>
                    <p className="mt-4 max-w-3xl text-xl font-semibold leading-relaxed sm:text-2xl">{presentableText(detail?.overview, language)}</p>
                  </section>
                  <section className="rounded-2xl border bg-card p-6 sm:p-7">
                    <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Lightbulb className="h-4 w-4" />{hindi ? "किसके लिए उपयोगी" : "Best fit"}</p>
                    <p className="mt-4 text-base leading-relaxed">{presentableText(detail?.best_for, language)}</p>
                  </section>
                </div>

                {workflow.length > 0 && <section className="rounded-2xl border bg-card p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">{hindi ? "यह योजना कैसे आगे बढ़ती है" : "How the plan moves forward"}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{hindi ? "अपने स्थानीय प्रमाण के अनुसार चरण बदलें।" : "An example pathway; adapt each step using local evidence."}</p>
                    </div>
                    <Badge variant="outline">{hindi ? "उदाहरण" : "Example"}</Badge>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:gap-2">
                    {workflow.map((step, index) => <div key={`${step.title}-${index}`} className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row">
                      <div className="flex min-w-0 flex-1 items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
                        <div className="min-w-0">
                          <h3 className="font-semibold leading-snug">{presentableText(step.title, language)}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{presentableText(step.description, language)}</p>
                        </div>
                      </div>
                      {index < workflow.length - 1 && <ArrowRight className="h-5 w-5 shrink-0 self-center rotate-90 text-primary/70 lg:rotate-0" aria-hidden="true" />}
                    </div>)}
                  </div>
                </section>}

                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
                  <section className="rounded-2xl border bg-card p-6 sm:p-8">
                    <h2 className="flex items-center gap-2 text-xl font-bold"><ClipboardList className="h-5 w-5 text-primary" />{hindi ? "इसमें क्या भरेंगे" : "What you'll fill in"}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{hindi ? "हर भाग आपकी योजना को स्पष्ट बनाता है।" : "Each part turns the idea into a usable plan."}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {sections.map((section, index) => <article key={`${section.title}-${index}`} className="rounded-xl border bg-muted/30 p-5">
                        <span className="text-xs font-bold tracking-widest text-primary">{String(index + 1).padStart(2, "0")}</span>
                        <h3 className="mt-2 text-base font-bold leading-snug">{presentableText(section.title, language)}</h3>
                        {section.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{presentableText(section.description, language)}</p>}
                      </article>)}
                    </div>
                  </section>
                  <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
                    <h2 className="text-xl font-bold">{hindi ? "इसे अपना बनाएँ" : "Make it yours"}</h2>
                    <div className="mt-5 space-y-4">
                      {(detail?.adaptation_tips || []).map((tip, index) => <div key={index} className="flex gap-3 text-sm leading-relaxed">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"><Check className="h-3.5 w-3.5" /></span>
                        <p>{presentableText(tip, language)}</p>
                      </div>)}
                    </div>
                    {onFork && <Button onClick={onFork} className="mt-7 w-full"><GitFork className="mr-2 h-4 w-4" />{hindi ? "अपनी कॉपी बनाएँ" : "Use this template"}</Button>}
                  </section>
                </div>
              </>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}
