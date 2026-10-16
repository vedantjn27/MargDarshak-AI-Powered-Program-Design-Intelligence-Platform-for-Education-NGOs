"use client"

import { ArrowRight, CheckCircle2, ClipboardList, Lightbulb, Loader2, ShieldAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { presentableText } from "@/lib/presentation"
import { CatalogCover } from "@/components/catalog-cover"

type MethodologyDetail = {
  name: string
  summary?: string
  when_to_use?: string
  workflow?: { title: string; example: string }[]
  implementation_steps?: string[]
  resources_needed?: string[]
  risks?: string[]
  success_measures?: string[]
}

type Props = {
  detail: MethodologyDetail | null
  loading: boolean
  language: string
  theme?: string
  onClose: () => void
}

export function MethodologyDetailDialog({ detail, loading, language, theme, onClose }: Props) {
  const hindi = language === "hi"
  const workflow = detail?.workflow?.length
    ? detail.workflow
    : (detail?.implementation_steps || []).map((step, index) => ({
        title: hindi ? `चरण ${index + 1}` : `Step ${index + 1}`,
        example: step,
      }))

  const quickLists = [
    {
      key: "resources",
      title: hindi ? "क्या चाहिए" : "What you'll need",
      icon: ClipboardList,
      items: detail?.resources_needed || [],
    },
    {
      key: "risks",
      title: hindi ? "पहले क्या जाँचें" : "Check before scaling",
      icon: ShieldAlert,
      items: detail?.risks || [],
    },
    {
      key: "measures",
      title: hindi ? "सफलता कैसे मापें" : "How to measure progress",
      icon: CheckCircle2,
      items: detail?.success_measures || [],
    },
  ]

  return (
    <Dialog open={!!detail} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="!fixed !inset-0 !left-0 !top-0 !flex !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 overflow-hidden !rounded-none !border-0 !p-0 sm:!max-w-none"
      >
        <header className="shrink-0 border-b bg-background px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-5 pr-1">
            <DialogHeader className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {hindi ? "पद्धति एक नज़र में" : "Method at a glance"}
              </p>
              <DialogTitle className="text-2xl leading-tight sm:text-3xl">{detail?.name || (hindi ? "पद्धति" : "Methodology")}</DialogTitle>
              <DialogDescription>
                {hindi ? "यह कैसे काम करती है और आपके कार्यक्रम में कैसे उपयोगी हो सकती है" : "How it works and how it may fit your program"}
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <Button variant="outline" size="icon" aria-label={hindi ? "बंद करें" : "Close methodology details"} className="shrink-0">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
          <main className="mx-auto max-w-7xl space-y-8 px-5 py-7 sm:px-8 sm:py-9">
            {loading ? (
              <div className="flex min-h-[50vh] items-center justify-center gap-3 text-muted-foreground" role="status">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                {hindi ? "पद्धति का विवरण तैयार हो रहा है..." : "Preparing the method guide..."}
              </div>
            ) : (
              <>
                <CatalogCover title={detail?.name || ""} theme={theme} category={hindi ? "कार्यपद्धति" : "Methodology"} large className="rounded-2xl" />
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
                  <section className="rounded-2xl border bg-card p-6 sm:p-7">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">{hindi ? "इसका उद्देश्य" : "The idea"}</p>
                    <p className="mt-3 max-w-3xl text-lg leading-relaxed sm:text-xl">{presentableText(detail?.summary, language)}</p>
                  </section>
                  <section className="rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-7">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Lightbulb className="h-4 w-4" />
                      {hindi ? "आपके संगठन के लिए" : "For your organization"}
                    </div>
                    <p className="mt-3 leading-relaxed">{presentableText(detail?.when_to_use, language)}</p>
                  </section>
                </div>

                <section className="rounded-2xl border bg-card p-6 sm:p-7">
                  <div>
                    <h2 className="text-xl font-semibold">{hindi ? "उदाहरण कार्यप्रवाह" : "Example workflow"}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {hindi ? "इन चरणों को अपने स्कूलों और विद्यार्थियों के अनुसार ढालें।" : "Adapt these steps to your schools and learners."}
                    </p>
                  </div>
                  {workflow.length > 0 ? (
                    <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2 md:overflow-x-auto md:pb-2">
                      {workflow.map((step, index) => (
                        <div key={`${step.title}-${index}`} className="flex min-w-0 flex-1 flex-col gap-3 md:min-w-[190px] md:flex-row md:items-stretch md:gap-2">
                          <div className="min-w-0 flex-1 rounded-xl border border-primary/20 bg-primary/5 p-4">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
                            <h3 className="mt-4 font-semibold leading-snug">{presentableText(step.title, language)}</h3>
                            {step.example && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{presentableText(step.example, language)}</p>}
                          </div>
                          {index < workflow.length - 1 && <ArrowRight className="h-5 w-5 shrink-0 self-center rotate-90 text-primary/70 md:rotate-0" aria-hidden="true" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-muted-foreground">{hindi ? "इस पद्धति के चरण अभी उपलब्ध नहीं हैं।" : "Workflow steps are not available yet."}</p>
                  )}
                </section>

                <div className="grid gap-4 lg:grid-cols-3">
                  {quickLists.map(({ key, title, icon: Icon, items }) => (
                    <section key={key} className="rounded-2xl border bg-card p-6">
                      <h2 className="flex items-center gap-2 font-semibold"><Icon className="h-5 w-5 text-primary" />{title}</h2>
                      <ul className="mt-4 space-y-3">
                        {items.map((item, index) => <li key={index} className="flex gap-2 text-sm leading-relaxed text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{presentableText(item, language)}</li>)}
                      </ul>
                    </section>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}
