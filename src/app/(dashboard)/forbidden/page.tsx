import Link from "next/link"

import { StatusScreen } from "@/components/auth/status-screen"
import { Button } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <StatusScreen title="You don't have access to this page"
      actions={<Button asChild><Link href="/dashboard">Back to dashboard</Link></Button>}>
      Your role doesn&apos;t include this area. If you think that&apos;s a mistake, ask a school admin.
    </StatusScreen>
  )
}
