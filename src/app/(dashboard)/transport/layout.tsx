import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/transport")
  return (
    <>
      <SectionLinks items={[{ href: "/transport", label: "Overview" }, { href: "/transport/renewal-settings", label: "Renewal settings" }, { href: "/transport/requests", label: "Requests" }, { href: "/transport/renewals", label: "Renewals" }, { href: "/transport/student", label: "Student detail" }]} />
      {children}
    </>
  )
}
