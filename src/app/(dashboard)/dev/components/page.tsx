import { notFound } from "next/navigation"

import { DevComponents } from "./demo"

// Dev-only gallery of the shared components; 404s in production builds.
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound()
  return <DevComponents />
}
