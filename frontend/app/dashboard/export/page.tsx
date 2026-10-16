"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { exportApi, type ExportRequest } from "@/lib/api"
import { toast } from "sonner"
import {
  Download,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Presentation,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

const exportTypes = [
  {
    type: "LFA_PDF" as const,
    title: "LFA Document",
    titleHi: "LFA दस्तावेज़",
    description: "Designed report with your diagrams, timeline, and indicator charts",
    descriptionHi: "आपके आरेख, समयरेखा और संकेतक चार्ट वाला डिज़ाइन किया गया रिपोर्ट",
    icon: FileText,
    format: "PDF",
    extension: "pdf",
    mimeType: "application/pdf",
  },
  {
    type: "TOC_IMAGE" as const,
    title: "Theory of Change Diagram",
    titleHi: "परिवर्तन का सिद्धांत आरेख",
    description: "Visual representation of your ToC",
    descriptionHi: "आपके ToC का दृश्य प्रतिनिधित्व",
    icon: ImageIcon,
    format: "PNG",
    extension: "png",
    mimeType: "image/png",
  },
  {
    type: "INDICATOR_EXCEL" as const,
    title: "Indicators Matrix",
    titleHi: "संकेतक मैट्रिक्स",
    description: "All indicators with baselines and targets",
    descriptionHi: "बेसलाइन और लक्ष्यों के साथ सभी संकेतक",
    icon: FileSpreadsheet,
    format: "Excel",
    extension: "xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  {
    type: "BUDGET_EXCEL" as const,
    title: "Budget Template",
    titleHi: "बजट टेम्पलेट",
    description: "Pre-formatted budget spreadsheet",
    descriptionHi: "पूर्व-स्वरूपित बजट स्प्रेडशीट",
    icon: FileSpreadsheet,
    format: "Excel",
    extension: "xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  {
    type: "PRESENTATION_PPT" as const,
    title: "Program Presentation",
    titleHi: "कार्यक्रम प्रस्तुति",
    description: "Colorful stakeholder deck built from your saved program visuals",
    descriptionHi: "आपकी सहेजी गई योजना के दृश्यों से बनी रंगीन प्रस्तुति",
    icon: Presentation,
    format: "PowerPoint",
    extension: "pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
]

export default function ExportPage() {
  const { language, t } = useLanguage()
  const { currentOrganization, lfaSnapshot } = useAppStore()
  const [loadingType, setLoadingType] = useState<string | null>(null)
  const [completedExports, setCompletedExports] = useState<string[]>([])
  const [errorExports, setErrorExports] = useState<string[]>([])

  const handleExport = async (type: ExportRequest["export_type"]) => {
    setLoadingType(type)
    setErrorExports(errorExports.filter((e) => e !== type))

    try {
      const payload: ExportRequest = {
        organization_id: currentOrganization!._id,
        export_type: type,
        lfa_snapshot: lfaSnapshot,
      }

      const blob = await exportApi.export(payload, language)

      const exportConfig = exportTypes.find((e) => e.type === type)
      if (!exportConfig) throw new Error("Unknown export type")

      const typedBlob = new Blob([blob], { type: exportConfig.mimeType })

      // Create download link
      const url = window.URL.createObjectURL(typedBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}_${Date.now()}.${exportConfig.extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setCompletedExports([...completedExports, type])
      toast.success(language === "en" ? "Export successful!" : "निर्यात सफल!")
    } catch (error: any) {
      console.error("Export error:", error)
      setErrorExports([...errorExports, type])
      toast.error(error.message || (language === "en" ? "Export failed" : "निर्यात विफल"))
    } finally {
      setLoadingType(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Download className="h-8 w-8 text-primary" />
            {t("nav.export")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Export your program design documents in various formats"
              : "अपने कार्यक्रम डिज़ाइन दस्तावेज़ों को विभिन्न प्रारूपों में निर्यात करें"}
          </p>
        </div>

        {/* Export Options */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exportTypes.map((item) => {
            const Icon = item.icon
            const isLoading = loadingType === item.type
            const isCompleted = completedExports.includes(item.type)
            const hasError = errorExports.includes(item.type)

            return (
              <Card key={item.type} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline">{item.format}</Badge>
                  </div>
                  <CardTitle className="mt-4">{language === "en" ? item.title : item.titleHi}</CardTitle>
                  <CardDescription>{language === "en" ? item.description : item.descriptionHi}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleExport(item.type)}
                    disabled={isLoading}
                    className="w-full"
                    variant={hasError ? "destructive" : isCompleted ? "secondary" : "default"}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === "en" ? "Exporting..." : "निर्यात हो रहा है..."}
                      </>
                    ) : hasError ? (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        {language === "en" ? "Retry Export" : "पुन: प्रयास करें"}
                      </>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {language === "en" ? "Download Again" : "फिर से डाउनलोड करें"}
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        {t("common.view")}
                      </>
                    )}
                  </Button>
                </CardContent>
                {isCompleted && !hasError && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{language === "en" ? "Export Tips" : "निर्यात सुझाव"}</h3>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li>
                    {language === "en"
                      ? "• Complete all sections for a comprehensive LFA document"
                      : "• व्यापक LFA दस्तावेज़ के लिए सभी अनुभाग पूरे करें"}
                  </li>
                  <li>
                    {language === "en"
                      ? "• PDF and PowerPoint include the diagrams and charts you have saved"
                      : "• PDF और PowerPoint में आपके सहेजे गए आरेख और चार्ट शामिल होते हैं"}
                  </li>
                  <li>
                    {language === "en"
                      ? "• Presentation is optimized for stakeholder meetings"
                      : "• प्रस्तुति हितधारक बैठकों के लिए अनुकूलित है"}
                  </li>
                  <li>
                    {language === "en"
                      ? "• Excel files require Microsoft Excel or compatible software"
                      : "• Excel फ़ाइलों के लिए Microsoft Excel या संगत सॉफ़्टवेयर आवश्यक है"}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
