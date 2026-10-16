"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Download, Maximize2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface MermaidDiagramProps {
  title: string
  diagram: string
  previewUrl: string
  pngUrl: string
  svgUrl: string
  widePreview?: boolean
  language?: string
}

export function MermaidDiagram({ title, diagram, previewUrl, pngUrl, svgUrl, widePreview = false, language = "en" }: MermaidDiagramProps) {
  const [imageError, setImageError] = useState(false)
  const [useSvg, setUseSvg] = useState(widePreview && !!svgUrl)
  useEffect(() => {
    setImageError(false)
    setUseSvg(widePreview && !!svgUrl)
  }, [pngUrl, svgUrl, widePreview])
  const imageSource = useSvg ? svgUrl : pngUrl
  const handleImageError = () => {
    if (useSvg && pngUrl) setUseSvg(false)
    else setImageError(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Maximize2 className="mr-2 h-4 w-4" />
                {language === "hi" ? "विस्तार से देखें" : "Expand"}
              </Button>
            </DialogTrigger>
            <DialogContent className={widePreview ? "w-[96vw] max-w-[96vw] sm:max-w-[96vw] max-h-[94vh] overflow-auto" : "max-w-4xl max-h-[90vh] overflow-auto"}>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {!imageError ? (
                  <img
                    src={imageSource || "/placeholder.svg"}
                    alt={title}
                    className={widePreview ? "min-w-[1000px] h-auto rounded-lg" : "w-full h-auto rounded-lg"}
                    onError={handleImageError}
                  />
                ) : (
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">{diagram}</pre>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              {language === "hi" ? "एडिटर खोलें" : "Edit"}
            </Button>
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">{language === "hi" ? "पूर्वावलोकन" : "Preview"}</TabsTrigger>
            <TabsTrigger value="code">{language === "hi" ? "कोड" : "Code"}</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="relative bg-muted/50 rounded-lg p-4 min-h-[420px] flex items-center justify-center overflow-x-auto">
              {!imageError ? (
                <img
                  src={imageSource || "/placeholder.svg"}
                  alt={title}
                  className={`w-full h-auto rounded-lg ${widePreview ? "min-w-[1000px]" : "min-w-[620px]"}`}
                  onError={handleImageError}
                />
              ) : (
                <p className="text-muted-foreground">{language === "hi" ? "डायग्राम का पूर्वावलोकन लोड नहीं हुआ" : "Failed to load diagram preview"}</p>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <a href={pngUrl} download>
                <Button variant="secondary" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  PNG
                </Button>
              </a>
              <a href={svgUrl} download>
                <Button variant="secondary" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  SVG
                </Button>
              </a>
            </div>
          </TabsContent>
          <TabsContent value="code" className="mt-4">
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono">{diagram}</pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
