"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Images, Loader2, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCreateGalleryAlbum, useDeleteGalleryAlbum, useGalleryAlbums } from "@/hooks/use-gallery"
import type { GalleryAlbum } from "@/types/gallery"

import { AlbumPhotosSheet } from "./album-photos-sheet"

const albumSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  year_session: z.string().min(1, "Year is required").max(20),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
})

type AlbumValues = z.infer<typeof albumSchema>

export function AlbumsTab() {
  const { data: albums, isPending } = useGalleryAlbums()
  const [open, setOpen] = React.useState(false)
  const [viewingAlbum, setViewingAlbum] = React.useState<GalleryAlbum | null>(null)
  const createAlbum = useCreateGalleryAlbum()
  const deleteAlbum = useDeleteGalleryAlbum()

  const form = useForm<AlbumValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: { branch_id: "", year_session: "", title: "", description: "" },
  })

  function onSubmit(values: AlbumValues) {
    createAlbum.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<GalleryAlbum>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "year_session", header: "Year" },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description ?? "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setViewingAlbum(row.original)}>
            <Images />
            Photos
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteAlbum.mutate(row.original.id)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Sheet
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) form.reset()
          }}
        >
          <SheetTrigger asChild>
            <Button>
              <Plus />
              New Album
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Album</SheetTitle>
              <SheetDescription>e.g. &quot;Sports Day 2026-2027&quot;</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="branch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <BranchSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year_session"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input placeholder="2026-2027" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Sports Day" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createAlbum.isPending}>
                    {createAlbum.isPending && <Loader2 className="animate-spin" />}
                    Create album
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={albums ?? []}
        isLoading={isPending}
        emptyMessage="No albums yet."
      />

      <AlbumPhotosSheet album={viewingAlbum} onOpenChange={(open) => !open && setViewingAlbum(null)} />
    </div>
  )
}
