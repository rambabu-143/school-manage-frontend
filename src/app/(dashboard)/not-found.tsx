import Link from "next/link"

import { StatusScreen } from "@/components/auth/status-screen"
import { Button } from "@/components/ui/button"

export default function DashboardNotFound() {
  return (
    <StatusScreen title="We couldn't find that page"
      actions={<Button asChild><Link href="/dashboard">Back to dashboard</Link></Button>}>
      The link may be old or the page may have moved.
    </StatusScreen>
  )
}
