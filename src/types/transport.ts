export interface TransportRoute {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  vehicle_number: string | null
  driver_name: string | null
  driver_phone: string | null
}

export interface TransportRouteCreateInput {
  branch_id: string
  name: string
  vehicle_number?: string | null
  driver_name?: string | null
  driver_phone?: string | null
}

export interface TransportSlab {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  monthly_fare: number
}

export interface TransportSlabCreateInput {
  branch_id: string
  name: string
  monthly_fare: number
}

export interface TransportStop {
  id: string
  tenant_id: string
  route_id: string
  slab_id: string
  name: string
  sequence: number
}

export interface TransportStopCreateInput {
  route_id: string
  slab_id: string
  name: string
  sequence: number
}

export interface StudentTransport {
  id: string
  tenant_id: string
  student_id: string
  route_id: string
  stop_id: string
  is_active: boolean
}

export interface RouteStudent {
  student_id: string
  first_name: string
  last_name: string
  stop_id: string
  stop_name: string
}
