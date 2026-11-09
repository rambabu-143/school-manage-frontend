"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, LogOut, Menu, Moon, ShieldCheck, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { NAV_ITEMS } from "@/components/layout/nav-config"
import { ScopeSwitcher } from "@/components/auth/scope-switcher"
import { SwitchUserDialog } from "@/components/auth/switch-user-dialog"
import { NotificationsBell } from "@/components/layout/notifications-bell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useLogout } from "@/hooks/use-session"
import { formatRole } from "@/lib/format-role"
import { canImpersonate } from "@/lib/role-guard"
import { useSessionScope } from "@/hooks/use-identity"
import type { Role, User } from "@/types/auth"

function initialsFor(email: string) {
  return email.slice(0, 2).toUpperCase()
}

function MobileNav({ role }: { role: Role }) {
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>School Manage</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export function Topbar({ user }: { user: User }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const logout = useLogout()
  const [switchOpen, setSwitchOpen] = React.useState(false)
  const { data: scope } = useSessionScope()
  const canSwitch = canImpersonate(user.role) && !scope?.impersonation
  const staffLike = user.role !== "parent" && user.role !== "student"

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.replace("/login")
        router.refresh()
      },
    })
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <MobileNav role={user.role} />
        {staffLike && <ScopeSwitcher />}
      </div>

      <div className="flex items-center gap-2">
        <NotificationsBell />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-4 scale-100 dark:scale-0" />
          <Moon className="absolute size-4 scale-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">
                  {initialsFor(user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{user.email}</span>
                <span className="text-xs text-muted-foreground">{formatRole(user.role)}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/security"><ShieldCheck className="size-4" />Security</Link>
            </DropdownMenuItem>
            {canSwitch && (
              <DropdownMenuItem onSelect={() => setSwitchOpen(true)}>
                <Eye className="size-4" />
                View as someone else
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={handleLogout} disabled={logout.isPending}>
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SwitchUserDialog open={switchOpen} onOpenChange={setSwitchOpen} role={user.role} />
    </header>
  )
}
