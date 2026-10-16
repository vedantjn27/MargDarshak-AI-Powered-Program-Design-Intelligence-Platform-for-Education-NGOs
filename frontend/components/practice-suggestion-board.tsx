"use client"

import { ArrowRight, CircleAlert, Lightbulb, Search, Sparkles, Target } from "lucide-react"
import type { PracticeChangeResponse } from "@/lib/api"
import { presentableText } from "@/lib/presentation"

type Props = { result: PracticeChangeResponse; language: string }
type SuggestionCard = { title: string; summary: string; full?: string }

function legacyCards(values: string[] | undefined, language: string): SuggestionCard[] {
  return (values || []).map((value, index) => {
    const text = presentableText(value, language)
    const words = text.split(/\s+/)
    return {
      title: language === "hi" ? `विचार ${index + 1}` : `Idea ${index + 1}`,
      summary: words.length > 20 ? `${words.slice(0, 20).join(" ")}…` : text,
      full: words.length > 20 ? text : undefined,
    }
  })
}

export function PracticeSuggestionBoard({ result, language }: Props) {
  const hindi = language === "hi"
  const suggestions = result.ai_suggestions
  const current: SuggestionCard[] = suggestions.current_cards?.length
    ? suggestions.current_cards
    : legacyCards(suggestions.suggested_current, language)
  const desired: SuggestionCard[] = suggestions.desired_cards?.length
    ? suggestions.desired_cards
    : legacyCards(suggestions.suggested_desired, language)
  const keyIdea = suggestions.key_idea || desired[0]?.summary || ""
  const firstStep = suggestions.first_step || desired[0]?.summary || ""

  const sections = [
    {
      id: "current",
      title: hindi ? "अतिरिक्त वर्तमान अभ्यास" : "Additional current practices",
      subtitle: hindi ? "जाँचें कि आज क्या हो रहा है" : "Check what may be happening today",
      cards: current,
      Icon: Search,
      className: "border-border bg-card",
      iconClass: "bg-muted text-muted-foreground",
    },
    {
      id: "desired",
      title: hindi ? "अतिरिक्त वांछित अभ्यास" : "Additional desired practices",
      subtitle: hindi ? "इन छोटे बदलावों को आज़माएँ" : "Small actions to try next",
      cards: desired,
      Icon: Target,
      className: "border-primary/30 bg-primary/5",
      iconClass: "bg-primary/15 text-primary",
    },
  ]

  return (
    <section aria-labelledby="practice-suggestions-title" className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card p-6 sm:p-8">
        <div className="absolute -right-14 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-primary" id="practice-suggestions-title">
              {hindi ? "AI सुझाव · मुख्य बदलाव" : "AI suggestions · The key shift"}
            </p>
            <h2 className="mt-2 max-w-4xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {presentableText(keyIdea, language)}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {sections.map(({ id, title, subtitle, cards, Icon, className, iconClass }, sectionIndex) => (
          <div key={id} className="contents">
            {sectionIndex === 1 && (
              <div className="flex items-center justify-center" aria-hidden="true">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-sm">
                  <ArrowRight className="h-5 w-5 rotate-90 xl:rotate-0" />
                </div>
              </div>
            )}
            <section className={`min-w-0 rounded-2xl border p-5 sm:p-6 ${className}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-tight sm:text-2xl">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                </div>
              </div>
              {cards.length > 0 ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {cards.map((card, index) => (
                    <div key={`${id}-${index}`} className="min-w-0 rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm">
                      <span className="text-xs font-bold tabular-nums text-primary">{String(index + 1).padStart(2, "0")}</span>
                      <h4 className="mt-2 text-lg font-bold leading-snug">{presentableText(card.title, language)}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{presentableText(card.summary, language)}</p>
                      {card.full && <details className="mt-3 text-sm"><summary className="cursor-pointer font-medium text-primary">{hindi ? "पूरा विचार देखें" : "Read full idea"}</summary><p className="mt-2 leading-relaxed text-muted-foreground">{card.full}</p></details>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">
                  {hindi ? "इस भाग के लिए अभी कोई अतिरिक्त सुझाव नहीं है।" : "No additional suggestions for this part yet."}
                </p>
              )}
            </section>
          </div>
        ))}
      </div>

      {firstStep && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-bold">{hindi ? "पहला कदम" : "Start here"}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{presentableText(firstStep, language)}</p>
          </div>
        </div>
      )}

      {result.validation_feedback?.length > 0 && (
        <details className="rounded-xl border bg-card p-4 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold">
            <CircleAlert className="h-4 w-4 text-primary" aria-hidden="true" />
            {hindi ? `डिज़ाइन जाँच · ${result.validation_feedback.length} सुझाव` : `Design check · ${result.validation_feedback.length} note${result.validation_feedback.length === 1 ? "" : "s"}`}
          </summary>
          <ul className="mt-3 space-y-2 pl-6 text-muted-foreground">
            {result.validation_feedback.map((item, index) => <li key={index} className="list-disc">{presentableText(item, language)}</li>)}
          </ul>
        </details>
      )}
    </section>
  )
}
