"use client"

import * as React from "react"
import { Loader2, Plus } from "lucide-react"

import { StudentSelect } from "@/components/student-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useAddEventParticipant,
  useAddEventPhoto,
  useAddEventScore,
  useEventParticipants,
  useEventPhotos,
  useEventScores,
} from "@/hooks/use-events"
import { useStudents } from "@/hooks/use-students"
import type { Event } from "@/types/events"

interface EventDetailSheetProps {
  event: Event | null
  onOpenChange: (open: boolean) => void
}

export function EventDetailSheet({ event, onOpenChange }: EventDetailSheetProps) {
  const { data: students } = useStudents()
  const { data: participants } = useEventParticipants(event?.id)
  const { data: scores } = useEventScores(event?.id)
  const { data: photos } = useEventPhotos(event?.id)

  const addParticipant = useAddEventParticipant(event?.id ?? "")
  const addScore = useAddEventScore(event?.id ?? "")
  const addPhoto = useAddEventPhoto(event?.id ?? "")

  const [newParticipantId, setNewParticipantId] = React.useState("")
  const [scoreStudentId, setScoreStudentId] = React.useState("")
  const [marks, setMarks] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [caption, setCaption] = React.useState("")

  const studentById = new Map(students?.map((s) => [s.id, s]))

  if (!event) return null

  return (
    <Sheet open={!!event} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{event.title}</SheetTitle>
          <SheetDescription>
            {event.venue ? `${event.venue} - ` : ""}
            {event.event_date}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <span className="text-sm font-medium">Participants</span>
            <div className="mt-2 flex flex-col gap-2">
              {(!participants || participants.length === 0) && (
                <p className="text-sm text-muted-foreground">No participants yet.</p>
              )}
              {participants?.map((p) => (
                <div key={p.id} className="rounded-md border p-2 text-sm">
                  {studentById.get(p.student_id)
                    ? `${studentById.get(p.student_id)!.first_name} ${studentById.get(p.student_id)!.last_name}`
                    : p.student_id}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <StudentSelect value={newParticipantId} onChange={setNewParticipantId} />
              <Button
                disabled={!newParticipantId || addParticipant.isPending}
                onClick={() => {
                  addParticipant.mutate(newParticipantId, {
                    onSuccess: () => setNewParticipantId(""),
                  })
                }}
              >
                {addParticipant.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                Add
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <span className="text-sm font-medium">Scores</span>
            <div className="mt-2 flex flex-col gap-2">
              {(!scores || scores.length === 0) && (
                <p className="text-sm text-muted-foreground">No scores yet.</p>
              )}
              {scores?.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span>{studentById.get(s.student_id)?.first_name ?? s.student_id}</span>
                  <Badge variant="outline">{s.marks}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <StudentSelect value={scoreStudentId} onChange={setScoreStudentId} />
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Marks"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
                <Button
                  disabled={!scoreStudentId || !marks || addScore.isPending}
                  onClick={() => {
                    addScore.mutate(
                      { student_id: scoreStudentId, marks: Number(marks) },
                      { onSuccess: () => { setScoreStudentId(""); setMarks("") } }
                    )
                  }}
                >
                  {addScore.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                  Submit
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <span className="text-sm font-medium">Photo Gallery</span>
            <div className="mt-2 flex flex-col gap-2">
              {(!photos || photos.length === 0) && (
                <p className="text-sm text-muted-foreground">No photos yet.</p>
              )}
              {photos?.map((p) => (
                <div key={p.id} className="rounded-md border p-2 text-sm">
                  <a href={p.image_url} target="_blank" rel="noreferrer" className="underline">
                    {p.caption || p.image_url}
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Caption (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                <Button
                  disabled={!imageUrl || addPhoto.isPending}
                  onClick={() => {
                    addPhoto.mutate(
                      { image_url: imageUrl, caption: caption || undefined },
                      { onSuccess: () => { setImageUrl(""); setCaption("") } }
                    )
                  }}
                >
                  {addPhoto.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
