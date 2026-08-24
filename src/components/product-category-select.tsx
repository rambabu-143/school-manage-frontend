"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProductCategories } from "@/hooks/use-product-categories"

interface ProductCategorySelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function ProductCategorySelect({ value, onChange, disabled }: ProductCategorySelectProps) {
  const { data: categories, isPending } = useProductCategories()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading categories..." : "Select a category"} />
      </SelectTrigger>
      <SelectContent>
        {categories?.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
