"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Product, ProductCreateInput } from "@/types/inventory"

export function useProducts(params?: { branchId?: string; categoryId?: string }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Product[]>("/products", {
        params: { branch_id: params?.branchId, category_id: params?.categoryId },
      })
      return data
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ProductCreateInput) => {
      const { data } = await apiClient.post<Product>("/products", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
