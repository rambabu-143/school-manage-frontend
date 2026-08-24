"use client"

import * as React from "react"
import { Loader2, Lock, LockOpen } from "lucide-react"

import { StreamCombinationSelect } from "@/components/stream-combination-select"
import { StreamSelect } from "@/components/stream-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useStreamCombinations } from "@/hooks/use-stream-combinations"
import { useStreams } from "@/hooks/use-streams"
import {
  useCreateStreamSelection,
  useSetStreamSelectionLocked,
  useStreamSelections,
  useUpdateStreamSelection,
} from "@/hooks/use-stream-selections"
import { ADMIN_ROLES } from "@/types/auth"
import { useSession } from "@/hooks/use-session"

interface SelectionFormProps {
  studentId: string
  academicYearId: string
}

export function SelectionForm({ studentId, academicYearId }: SelectionFormProps) {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: selections, isPending } = useStreamSelections({ studentId, academicYearId })
  const selection = selections?.[0]

  const { data: streams } = useStreams()
  const { data: combinations } = useStreamCombinations()
  const currentCombination = combinations?.find((c) => c.id === selection?.combination_id)
  const currentStream = streams?.find((s) => s.id === currentCombination?.stream_id)

  const [streamId, setStreamId] = React.useState<string>()
  const [combinationId, setCombinationId] = React.useState<string>()

  const create = useCreateStreamSelection()
  const update = useUpdateStreamSelection()
  const setLocked = useSetStreamSelectionLocked()

  if (isPending) return <p className="text-sm text-muted-foreground">Loading...</p>

  if (selection) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-md border p-3 text-sm">
          <div>
            <div className="font-medium">
              {currentStream?.name ?? "—"} · {currentCombination?.name ?? "—"}
            </div>
            <Badge variant={selection.is_locked ? "secondary" : "default"} className="mt-1">
              {selection.is_locked ? "Locked" : "Open"}
            </Badge>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              disabled={setLocked.isPending}
              onClick={() => setLocked.mutate({ id: selection.id, locked: !selection.is_locked })}
            >
              {selection.is_locked ? <LockOpen /> : <Lock />}
              {selection.is_locked ? "Unlock" : "Lock"}
            </Button>
          )}
        </div>

        {!selection.is_locked && (
          <>
            <Separator />
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Change selection</p>
              <StreamSelect
                value={streamId}
                onChange={(value) => {
                  setStreamId(value)
                  setCombinationId(undefined)
                }}
              />
              <StreamCombinationSelect
                streamId={streamId}
                value={combinationId}
                onChange={setCombinationId}
              />
              <Button
                disabled={!combinationId || update.isPending}
                onClick={() => {
                  if (!combinationId) return
                  update.mutate(
                    { id: selection.id, combinationId },
                    {
                      onSuccess: () => {
                        setStreamId(undefined)
                        setCombinationId(undefined)
                      },
                    }
                  )
                }}
              >
                {update.isPending && <Loader2 className="animate-spin" />}
                Update selection
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">No stream selected yet.</p>
      <StreamSelect
        value={streamId}
        onChange={(value) => {
          setStreamId(value)
          setCombinationId(undefined)
        }}
      />
      <StreamCombinationSelect streamId={streamId} value={combinationId} onChange={setCombinationId} />
      <Button
        disabled={!combinationId || create.isPending}
        onClick={() => {
          if (!combinationId) return
          create.mutate(
            { student_id: studentId, academic_year_id: academicYearId, combination_id: combinationId },
            {
              onSuccess: () => {
                setStreamId(undefined)
                setCombinationId(undefined)
              },
            }
          )
        }}
      >
        {create.isPending && <Loader2 className="animate-spin" />}
        Select stream
      </Button>
    </div>
  )
}
