import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/inventory")
  return (
    <>
      <SectionLinks items={[{ href: "/inventory", label: "Overview" }, { href: "/inventory/units", label: "Units" }, { href: "/inventory/variants", label: "Variants" }, { href: "/inventory/requisition-roles", label: "Requisition roles" }, { href: "/inventory/approvers", label: "Approvers" }, { href: "/inventory/reports", label: "Reports" }]} />
      {children}
    </>
  )
}
