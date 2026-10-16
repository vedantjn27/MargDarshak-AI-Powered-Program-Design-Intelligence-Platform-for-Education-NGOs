export type WorkflowPage = {
  href: string
  en: string
  hi: string
  purposeEn: string
  purposeHi: string
  actionEn: string
  actionHi: string
  snapshotKey?: string
}

export type WorkflowStage = {
  en: string
  hi: string
  descriptionEn: string
  descriptionHi: string
  pages: WorkflowPage[]
}

export const workflow: WorkflowStage[] = [
  {
    en: "Understand the problem", hi: "समस्या समझें",
    descriptionEn: "Describe who is affected, review evidence, and find likely causes.",
    descriptionHi: "प्रभावित लोगों, साक्ष्य और संभावित कारणों को समझें।",
    pages: [
      { href: "/dashboard/problem", en: "Problem and causes", hi: "समस्या और कारण", purposeEn: "Describe the problem, review the AI refinement, and generate a problem tree.", purposeHi: "समस्या लिखें, AI का सार जाँचें और समस्या वृक्ष बनाएँ।", actionEn: "Write the problem and check the suggested causes", actionHi: "समस्या लिखें और सुझाए गए कारण जाँचें", snapshotKey: "problem_tree" },
    ],
  },
  {
    en: "Choose the intended change", hi: "वांछित बदलाव चुनें",
    descriptionEn: "Define what will improve for students and how you will recognize success.",
    descriptionHi: "विद्यार्थियों के लिए अपेक्षित बदलाव और सफलता का माप तय करें।",
    pages: [
      { href: "/dashboard/outcomes", en: "Student outcomes", hi: "छात्र परिणाम", purposeEn: "Set a measurable student outcome, baseline, target, and timeline.", purposeHi: "मापने योग्य परिणाम, आधार, लक्ष्य और समयसीमा तय करें।", actionEn: "Set a measurable student outcome", actionHi: "मापने योग्य छात्र परिणाम तय करें", snapshotKey: "outcomes" },
    ],
  },
  {
    en: "Design the intervention", hi: "हस्तक्षेप की योजना बनाएँ",
    descriptionEn: "Choose methods and people, then connect activities to results.",
    descriptionHi: "पद्धतियाँ और लोग चुनें, फिर गतिविधियों को परिणामों से जोड़ें।",
    pages: [
      { href: "/dashboard/methodology", en: "Methodologies", hi: "पद्धतियाँ", purposeEn: "Compare relevant approaches, read their details, and save the best fit.", purposeHi: "उपयुक्त पद्धतियाँ पढ़ें, तुलना करें और सहेजें।", actionEn: "Choose and save a method", actionHi: "पद्धति चुनकर सहेजें", snapshotKey: "methodology" },
      { href: "/dashboard/stakeholders", en: "Stakeholders and practices", hi: "हितधारक और अभ्यास", purposeEn: "Choose the people involved and define the practices that should change.", purposeHi: "संबंधित लोग चुनें और उनके अभ्यास में बदलाव तय करें।", actionEn: "Choose stakeholders and describe practice changes", actionHi: "हितधारक चुनें और अभ्यास में बदलाव लिखें", snapshotKey: "practice_changes" },
      { href: "/dashboard/theory-of-change", en: "Theory of change", hi: "परिवर्तन का सिद्धांत", purposeEn: "Connect activities, outputs, outcomes, and impact; review gaps in the logic.", purposeHi: "गतिविधि, उत्पादन, परिणाम और प्रभाव जोड़ें; तर्क की कमी जाँचें।", actionEn: "Connect actions to outcomes", actionHi: "गतिविधियों को परिणामों से जोड़ें", snapshotKey: "theory_of_change" },
    ],
  },
  {
    en: "Plan measurement", hi: "मापन की योजना बनाएँ",
    descriptionEn: "Choose indicators, record real measurements, and compare them with targets.",
    descriptionHi: "संकेतक चुनें, वास्तविक माप दर्ज करें और लक्ष्यों से तुलना करें।",
    pages: [
      { href: "/dashboard/indicators", en: "Indicators and targets", hi: "संकेतक और लक्ष्य", purposeEn: "Generate measures from your outcomes and practices, then enter baselines and targets.", purposeHi: "परिणामों और अभ्यासों से संकेतक बनाएँ, फिर आधार और लक्ष्य दर्ज करें।", actionEn: "Generate indicators and add measurements", actionHi: "संकेतक बनाएँ और माप जोड़ें", snapshotKey: "indicator_baselines" },
    ],
  },
  {
    en: "Review and share", hi: "समीक्षा और साझा करें",
    descriptionEn: "Fix design gaps, explore reusable templates, and export your work.",
    descriptionHi: "योजना की कमियाँ सुधारें, टेम्पलेट देखें और दस्तावेज़ बनाएँ।",
    pages: [
      { href: "/dashboard/quality", en: "Quality check", hi: "गुणवत्ता जाँच", purposeEn: "See which sections are missing and which design assumptions need attention.", purposeHi: "अधूरे भाग और सुधार योग्य मान्यताएँ देखें।", actionEn: "Review gaps before export", actionHi: "निर्यात से पहले कमियाँ जाँचें" },
      { href: "/dashboard/templates", en: "Templates", hi: "टेम्पलेट", purposeEn: "Explore examples and save a copy that fits your organization.", purposeHi: "उदाहरण देखें और अपने संगठन के लिए प्रति सहेजें।", actionEn: "Explore and save templates", actionHi: "टेम्पलेट देखें और सहेजें" },
      { href: "/dashboard/export", en: "Export", hi: "निर्यात", purposeEn: "Create readable documents and diagrams from the current design.", purposeHi: "मौजूदा योजना से पढ़ने योग्य दस्तावेज़ और आरेख बनाएँ।", actionEn: "Download program documents", actionHi: "कार्यक्रम के दस्तावेज़ डाउनलोड करें" },
    ],
  },
]

export const workflowPages = workflow.flatMap((stage) => stage.pages)

export function hasPageData(snapshot: Record<string, any>, page: WorkflowPage): boolean {
  if (!page.snapshotKey) return false
  const value = snapshot[page.snapshotKey]
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === "object") return Object.values(value).some((item) => Array.isArray(item) ? item.length > 0 : Boolean(item))
  return Boolean(value)
}
