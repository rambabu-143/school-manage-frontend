"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/hooks/use-session"
import { canImpersonate } from "@/lib/role-guard"

import { DownloadsTab } from "./downloads-tab"
import { ExamNamesTab, SubjectExamsTab } from "./exams-tab"
import { AllRemarksTab, CsaLocksPanel, RecordLocksForm, SectionLocksTab } from "./records-tab"
import {
  CcaHeadActivitiesTab, CcaHeadsTab, CrRemarkTemplatesTab, DevelopmentalIndicatorsTab,
  GradeBandsTab, PersonalTraitsTab, StandardTeachersTab, StudentRemarkTemplatesTab,
} from "./setup-tab"

const TABS: { id: string; label: string; el: React.ReactNode; admin?: boolean }[] = [
  { id: "exam-names", label: "Exam names", el: <ExamNamesTab /> },
  { id: "subject-exams", label: "Subject exams", el: <SubjectExamsTab /> },
  { id: "grade-bands", label: "Grade bands", el: <GradeBandsTab /> },
  { id: "all-remarks", label: "All remarks", el: <AllRemarksTab /> },
  { id: "remark-templates", label: "Student remarks", el: <StudentRemarkTemplatesTab /> },
  { id: "cr-templates", label: "CR remarks", el: <CrRemarkTemplatesTab /> },
  { id: "traits", label: "Personal traits", el: <PersonalTraitsTab /> },
  { id: "di", label: "Dev. indicators", el: <DevelopmentalIndicatorsTab /> },
  { id: "cca-heads", label: "CCA heads", el: <CcaHeadsTab /> },
  { id: "cca-activities", label: "Head activities", el: <CcaHeadActivitiesTab /> },
  { id: "std-teachers", label: "Standard teachers", el: <StandardTeachersTab /> },
  { id: "locks", label: "Locks", admin: true, el: <div className="space-y-6"><SectionLocksTab /><RecordLocksForm /><CsaLocksPanel /></div> },
  { id: "downloads", label: "Downloads", el: <DownloadsTab /> },
]

export default function ExamRecordsPage() {
  const { data: user } = useSession()
  const isAdmin = !!user && canImpersonate(user.role) // UI hint only: the API enforces roles
  const tabs = TABS.filter((t) => !t.admin || isAdmin)
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Exams &amp; Academic Records</h1>
        <p className="text-sm text-muted-foreground">Exam setup, remarks, CCA, locks and report downloads.</p>
      </div>
      <Tabs defaultValue="exam-names">
        <TabsList className="h-auto flex-wrap">
          {tabs.map((t) => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}
        </TabsList>
        {tabs.map((t) => <TabsContent key={t.id} value={t.id}>{t.el}</TabsContent>)}
      </Tabs>
    </div>
  )
}
