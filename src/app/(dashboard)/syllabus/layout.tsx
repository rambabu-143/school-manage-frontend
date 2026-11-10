import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/syllabus")
  return (
    <>
      <SectionLinks items={[{ href: "/syllabus", label: "Syllabus" }, { href: "/syllabus/documents", label: "Documents" }]} />
      {children}
    </>
  )
}
