"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { normalizeDateRange } from "@/lib/shared/url-params"

interface DateRangePickerProps {
  from: string | null
  to: string | null
  onChange: (range: { from: string | null; to: string | null }) => void
}

/** Native date inputs (ISO yyyy-mm-dd); an inverted range is swapped. */
export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-end gap-2">
      <div className="space-y-1">
        <Label htmlFor="range-from">From</Label>
        <Input id="range-from" type="date" value={from ?? ""} max={to ?? undefined} onChange={(e) => onChange(normalizeDateRange(e.target.value || null, to))} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="range-to">To</Label>
        <Input id="range-to" type="date" value={to ?? ""} min={from ?? undefined} onChange={(e) => onChange(normalizeDateRange(from, e.target.value || null))} />
      </div>
    </div>
  )
}
