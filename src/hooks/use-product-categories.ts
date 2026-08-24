"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { ProductCategory, ProductCategoryCreateInput } from "@/types/inventory"

export function useProductCategories(branchId?: string) {
  return useQuery({
    queryKey: ["product-categories", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductCategory[]>("/product-categories", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ProductCategoryCreateInput) => {
      const { data } = await apiClient.post<ProductCategory>("/product-categories", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] })
      toast.success("Category created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
