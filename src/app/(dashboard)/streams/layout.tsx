import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/streams")
  return (
    <>
      <SectionLinks items={[{ href: "/streams", label: "Streams" }, { href: "/streams/settings", label: "Selection windows" }]} />
      {children}
    </>
  )
}
