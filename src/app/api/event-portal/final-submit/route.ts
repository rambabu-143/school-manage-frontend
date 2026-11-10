import { eventPortalProxy } from "@/lib/event-portal"

export const PUT = (request: Request) => eventPortalProxy(request, "PUT", "/event-portal/final-submit", { json: true })
