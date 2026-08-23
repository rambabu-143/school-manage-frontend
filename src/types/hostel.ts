export interface Hostel {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  warden_name: string | null
  warden_phone: string | null
}

export interface HostelCreateInput {
  branch_id: string
  name: string
  warden_name?: string | null
  warden_phone?: string | null
}

export interface HostelRoom {
  id: string
  tenant_id: string
  hostel_id: string
  room_number: string
  room_type: string | null
  capacity: number
}

export interface HostelRoomCreateInput {
  hostel_id: string
  room_number: string
  room_type?: string | null
  capacity: number
}

export interface HostelAllocation {
  id: string
  tenant_id: string
  student_id: string
  room_id: string
  bed_number: number | null
  is_active: boolean
}

export interface RoomOccupant {
  student_id: string
  first_name: string
  last_name: string
  bed_number: number | null
}
