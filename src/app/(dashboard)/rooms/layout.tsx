import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/rooms")
  return (
    <>
      <SectionLinks items={[{ href: "/rooms", label: "Rooms" }, { href: "/rooms/blocks", label: "Blocks" }]} />
      {children}
    </>
  )
}
