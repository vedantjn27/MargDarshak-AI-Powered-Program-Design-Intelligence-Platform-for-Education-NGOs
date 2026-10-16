"use client"

import Image from "next/image"

const covers: Record<string, string> = {
  fln: "/covers/fln.png",
  career_readiness: "/covers/career_readiness.png",
  teacher_development: "/covers/teacher_development.png",
  digital_learning: "/covers/digital_learning.png",
  stem: "/covers/stem.png",
  inclusive_education: "/covers/inclusive_education.png",
}

export function coverFor(theme?: string, title?: string): string {
  const value = `${theme || ""} ${title || ""}`.toLowerCase()
  if (/career|livelihood|employ|youth/.test(value)) return covers.career_readiness
  if (/teacher|coach|pedagog|professional development/.test(value)) return covers.teacher_development
  if (/digital|technology|tablet|edtech|online/.test(value)) return covers.digital_learning
  if (/stem|science|math lab|robot|inquiry/.test(value)) return covers.stem
  if (/inclus|disabil|accessib|special needs/.test(value)) return covers.inclusive_education
  if (/fln|literacy|numeracy|reading|remediation|phonics/.test(value)) return covers.fln
  return covers[theme?.toLowerCase().replaceAll(" ", "_") || ""] || covers.fln
}

function positionFor(title: string): string {
  const score = [...title].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  return `${42 + (score % 17)}% center`
}

type Props = { title: string; theme?: string; category: string; className?: string; large?: boolean; imagePosition?: string }

export function CatalogCover({ title, theme, category, className = "", large = false, imagePosition }: Props) {
  return <div className={`relative isolate overflow-hidden bg-slate-900 ${large ? "h-52 sm:h-64" : "h-44"} ${className}`}>
    <Image src={coverFor(theme, title)} alt="" fill sizes={large ? "100vw" : "(max-width: 768px) 100vw, 33vw"} className="object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: imagePosition || positionFor(title) }} />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
      <span className="rounded-full border border-white/30 bg-slate-950/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">{category}</span>
      <h3 className={`mt-3 max-w-2xl font-bold leading-tight text-white drop-shadow-sm ${large ? "text-2xl sm:text-3xl" : "line-clamp-2 text-xl"}`}>{title}</h3>
    </div>
  </div>
}
