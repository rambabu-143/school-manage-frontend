import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/observations")
  return (
    <>
      <SectionLinks items={[{ href: "/observations", label: "Remarks" }, { href: "/observations/ppr", label: "PPR report" }]} />
      {children}
    </>
  )
}
