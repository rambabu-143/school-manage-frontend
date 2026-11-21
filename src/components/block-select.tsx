"use client"

import { useQuery } from "@tanstack/react-query"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"

interface Block { id: string; name: string }

export function BlockSelect({ value, onChange, disabled, branchId }: { value: string | undefined; onChange: (value: string) => void; disabled?: boolean; branchId?: string }) {
  const { data: blocks, isPending } = useQuery({
    queryKey: qk("rooms", "blocks", branchId),
    queryFn: async () => (await apiClient.get<Block[]>("/school-blocks", { params: branchId ? { branch_id: branchId } : undefined })).data,
  })
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full"><SelectValue placeholder={isPending ? "Loading blocks..." : "Select a block"} /></SelectTrigger>
      <SelectContent>{blocks?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
    </Select>
  )
}
