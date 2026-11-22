import type { MasterDataCategory } from "@/types/masterdata"

// Mirrors backend src/masterdata/constants.py CATEGORY_PARENT_LOOKUP.
export const PARENT_CATEGORY: Partial<Record<MasterDataCategory, MasterDataCategory>> = {
  state: "country",
  occupation_child: "occupation",
}

/** Error text for a missing parent, or null when fine. */
export function parentError(category: MasterDataCategory, parentId: string | null | undefined): string | null {
  const parent = PARENT_CATEGORY[category]
  return parent && !parentId ? `Select a parent ${parent.replace("_", " ")}` : null
}
