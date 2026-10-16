"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { BackgroundEffects } from "@/components/background-effects"
import { AnimatedCounter } from "@/components/animated-counter"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sparkles,
  ArrowRight,
  Target,
  Network,
  BarChart3,
  Users,
  FileText,
  CheckCircle2,
  Sun,
  Moon,
  Languages,
  Lightbulb,
  Zap,
  Globe,
} from "lucide-react"

const features = [
  {
    icon: Lightbulb,
    title: "AI-Assisted Problem Definition",
    description: "Refine your problem statements with AI-powered clarity scoring and root cause analysis",
    titleHi: "AI-सहायता प्राप्त समस्या परिभाषा",
    descriptionHi: "AI-संचालित स्पष्टता स्कोरिंग और मूल कारण विश्लेषण के साथ अपनी समस्या कथनों को परिष्कृत करें",
  },
  {
    icon: Target,
    title: "SMART Outcome Designer",
    description: "Create measurable student outcomes aligned with policy frameworks",
    titleHi: "SMART परिणाम डिजाइनर",
    descriptionHi: "नीति ढांचे के साथ संरेखित मापने योग्य छात्र परिणाम बनाएं",
  },
  {
    icon: Network,
    title: "Theory of Change Builder",
    description: "Build visual logic models with automatic validation and AI suggestions",
    titleHi: "परिवर्तन का सिद्धांत निर्माता",
    descriptionHi: "स्वचालित सत्यापन और AI सुझावों के साथ दृश्य तर्क मॉडल बनाएं",
  },
  {
    icon: Users,
    title: "Stakeholder Mapping",
    description: "Identify key actors and define practice changes systematically",
    titleHi: "हितधारक मानचित्रण",
    descriptionHi: "प्रमुख कार्यकर्ताओं की पहचान करें और व्यवस्थित रूप से अभ्यास परिवर्तनों को परिभाषित करें",
  },
  {
    icon: BarChart3,
    title: "Indicator Framework",
    description: "Auto-generate indicators with baseline and target setting tools",
    titleHi: "संकेतक ढांचा",
    descriptionHi: "बेसलाइन और लक्ष्य निर्धारण उपकरणों के साथ स्वचालित रूप से संकेतक उत्पन्न करें",
  },
  {
    icon: CheckCircle2,
    title: "Quality Assurance",
    description: "Get real-time completeness scores and design quality feedback",
    titleHi: "गुणवत्ता आश्वासन",
    descriptionHi: "वास्तविक समय पूर्णता स्कोर और डिज़ाइन गुणवत्ता प्रतिक्रिया प्राप्त करें",
  },
]

const stats = [
  { value: 500, suffix: "+", label: "NGOs Supported", labelHi: "समर्थित NGOs" },
  { value: 10000, suffix: "+", label: "Programs Designed", labelHi: "डिज़ाइन किए गए कार्यक्रम" },
  { value: 20, suffix: "", label: "Indian States", labelHi: "भारतीय राज्य" },
]

export default function HomePage() {
  const { setTheme, resolvedTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <BackgroundEffects variant="landing" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary animate-pulse-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">{t("app.name")}</span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">{t("app.tagline")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Languages className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {language.toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("hi")}>हिंदी (Hindi)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/auth">
              <Button className="hidden sm:flex">
                {language === "en" ? "Get Started" : "शुरू करें"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Main background image */}
          <Image
            src="/classroom-with-students-learning--education-techno.jpg"
            alt="EdTech Background"
            fill
            className="object-cover opacity-20 dark:opacity-10"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Floating edtech images */}
        <div className="absolute top-20 left-10 w-32 h-32 md:w-48 md:h-48 opacity-20 dark:opacity-10 rounded-2xl overflow-hidden hidden lg:block">
          <Image src="/digital-tablet-education-learning-app.jpg" alt="Digital Learning" fill className="object-cover" />
        </div>
        <div className="absolute bottom-32 right-10 w-40 h-40 md:w-56 md:h-56 opacity-20 dark:opacity-10 rounded-2xl overflow-hidden hidden lg:block">
          <Image src="/children-studying-with-books-and-computers.jpg" alt="Students Learning" fill className="object-cover" />
        </div>
        <div className="absolute top-40 right-20 w-28 h-28 md:w-36 md:h-36 opacity-15 dark:opacity-10 rounded-full overflow-hidden hidden xl:block">
          <Image src="/teacher-helping-student-with-laptop.jpg" alt="Teacher Helping" fill className="object-cover" />
        </div>
        <div className="absolute bottom-20 left-20 w-36 h-36 md:w-44 md:h-44 opacity-15 dark:opacity-10 rounded-full overflow-hidden hidden xl:block">
          <Image src="/online-education-elearning-icons.jpg" alt="E-Learning" fill className="object-cover" />
        </div>

        {/* Centered Content */}
        <div className="relative z-10 container px-4 md:px-6 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm mb-6 bg-muted/50 backdrop-blur-sm">
            <Zap className="mr-2 h-4 w-4 text-primary" />
            {language === "en"
              ? "AI-Powered Program Design for Education NGOs"
              : "शिक्षा NGOs के लिए AI-संचालित कार्यक्रम डिज़ाइन"}
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-primary">
            {t("app.name")}
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl font-medium text-foreground/80 mb-4">
            {language === "en" ? (
              <>
                Transform Your <span className="text-primary">Education Programs</span> with Intelligent Design
              </>
            ) : (
              <>
                बुद्धिमान डिज़ाइन के साथ अपने <span className="text-primary">शिक्षा कार्यक्रमों</span> को बदलें
              </>
            )}
          </p>

          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            {language === "en"
              ? "Build impactful Logical Framework Analyses, Theory of Change models, and measurement frameworks with AI-assisted tools designed for Indian education context."
              : "भारतीय शिक्षा संदर्भ के लिए डिज़ाइन किए गए AI-सहायता प्राप्त उपकरणों के साथ प्रभावशाली तार्किक ढांचा विश्लेषण, परिवर्तन के सिद्धांत मॉडल और माप ढांचे बनाएं।"}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                <Sparkles className="mr-2 h-5 w-5" />
                {language === "en" ? "Start Building" : "निर्माण शुरू करें"}
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <FileText className="mr-2 h-5 w-5" />
                {language === "en" ? "View Dashboard" : "डैशबोर्ड देखें"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container px-4 md:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center bg-card/50 backdrop-blur-sm border-primary/10">
              <CardContent className="pt-6">
                <div className="text-4xl md:text-5xl font-bold text-primary">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-muted-foreground mt-2">{language === "en" ? stat.label : stat.labelHi}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            {language === "en" ? "Powerful Features" : "शक्तिशाली विशेषताएं"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === "en"
              ? "Everything you need to design, validate, and export professional program frameworks"
              : "पेशेवर कार्यक्रम ढांचे को डिज़ाइन, मान्य और निर्यात करने के लिए आपको जो कुछ भी चाहिए"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{language === "en" ? feature.title : feature.titleHi}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {language === "en" ? feature.description : feature.descriptionHi}
                  </CardDescription>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            )
          })}
        </div>
      </section>

      {/* Multilingual Support Section */}
      <section className="container px-4 md:px-6 py-16">
        <Card className="relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 border-primary/10">
          <CardContent className="p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6">
                  <Languages className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {language === "en" ? "Built for India's Diversity" : "भारत की विविधता के लिए निर्मित"}
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  {language === "en"
                    ? "Full Hindi and English language support ensures accessibility for all team members across India. Switch languages instantly with a single click."
                    : "पूर्ण हिंदी और अंग्रेजी भाषा समर्थन भारत भर में सभी टीम सदस्यों के लिए पहुंच सुनिश्चित करता है। एक क्लिक के साथ तुरंत भाषाएं बदलें।"}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    onClick={() => setLanguage("en")}
                    className={language !== "en" ? "bg-transparent" : ""}
                  >
                    English
                  </Button>
                  <Button
                    variant={language === "hi" ? "default" : "outline"}
                    onClick={() => setLanguage("hi")}
                    className={language !== "hi" ? "bg-transparent" : ""}
                  >
                    हिंदी
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square max-w-sm mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl" />
                  <div className="relative flex items-center justify-center h-full">
                    <Globe className="h-48 w-48 text-primary/30" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container px-4 md:px-6 py-16 md:py-24">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
          <CardContent className="relative p-8 md:p-12 lg:p-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-pulse-glow">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {language === "en" ? "Ready to Transform Education?" : "शिक्षा को बदलने के लिए तैयार?"}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? `Join NGOs across India using ${t("app.name")} to design impactful education programs`
                : `प्रभावशाली शिक्षा कार्यक्रम डिज़ाइन करने के लिए ${t("app.name")} का उपयोग करने वाले पूरे भारत में NGOs से जुड़ें`}
            </p>
            <Link href="/auth">
              <Button size="lg" className="mt-8">
                {language === "en" ? "Create Your First Program" : "अपना पहला कार्यक्रम बनाएं"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">{t("app.name")}</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {language === "en"
              ? "Built for Education NGOs in India | Powered by AI"
              : "भारत में शिक्षा NGOs के लिए निर्मित | AI द्वारा संचालित"}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{language === "en" ? "English" : "अंग्रेज़ी"}</span>
            <span>|</span>
            <span>{language === "en" ? "Hindi" : "हिंदी"}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
