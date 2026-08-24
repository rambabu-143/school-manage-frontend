"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { DataTable } from "@/components/data-table/data-table"
import { HouseSelect } from "@/components/house-select"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAcademicYears } from "@/hooks/use-academic-years"
import { useAwardHousePoints, useHousePoints } from "@/hooks/use-house-points"
import { useHouses } from "@/hooks/use-houses"
import type { HousePoints } from "@/types/houses"

const pointsSchema = z.object({
  house_id: z.string().min(1, "House is required"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  points: z.coerce.number().int().positive("Points must be greater than 0"),
  reason: z.string().min(1, "Reason is required").max(200),
})

type PointsInput = z.input<typeof pointsSchema>
type PointsValues = z.output<typeof pointsSchema>

export function PointsTab() {
  const { data: points, isPending } = useHousePoints()
  const { data: houses } = useHouses()
  const { data: years } = useAcademicYears()
  const [open, setOpen] = React.useState(false)
  const awardPoints = useAwardHousePoints()

  const form = useForm<PointsInput, unknown, PointsValues>({
    resolver: zodResolver(pointsSchema),
    defaultValues: { house_id: "", academic_year_id: "", points: 10, reason: "" },
  })

  function onSubmit(values: PointsValues) {
    awardPoints.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<HousePoints>[] = [
    {
      id: "house",
      header: "House",
      cell: ({ row }) => houses?.find((h) => h.id === row.original.house_id)?.name ?? "—",
    },
    {
      id: "year",
      header: "Year",
      cell: ({ row }) => years?.find((y) => y.id === row.original.academic_year_id)?.name ?? "—",
    },
    { accessorKey: "points", header: "Points" },
    { accessorKey: "reason", header: "Reason" },
    { accessorKey: "awarded_date", header: "Date" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Sheet
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) form.reset()
          }}
        >
          <SheetTrigger asChild>
            <Button>
              <Plus />
              Award Points
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Award Points</SheetTitle>
              <SheetDescription>Give a house points for something.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="house_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House</FormLabel>
                      <FormControl>
                        <HouseSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="academic_year_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic year</FormLabel>
                      <FormControl>
                        <AcademicYearSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input placeholder="Won the relay race" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={awardPoints.isPending}>
                    {awardPoints.isPending && <Loader2 className="animate-spin" />}
                    Award points
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={points ?? []}
        isLoading={isPending}
        emptyMessage="No points awarded yet."
      />
    </div>
  )
}
