"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/hooks/use-session"
import { ADMIN_ROLES } from "@/types/auth"

import { ClassHelperTab } from "./class-helper-tab"
import { HousesTab } from "./houses-tab"
import { SchoolHeadTab } from "./school-head-tab"
import { SubjectTeachersTab } from "./subject-teachers-tab"

export default function TeacherAssignmentPage() {
  const { data: user } = useSession()
  const canEdit = !!user && ADMIN_ROLES.includes(user.role) // UI hint only; backend enforces
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Teacher assignment</h1>
        <p className="text-sm text-muted-foreground">
          {canEdit ? "Assign teachers to sections, subjects, houses and school head roles." : "Read-only view of current assignments."}
        </p>
      </div>
      <Tabs defaultValue="class">
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="class">Class teachers</TabsTrigger>
            <TabsTrigger value="subject">Subject teachers</TabsTrigger>
            <TabsTrigger value="head">School head</TabsTrigger>
            <TabsTrigger value="houses">Houses</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="class"><ClassHelperTab canEdit={canEdit} /></TabsContent>
        <TabsContent value="subject"><SubjectTeachersTab canEdit={canEdit} /></TabsContent>
        <TabsContent value="head"><SchoolHeadTab canEdit={canEdit} /></TabsContent>
        <TabsContent value="houses"><HousesTab canEdit={canEdit} /></TabsContent>
      </Tabs>
    </div>
  )
}
