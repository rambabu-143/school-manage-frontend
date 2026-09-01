"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useModuleSettings, useSetModuleEnabled } from "@/hooks/use-module-settings"
import type { ModuleKey } from "@/types/moduleaccess"

const MODULE_LABELS: Record<ModuleKey, { label: string; description: string }> = {
  transport: { label: "Transport", description: "Routes, stops, fare slabs, student pickups" },
  hostel: { label: "Hostel", description: "Hostels, rooms, student allocation" },
  inventory: { label: "Inventory", description: "Vendors, products, purchase orders, requisitions" },
  appraisal: { label: "Staff Appraisal", description: "Review cycles and per-staff ratings" },
  houses: { label: "Houses", description: "School houses, membership, inter-house points" },
  clubs: { label: "Clubs", description: "Extracurricular clubs and membership" },
  streams: { label: "Streams", description: "Senior-secondary stream selection" },
  alumni: { label: "Alumni", description: "Post-school tracking for former students" },
  counselling: { label: "Counselling", description: "Student counselling session records" },
  disciplinary: { label: "Disciplinary", description: "Student incident records" },
  cca: { label: "CCA Grading", description: "Co-curricular activity grades" },
  events: { label: "Events", description: "School event listings, participants, scoring" },
  newsletters: { label: "Newsletters", description: "Drafted and published circulars" },
}

export default function ModuleSettingsPage() {
  const { data: settings, isPending } = useModuleSettings()
  const setModuleEnabled = useSetModuleEnabled()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Module Settings</h1>
        <p className="text-sm text-muted-foreground">
          Turn off feature areas your school doesn&apos;t use. Core modules (people, academics,
          attendance, fees, gradebook) are always on.
        </p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col divide-y p-0">
            {settings?.map((setting) => {
              const meta = MODULE_LABELS[setting.module_key]
              return (
                <div
                  key={setting.module_key}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="font-medium">{meta.label}</p>
                    <p className="text-sm text-muted-foreground">{meta.description}</p>
                  </div>
                  <Switch
                    checked={setting.is_enabled}
                    disabled={setModuleEnabled.isPending}
                    onCheckedChange={(checked) =>
                      setModuleEnabled.mutate({ moduleKey: setting.module_key, isEnabled: checked })
                    }
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
