import { eventPortalProxy } from "@/lib/event-portal"

export const POST = (request: Request) => eventPortalProxy(request, "POST", "/event-portal/final-submit/send-mail")
