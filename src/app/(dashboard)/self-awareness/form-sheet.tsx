"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

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
} from "@/components/ui/sheet"
import { useSelfAwarenessForm, useUpsertSelfAwarenessForm } from "@/hooks/use-self-awareness"
import type { Student } from "@/types/people"

interface SelfAwarenessFormSheetProps {
  student: Student | null
  onOpenChange: (open: boolean) => void
}

export function SelfAwarenessFormSheet({ student, onOpenChange }: SelfAwarenessFormSheetProps) {
  const { data: form } = useSelfAwarenessForm(student?.id)
  const upsert = useUpsertSelfAwarenessForm(student?.id ?? "")

  const goalRef = React.useRef<HTMLInputElement>(null)
  const strengthRef = React.useRef<HTMLInputElement>(null)
  const interestsHobbiesRef = React.useRef<HTMLInputElement>(null)
  const responsibilitiesRef = React.useRef<HTMLInputElement>(null)

  if (!student) return null

  return (
    <Sheet open={!!student} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{student.first_name} {student.last_name}</SheetTitle>
          <SheetDescription>Self-awareness reflection form.</SheetDescription>
        </SheetHeader>

        <div key={form?.id ?? "new"} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label>My goal</Label>
            <Input ref={goalRef} defaultValue={form?.goal ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>My strength</Label>
            <Input ref={strengthRef} defaultValue={form?.strength ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>My interests &amp; hobbies</Label>
            <Input ref={interestsHobbiesRef} defaultValue={form?.interests_hobbies ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>My responsibilities</Label>
            <Input ref={responsibilitiesRef} defaultValue={form?.responsibilities ?? ""} />
          </div>
        </div>

        <SheetFooter>
          <Button
            disabled={upsert.isPending}
            onClick={() => {
              upsert.mutate(
                {
                  goal: goalRef.current?.value || undefined,
                  strength: strengthRef.current?.value || undefined,
                  interests_hobbies: interestsHobbiesRef.current?.value || undefined,
                  responsibilities: responsibilitiesRef.current?.value || undefined,
                },
                { onSuccess: () => onOpenChange(false) }
              )
            }}
          >
            {upsert.isPending && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
