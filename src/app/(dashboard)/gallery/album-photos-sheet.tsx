"use client"

import * as React from "react"
import { Loader2, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { documentDownloadUrl, useDeleteDocument, useDocuments, useUploadDocument } from "@/hooks/use-documents"
import type { GalleryAlbum } from "@/types/gallery"

interface AlbumPhotosSheetProps {
  album: GalleryAlbum | null
  onOpenChange: (open: boolean) => void
}

export function AlbumPhotosSheet({ album, onOpenChange }: AlbumPhotosSheetProps) {
  const { data: photos, isPending } = useDocuments({ galleryAlbumId: album?.id })
  const uploadDocument = useUploadDocument()
  const deleteDocument = useDeleteDocument()
  const [file, setFile] = React.useState<File | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  if (!album) return null

  function onUpload() {
    if (!file || !album) return
    uploadDocument.mutate(
      {
        file,
        title: file.name,
        branch_id: album.branch_id,
        gallery_album_id: album.id,
      },
      {
        onSuccess: () => {
          setFile(null)
          if (inputRef.current) inputRef.current.value = ""
        },
      }
    )
  }

  return (
    <Sheet open={!!album} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{album.title}</SheetTitle>
          <SheetDescription>
            {album.year_session} · {photos?.length ?? 0} photo{photos?.length === 1 ? "" : "s"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <Label>Add photo</Label>
              <Input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button onClick={onUpload} disabled={!file || uploadDocument.isPending}>
              {uploadDocument.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              Upload
            </Button>
          </div>

          {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isPending && photos?.length === 0 && (
            <p className="text-sm text-muted-foreground">No photos in this album yet.</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {photos?.map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-md border">
                {photo.content_type?.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={documentDownloadUrl(photo.id)}
                    alt={photo.title}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    {photo.original_filename}
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 size-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => deleteDocument.mutate(photo.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
