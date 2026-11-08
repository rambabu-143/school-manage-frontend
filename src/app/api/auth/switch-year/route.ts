import { NextResponse } from "next/server"

import { isUuid, postAuthed, readJson, rotate } from "@/lib/bff"

export async function POST(request: Request) {
  const { academic_year_id } = await readJson(request)
  if (!isUuid(academic_year_id)) return NextResponse.json({ error: "Pick an academic year." }, { status: 400 })
  return postAuthed("/auth/switch-year", { academic_year_id }, "Could not switch year.", rotate)
}
