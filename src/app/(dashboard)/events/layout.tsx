import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/events")
  return (
    <>
      <SectionLinks items={[{ href: "/events", label: "Events" }, { href: "/events/users", label: "Event users" }, { href: "/events/email-settings", label: "Email" }, { href: "/events/site-files", label: "Site files" }, { href: "/events/registrations", label: "Registrations" }]} />
      {children}
    </>
  )
}
