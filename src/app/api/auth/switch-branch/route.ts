import { NextResponse } from "next/server"

import { isUuid, postAuthed, readJson, rotate } from "@/lib/bff"

export async function POST(request: Request) {
  const { branch_id } = await readJson(request)
  if (!isUuid(branch_id)) return NextResponse.json({ error: "Pick a branch." }, { status: 400 })
  return postAuthed("/auth/switch-branch", { branch_id }, "Could not switch branch.", rotate)
}
