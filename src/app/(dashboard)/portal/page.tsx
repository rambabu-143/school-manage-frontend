"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMyChildren } from "@/hooks/use-portal"

import { AttendanceTab } from "./attendance-tab"
import { DisciplinaryTab } from "./disciplinary-tab"
import { FeesTab } from "./fees-tab"
import { HomeworkTab } from "./homework-tab"
import { IdCardTab } from "./id-card-tab"
import { ObservationsTab } from "./observations-tab"
import { ReportCardTab } from "./report-card-tab"

export default function PortalPage() {
  const { data: children, isPending } = useMyChildren()
  const [selectedId, setSelectedId] = React.useState<string>()

  const studentId = selectedId ?? children?.[0]?.id
  const student = children?.find((c) => c.id === studentId)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">My Children</h1>
        <p className="text-sm text-muted-foreground">
          Attendance, report cards, fees, and disciplinary records.
        </p>
      </div>

      {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!isPending && children?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No children are linked to your account yet.
        </p>
      )}

      {children && children.length > 1 && (
        <div className="max-w-sm">
          <Select value={studentId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.first_name} {child.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {student && (
        <Tabs defaultValue="attendance">
          <TabsList>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="report-card">Report Card</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
            <TabsTrigger value="observations">Observations</TabsTrigger>
            <TabsTrigger value="id-card">ID Card</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance">
            <AttendanceTab studentId={student.id} />
          </TabsContent>
          <TabsContent value="homework">
            <HomeworkTab studentId={student.id} />
          </TabsContent>
          <TabsContent value="report-card">
            <ReportCardTab studentId={student.id} />
          </TabsContent>
          <TabsContent value="fees">
            <FeesTab studentId={student.id} />
          </TabsContent>
          <TabsContent value="disciplinary">
            <DisciplinaryTab studentId={student.id} />
          </TabsContent>
          <TabsContent value="observations">
            <ObservationsTab studentId={student.id} />
          </TabsContent>
          <TabsContent value="id-card">
            <IdCardTab studentId={student.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
