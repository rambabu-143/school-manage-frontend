"use client"

import * as React from "react"

import { ActionForm } from "@/components/ops/action-form"
import { ResourcePage } from "@/components/ops/resource-page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ADMISSION_AGE, RESOURCES } from "@/lib/ops/resources"

const SETTINGS = [
  ["subjects", "Entrance subjects", RESOURCES.admissionSubjects],
  ["valid-dates", "Valid dates", RESOURCES.admissionValidDates],
  ["golive", "Go-live windows", RESOURCES.admissionGolive],
  ["areas", "Areas", RESOURCES.admissionAreas],
  ["rooms", "Evaluation rooms", RESOURCES.admissionRooms],
  ["files", "Documents", RESOURCES.admissionFiles],
  ["mobiles", "Pre-registered mobiles", RESOURCES.admissionMobiles],
] as const

/** Admission setup: one CRUD list per setting, plus the age cut-off. */
export function SetupTab() {
  const [key, setKey] = React.useState<string>(SETTINGS[0][0])
  const cur = SETTINGS.find((s) => s[0] === key) ?? SETTINGS[0]
  return (
    <div className="space-y-4">
      <div className="max-w-sm space-y-1.5">
        <span className="text-sm font-medium">Setting</span>
        <Select value={key} onValueChange={setKey}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SETTINGS.map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
            <SelectItem value="age">Age cut-off date</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {key === "age" ? <ActionForm cfg={ADMISSION_AGE} /> : <ResourcePage key={key} res={cur[2]} />}
    </div>
  )
}
