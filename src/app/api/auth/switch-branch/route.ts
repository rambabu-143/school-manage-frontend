import { NextResponse } from "next/server"

import { isUuid, postAuthed, readJson, rejectCrossSite, rotate } from "@/lib/bff"

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request, { json: true })
  if (blocked) return blocked
  const { branch_id } = await readJson(request)
  if (!isUuid(branch_id)) return NextResponse.json({ error: "Pick a branch." }, { status: 400 })
  return postAuthed("/auth/switch-branch", { branch_id }, "Could not switch branch.", rotate)
}
