import { cookies } from "next/headers"

import { rejectCrossSite } from "@/lib/bff"
import { EVENT_COOKIE_PATH, EVENT_TOKEN_COOKIE, eventJson } from "@/lib/event-portal"

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request)
  if (blocked) return blocked
  ;(await cookies()).set(EVENT_TOKEN_COOKIE, "", { httpOnly: true, path: EVENT_COOKIE_PATH, maxAge: 0 })
  return eventJson({ ok: true })
}
