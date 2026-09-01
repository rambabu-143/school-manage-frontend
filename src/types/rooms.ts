export type RoomType =
  | "reception"
  | "staff_room"
  | "lab"
  | "office"
  | "classroom"
  | "conference"
  | "other"

export interface Room {
  id: string
  tenant_id: string
  branch_id: string
  room_number: string
  room_type: RoomType
  floor: string | null
  block: string | null
  capacity: number | null
}

export interface RoomCreateInput {
  branch_id: string
  room_number: string
  room_type: RoomType
  floor?: string | null
  block?: string | null
  capacity?: number | null
}
