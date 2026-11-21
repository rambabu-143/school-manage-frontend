import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/disciplinary")
  return (
    <>
      <SectionLinks items={[{ href: "/disciplinary", label: "Records" }, { href: "/disciplinary/cards", label: "Cards" }]} />
      {children}
    </>
  )
}
