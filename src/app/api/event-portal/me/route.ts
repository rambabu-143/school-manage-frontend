import { eventPortalProxy } from "@/lib/event-portal"

export const GET = (request: Request) => eventPortalProxy(request, "GET", "/event-portal/me")
