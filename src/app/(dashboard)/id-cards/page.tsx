"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Check, Loader2, Upload } from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import { StudentSelect } from "@/components/student-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useIdCardUpdateRequests,
  useResolveIdCardUpdateRequest,
  useStudentIdCard,
  useUploadStudentPhoto,
} from "@/hooks/use-id-cards"
import { useStudents } from "@/hooks/use-students"
import type { IdCardUpdateRequest } from "@/types/idcards"

function ViewCardTab() {
  const [studentId, setStudentId] = React.useState<string>()
  const { data: card, isPending } = useStudentIdCard(studentId)
  const uploadPhoto = useUploadStudentPhoto()
  const inputRef = React.useRef<HTMLInputElement>(null)

  function onFileSelected(file: File | null) {
    if (!file || !studentId) return
    uploadPhoto.mutate(
      { studentId, file },
      { onSettled: () => inputRef.current && (inputRef.current.value = "") }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:max-w-sm">
        <Label>Student</Label>
        <StudentSelect value={studentId} onChange={setStudentId} />
      </div>

      {!studentId ? (
        <p className="text-sm text-muted-foreground">Select a student to view their ID card.</p>
      ) : isPending ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : card ? (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>
              {card.first_name} {card.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Admission No.</span>
            <span>{card.admission_number}</span>
            <span className="text-muted-foreground">Date of birth</span>
            <span>{card.date_of_birth}</span>
            <span className="text-muted-foreground">Class</span>
            <span>
              {card.grade_name ?? "—"} {card.section_name ?? ""}
            </span>
            <span className="text-muted-foreground">Guardian</span>
            <span>{card.guardian_name ?? "—"}</span>
            <span className="text-muted-foreground">Guardian phone</span>
            <span>{card.guardian_phone ?? "—"}</span>
            <span className="text-muted-foreground">Transport route</span>
            <span>{card.transport_route_name ?? "—"}</span>
            <span className="text-muted-foreground">Transport stop</span>
            <span>{card.transport_stop_name ?? "—"}</span>
            <span className="text-muted-foreground">Photo</span>
            <span className="flex items-center gap-2">
              <Input
                ref={inputRef}
                type="file"
                accept="image/*"
                disabled={uploadPhoto.isPending}
                onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
                className="h-8 text-xs"
              />
              {uploadPhoto.isPending && <Loader2 className="size-4 animate-spin" />}
              {!uploadPhoto.isPending && <Upload className="size-4 text-muted-foreground" />}
            </span>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function RequestsTab() {
  const { data: requests, isPending } = useIdCardUpdateRequests()
  const { data: students } = useStudents()
  const resolveRequest = useResolveIdCardUpdateRequest()

  const columns: ColumnDef<IdCardUpdateRequest>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = students?.find((s) => s.id === row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    { accessorKey: "notes", header: "Notes" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.status === "resolved" ? (
          <Badge variant="secondary">Resolved</Badge>
        ) : (
          <Badge>Pending</Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "pending" ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={resolveRequest.isPending}
            onClick={() => resolveRequest.mutate(row.original.id)}
          >
            <Check />
            Mark resolved
          </Button>
        ) : null,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={requests ?? []}
      isLoading={isPending}
      emptyMessage="No correction requests yet."
    />
  )
}

export default function IdCardsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">ID Cards</h1>
        <p className="text-sm text-muted-foreground">
          Card data for printing, and guardian-submitted correction requests.
        </p>
      </div>

      <Tabs defaultValue="view">
        <TabsList>
          <TabsTrigger value="view">View Card</TabsTrigger>
          <TabsTrigger value="requests">Correction Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <ViewCardTab />
        </TabsContent>
        <TabsContent value="requests">
          <RequestsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
