"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, Loader2, Plus, Trash2 } from "lucide-react"

import { BranchSelect } from "@/components/branch-select"
import { StudentSelect } from "@/components/student-select"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { documentDownloadUrl, useDeleteDocument, useDocuments, useUploadDocument } from "@/hooks/use-documents"
import type { DocumentFile } from "@/types/documents"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const [search, setSearch] = React.useState("")
  const { data: documents, isPending } = useDocuments({ search })
  const uploadDocument = useUploadDocument()
  const deleteDocument = useDeleteDocument()

  const [open, setOpen] = React.useState(false)
  const [branchId, setBranchId] = React.useState("")
  const [studentId, setStudentId] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)

  function resetForm() {
    setBranchId("")
    setStudentId("")
    setTitle("")
    setDescription("")
    setFile(null)
  }

  function onSubmit() {
    if (!file || !title || !branchId) return
    uploadDocument.mutate(
      { file, title, branch_id: branchId, description: description || undefined, student_id: studentId || undefined },
      {
        onSuccess: () => {
          setOpen(false)
          resetForm()
        },
      }
    )
  }

  const columns: ColumnDef<DocumentFile>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "original_filename", header: "File" },
    {
      id: "size",
      header: "Size",
      cell: ({ row }) => formatSize(row.original.size_bytes),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <a href={documentDownloadUrl(row.original.id)} target="_blank" rel="noreferrer">
              <Download />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteDocument.mutate(row.original.id)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Files attached to a student record or kept general, searchable by title.
          </p>
        </div>

        <Sheet
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) resetForm()
          }}
        >
          <SheetTrigger asChild>
            <Button>
              <Plus />
              Upload
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Upload Document</SheetTitle>
              <SheetDescription>Attach a file to a student, or keep it general.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4">
              <div className="flex flex-col gap-2">
                <Label>Branch</Label>
                <BranchSelect value={branchId} onChange={setBranchId} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Student (optional)</Label>
                <StudentSelect value={studentId} onChange={setStudentId} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Title</Label>
                <Input placeholder="Report Card" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Description (optional)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>File</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>
            <SheetFooter>
              <Button
                disabled={!file || !title || !branchId || uploadDocument.isPending}
                onClick={onSubmit}
              >
                {uploadDocument.isPending && <Loader2 className="animate-spin" />}
                Upload
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Input
        placeholder="Search by title or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={documents ?? []}
        isLoading={isPending}
        emptyMessage="No documents yet."
      />
    </div>
  )
}
