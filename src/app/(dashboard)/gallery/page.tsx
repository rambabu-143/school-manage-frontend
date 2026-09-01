"use client"

import { AlbumsTab } from "./albums-tab"

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Gallery</h1>
        <p className="text-sm text-muted-foreground">Photo albums for events and school life.</p>
      </div>

      <AlbumsTab />
    </div>
  )
}
