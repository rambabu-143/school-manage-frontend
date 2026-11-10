import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/certificates")
  return (
    <>
      <SectionLinks items={[{ href: "/certificates", label: "Certificates" }, { href: "/certificates/sections", label: "Section-wise" }]} />
      {children}
    </>
  )
}
