import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/clubs")
  return (
    <>
      <SectionLinks items={[{ href: "/clubs", label: "Clubs" }, { href: "/clubs/golive", label: "Go-live" }]} />
      {children}
    </>
  )
}
