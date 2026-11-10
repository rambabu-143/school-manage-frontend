"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { z } from "zod"

import { CrudPage } from "@/components/shared/crud-page"
import type { Role } from "@/types/auth"

const ADMINS: Role[] = ["super_admin", "school_admin", "branch_admin"]
type Att = { id: string; name: string }
type Dis = { id: string; name: string; card_type: string; sort_order: number }
const attSchema = z.object({ name: z.string().trim().min(1, "Name is required").max(200) })
const disSchema = z.object({ name: z.string().trim().min(1, "Name is required").max(200), card_type: z.string().trim().min(1, "Card type is required"), sort_order: z.number().int().min(0).optional() })
const roles = { create: ADMINS, update: ADMINS, delete: ADMINS }

export default function ReasonsPage() {
  const attCols: ColumnDef<Att, unknown>[] = [{ accessorKey: "name", header: "Reason" }]
  const disCols: ColumnDef<Dis, unknown>[] = [{ accessorKey: "name", header: "Reason" }, { accessorKey: "card_type", header: "Card type" }, { accessorKey: "sort_order", header: "Order" }]
  return (
    <div className="space-y-10">
      <CrudPage<Att, z.infer<typeof attSchema>> cfg={{ noun: "attendance reason", title: "Attendance reasons", queryKey: "attendance-reasons", path: "/attendance-reasons", columns: attCols, schema: attSchema, fields: [{ name: "name", label: "Name" }], defaults: { name: "" }, rowLabel: (r) => r.name, roles }} />
      <CrudPage<Dis, z.infer<typeof disSchema>> cfg={{ noun: "disciplinary reason", title: "Disciplinary reasons", queryKey: "disciplinary-reasons", path: "/disciplinary-reasons", columns: disCols, schema: disSchema, fields: [{ name: "name", label: "Name" }, { name: "card_type", label: "Card type" }, { name: "sort_order", label: "Sort order", type: "number" }], defaults: { name: "", card_type: "", sort_order: 0 }, rowLabel: (r) => r.name, roles }} />
    </div>
  )
}
