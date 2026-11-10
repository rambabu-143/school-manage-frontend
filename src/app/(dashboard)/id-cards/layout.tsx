import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/id-cards")
  return (
    <>
      <SectionLinks items={[{ href: "/id-cards", label: "ID cards" }, { href: "/id-cards/requests", label: "Update requests" }]} />
      {children}
    </>
  )
}
