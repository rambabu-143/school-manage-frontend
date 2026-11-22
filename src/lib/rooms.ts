// Mirrors backend src/rooms/schemas.py: every type except "other" needs the full physical description.
export const DESCRIBED_ROOM_TYPES = ["reception", "staff_room", "lab", "office", "classroom", "conference"] as const

export interface RoomFields {
  floor?: string
  block?: string
  block_id?: string
  area?: string
  facing?: string
  capacity?: number | null
}

/** Names of the fields a room of this type must have but does not. */
export function missingRoomFields(roomType: string, v: RoomFields): string[] {
  if (!(DESCRIBED_ROOM_TYPES as readonly string[]).includes(roomType)) return []
  const missing = (["floor", "area", "facing"] as const).filter((k) => !v[k]?.trim())
  const out: string[] = [...missing]
  if (!v.capacity || v.capacity <= 0) out.push("capacity")
  if (!v.block?.trim() && !v.block_id) out.push("block")
  return out
}

/** Drops empty optionals so the backend never sees "" for floor/area/etc. */
export function buildRoomPayload<T extends RoomFields>(v: T): T {
  const out: Record<string, unknown> = { ...(v as RoomFields) }
  for (const k of ["floor", "block", "block_id", "area", "facing"]) if (!out[k]) delete out[k]
  if (!out.capacity) delete out.capacity
  return out as T
}
