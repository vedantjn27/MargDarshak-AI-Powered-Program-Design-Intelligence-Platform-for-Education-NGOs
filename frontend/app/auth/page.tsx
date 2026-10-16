"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Loader2, LockKeyhole } from "lucide-react"
import { toast } from "sonner"
import { authApi } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AuthPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [mode, setMode] = useState<"signup" | "login">("signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(true)
  const hi = language === "hi"

  useEffect(() => {
    let active = true
    authApi.me().then((session) => {
      if (!active) return
      useAppStore.getState().resetState()
      useAppStore.getState().setCurrentOrganization(session.organization)
      router.replace(session.organization ? "/dashboard" : "/dashboard/organization")
    }).catch(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [router])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const session = mode === "signup" ? await authApi.signup(email, password) : await authApi.login(email, password)
      useAppStore.getState().resetState()
      useAppStore.getState().setCurrentOrganization(session.organization)
      router.replace(session.organization ? "/dashboard" : "/dashboard/organization")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : hi ? "कृपया पुनः प्रयास करें" : "Please try again")
    } finally {
      setBusy(false)
    }
  }

  if (checking) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{hi ? "खाता जाँच रहे हैं..." : "Checking your account..."}</div>

  return <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
    <Card className="w-full max-w-md border-primary/20 shadow-xl">
      <CardHeader className="space-y-4 text-center">
        <Link href="/" className="mx-auto flex items-center gap-2 font-semibold text-primary"><Building2 className="h-6 w-6" /> MargDarshak</Link>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><LockKeyhole className="h-6 w-6" /></div>
        <CardTitle className="text-2xl">{mode === "signup" ? (hi ? "अपना खाता बनाएँ" : "Create your account") : (hi ? "वापस स्वागत है" : "Welcome back")}</CardTitle>
        <CardDescription>{mode === "signup" ? (hi ? "इसके बाद अपना संगठन पंजीकृत करें और कार्यक्षेत्र शुरू करें।" : "Next, register your organization to open its workspace.") : (hi ? "अपने संगठन के कार्यक्षेत्र में प्रवेश करें।" : "Sign in to your organization's workspace.")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
          <Button type="button" variant={mode === "signup" ? "secondary" : "ghost"} onClick={() => setMode("signup")}>{hi ? "खाता बनाएँ" : "Sign up"}</Button>
          <Button type="button" variant={mode === "login" ? "secondary" : "ghost"} onClick={() => setMode("login")}>{hi ? "साइन इन" : "Log in"}</Button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="email">{hi ? "ईमेल" : "Email"}</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="password">{hi ? "पासवर्ड" : "Password"}</Label><Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /><p className="text-xs text-muted-foreground">{hi ? "कम से कम 8 अक्षर" : "At least 8 characters"}</p></div>
          <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mode === "signup" ? (hi ? "खाता बनाएँ" : "Create account") : (hi ? "साइन इन" : "Sign in")}</Button>
        </form>
      </CardContent>
    </Card>
  </main>
}
