"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { GraduationCap, PanelLeftClose, PanelLeftOpen, Star } from "lucide-react"

import { NAV_ITEMS } from "@/components/layout/nav-config"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFavourites, useMarkFavourite } from "@/hooks/use-favourites"
import { favouriteItems } from "@/lib/insights"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/stores/ui-store"
import type { Role } from "@/types/auth"

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const collapsed = useUIStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  const items = NAV_ITEMS.filter((item) => !item.hidden && (!item.roles || item.roles.includes(role)))
  const { data: favKeys } = useFavourites()
  const mark = useMarkFavourite()
  const favs = favouriteItems(items, favKeys)

  const row = (item: (typeof items)[number], prefix: string) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
    const Icon = item.icon
    const isFav = favKeys?.includes(item.href) ?? false
    return (
      <div key={prefix + item.href} className="group relative">
        <Link
          href={item.href}
          title={collapsed ? item.label : undefined}
          className={cn(
            "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {isActive && !prefix && (
            <motion.div
              layoutId="sidebar-active-pill"
              className="absolute inset-0 rounded-md bg-primary/10"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <Icon className="relative z-10 size-4 shrink-0" />
          {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
        </Link>
        {!collapsed && !prefix && (
          <button
            type="button"
            aria-label={isFav ? `Remove ${item.label} from favourites` : `Add ${item.label} to favourites`}
            aria-pressed={isFav}
            disabled={mark.isPending}
            onClick={() => mark.mutate({ menu_key: item.href, is_favourite: !isFav })}
            className={cn(
              "absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:opacity-100",
              isFav ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <Star className={cn("size-3.5", isFav && "fill-current")} />
          </button>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r bg-background transition-[width] duration-200 md:flex md:flex-col",
        collapsed ? "md:w-16" : "md:w-64"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="size-4" />
        </div>
        {!collapsed && <span className="truncate font-semibold">School Manage</span>}
      </div>

      <ScrollArea className="min-h-0 flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {favs.length > 0 && !collapsed && (
            <p className="px-3 pt-1 text-xs font-medium uppercase text-muted-foreground">Favourites</p>
          )}
          {favs.map((item) => row(item, "fav-"))}
          {favs.length > 0 && !collapsed && <div className="my-1 border-t" />}
          {items.map((item) => row(item, ""))}
        </nav>
      </ScrollArea>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-start gap-3 px-3"
          onClick={toggleSidebar}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </Button>
      </div>
    </aside>
  )
}
