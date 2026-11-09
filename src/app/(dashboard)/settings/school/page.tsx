"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRenameSchool } from "@/hooks/use-settings"

export default function SchoolSettingsPage() {
  const [name, setName] = useState("")
  const rename = useRenameSchool()
  return (
    <form
      className="max-w-md space-y-3"
      onSubmit={(e) => { e.preventDefault(); rename.mutate(name.trim(), { onSuccess: () => setName("") }) }}
    >
      <h1 className="text-2xl font-semibold">School</h1>
      <label htmlFor="school-name" className="text-sm font-medium">New school name</label>
      <Input id="school-name" value={name} maxLength={200} onChange={(e) => setName(e.target.value)} />
      <p className="text-sm text-muted-foreground">Only school admins and super admins can rename the school.</p>
      <Button type="submit" disabled={rename.isPending || !name.trim()}>{rename.isPending ? "Saving..." : "Rename"}</Button>
    </form>
  )
}
