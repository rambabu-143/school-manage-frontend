"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

/** Link strip rendered by a section layout so the extra screens are reachable. */
export function SectionLinks({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname()
  return (
    <nav aria-label="Related screens" className="mb-4 flex flex-wrap gap-1 border-b pb-2">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={path === i.href ? "page" : undefined}
          className={cn("rounded-md px-3 py-1.5 text-sm hover:bg-muted", path === i.href && "bg-muted font-medium")}>
          {i.label}
        </Link>
      ))}
    </nav>
  )
}
