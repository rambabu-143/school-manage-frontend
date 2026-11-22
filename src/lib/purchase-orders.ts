export const MAX_PO_ITEMS = 200

export interface PoItemDraft {
  product_id: string
  quantity: number
  rate: number
}

export function itemsTotal(items: PoItemDraft[]): number {
  return Math.round(items.reduce((s, i) => s + i.quantity * i.rate, 0) * 100) / 100
}

/** Returns an error string or null. amount is optional only when items carry rates (backend derives sum qty*rate). */
export function validatePo(amount: number | undefined, items: PoItemDraft[]): string | null {
  if (items.length > MAX_PO_ITEMS) return `At most ${MAX_PO_ITEMS} items`
  if (items.some((i) => !i.product_id)) return "Every item needs a product"
  if (items.some((i) => !Number.isInteger(i.quantity) || i.quantity <= 0)) return "Item quantity must be a whole number greater than 0"
  if (items.some((i) => !(i.rate >= 0))) return "Item rate cannot be negative"
  if (items.some((i) => Math.round(i.rate * 100) / 100 !== i.rate)) return "Item rate allows at most 2 decimals"
  if (!(amount && amount > 0) && itemsTotal(items) <= 0) return "Enter an amount or items with a rate"
  return null
}

/** amount omitted when blank so the backend derives it from items. */
export function buildPoPayload<T extends { amount?: number }>(base: T, items: PoItemDraft[]) {
  const { amount, ...rest } = base
  return { ...rest, ...(amount && amount > 0 ? { amount } : {}), ...(items.length ? { items } : {}) }
}
