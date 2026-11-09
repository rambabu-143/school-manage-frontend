"use client"

import { StatusScreen } from "@/components/auth/status-screen"
import { Button } from "@/components/ui/button"

export default function DashboardError({ retry }: { error: Error; retry: () => void }) {
  return (
    <StatusScreen title="Something went wrong" actions={<Button onClick={() => retry()}>Try again</Button>}>
      We couldn&apos;t load this page. Please try again in a moment.
    </StatusScreen>
  )
}
