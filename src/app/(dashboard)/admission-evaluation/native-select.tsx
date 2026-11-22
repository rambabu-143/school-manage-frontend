"use client"

// Plain <select>: the room/subject lists are short and this keeps value="" (nothing chosen) trivial.
export function NativeSelect({ value, onChange, options, placeholder, disabled }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  disabled?: boolean
}) {
  return (
    <select className="h-9 w-56 rounded-md border bg-background px-2 text-sm" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
