"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/hooks/use-products"

interface ProductSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function ProductSelect({ value, onChange, disabled }: ProductSelectProps) {
  const { data: products, isPending } = useProducts()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading products..." : "Select a product"} />
      </SelectTrigger>
      <SelectContent>
        {products?.map((product) => (
          <SelectItem key={product.id} value={product.id}>
            {product.name} ({product.unit})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
