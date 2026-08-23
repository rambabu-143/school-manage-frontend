"use client"

import * as React from "react"
import { Loader2, Trash2 } from "lucide-react"

import { RouteSelect } from "@/components/route-select"
import { StopSelect } from "@/components/stop-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useTransportRoutes } from "@/hooks/use-transport-routes"
import { useTransportStops } from "@/hooks/use-transport-stops"
import {
  useAssignStudentTransport,
  useRemoveStudentTransport,
  useStudentTransport,
} from "@/hooks/use-student-transport"

export function AssignForm({ studentId }: { studentId: string }) {
  const { data: assignmentRow, isPending } = useStudentTransport(studentId)
  const { data: routes } = useTransportRoutes()
  const [routeId, setRouteId] = React.useState<string>()
  const [stopId, setStopId] = React.useState<string>()

  // The backend keeps one row per student and reuses it on reassignment,
  // soft-deactivating rather than deleting it on removal - so GET still
  // returns the row after "Remove". Only treat it as a live assignment
  // when is_active is true.
  const assignment = assignmentRow?.is_active ? assignmentRow : null
  const { data: stops } = useTransportStops(assignment?.route_id)

  const assign = useAssignStudentTransport()
  const remove = useRemoveStudentTransport()

  const currentRoute = routes?.find((r) => r.id === assignment?.route_id)
  const currentStop = stops?.find((s) => s.id === assignment?.stop_id)

  if (isPending) return <p className="text-sm text-muted-foreground">Loading...</p>

  return (
    <div className="flex flex-col gap-4">
      {assignment ? (
        <div className="flex items-center justify-between rounded-md border p-3 text-sm">
          <div>
            <div className="font-medium">{currentRoute?.name ?? "—"}</div>
            <div className="text-muted-foreground">Stop: {currentStop?.name ?? "—"}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={remove.isPending}
            onClick={() => remove.mutate(studentId)}
          >
            {remove.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Remove
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No transport assignment yet.</p>
      )}

      <Separator />

      <div className="flex flex-col gap-3">
        <Label>{assignment ? "Reassign" : "Assign"}</Label>
        <RouteSelect
          value={routeId}
          onChange={(value) => {
            setRouteId(value)
            setStopId(undefined)
          }}
        />
        <StopSelect routeId={routeId} value={stopId} onChange={setStopId} />
        <Button
          disabled={!routeId || !stopId || assign.isPending}
          onClick={() => {
            if (!routeId || !stopId) return
            assign.mutate(
              { studentId, routeId, stopId },
              {
                onSuccess: () => {
                  setRouteId(undefined)
                  setStopId(undefined)
                },
              }
            )
          }}
        >
          {assign.isPending && <Loader2 className="animate-spin" />}
          {assignment ? "Reassign" : "Assign"}
        </Button>
      </div>
    </div>
  )
}
