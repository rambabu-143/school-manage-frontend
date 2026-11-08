import type { ReactNode } from "react"

export function StatusScreen({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      {children && <p className="max-w-md text-sm text-muted-foreground">{children}</p>}
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
