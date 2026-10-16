"use client"

import { ArrowRight, Lightbulb, Pencil, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TheoryOfChangeResponse } from "@/lib/api"
import { presentableText } from "@/lib/presentation"

type Props = { result: TheoryOfChangeResponse; language: string; onEdit: () => void }

export function TocSuggestionBoard({ result, language, onEdit }: Props) {
  const hindi = language === "hi"
  const cards: { title: string; action: string; related_node_ids: string[]; full?: string }[] = result.suggestion_cards?.length
    ? result.suggestion_cards
    : (result.ai_suggestions || []).map((suggestion, index) => {
        const full = presentableText(suggestion, language)
        const words = full.split(/\s+/)
        return {
          title: hindi ? `सुझाव ${index + 1}` : `Idea ${index + 1}`,
          action: words.length > 27 ? `${words.slice(0, 27).join(" ")}…` : full,
          related_node_ids: [] as string[],
          full: words.length > 27 ? full : undefined,
        }
      })

  if (!cards.length && !result.ai_unavailable) return null

  return (
    <section aria-labelledby="toc-suggestions-title" className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" aria-hidden="true" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{hindi ? "बेहतर बदलाव का रास्ता" : "Strengthen the pathway"}</p>
            <h2 id="toc-suggestions-title" className="mt-1 text-2xl font-bold tracking-tight">{hindi ? "AI सुझाव" : "AI suggestions"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{hindi ? "इन विचारों को अपने चरणों और संबंधों में जोड़ें, फिर दोबारा जाँचें।" : "These are proposed changes. Edit your steps or links, then validate again."}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onEdit} className="shrink-0"><Pencil className="mr-2 h-4 w-4" />{hindi ? "डायग्राम बदलें" : "Edit diagram"}</Button>
      </div>

      {cards.length > 0 ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {cards.map((card, index) => (
            <article key={index} className="min-w-0 rounded-xl border border-border/70 bg-background/90 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
                <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug">{presentableText(card.title, language)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{presentableText(card.action, language)}</p>
              {card.full && <details className="mt-3 text-sm"><summary className="cursor-pointer font-medium text-primary">{hindi ? "पूरा सुझाव देखें" : "Read full suggestion"}</summary><p className="mt-2 leading-relaxed text-muted-foreground">{card.full}</p></details>}
              {card.related_node_ids?.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-xs font-medium text-muted-foreground"><ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{hindi ? "संबंधित चरण" : "Related steps"}{card.related_node_ids.map((id) => <span key={id} className="rounded-md bg-primary/10 px-2 py-1 font-bold text-primary">{id}</span>)}</div>}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border bg-background/80 p-4 text-sm text-muted-foreground">{hindi ? "AI सुझाव अभी उपलब्ध नहीं हैं। संरचना की जाँच नीचे दिखाई गई है।" : "AI suggestions are unavailable right now. The structural check and diagram are still available."}</p>
      )}
    </section>
  )
}
