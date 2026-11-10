import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/self-awareness")
  return (
    <>
      <SectionLinks items={[{ href: "/self-awareness", label: "Forms" }, { href: "/self-awareness/golive", label: "Go-live" }]} />
      {children}
    </>
  )
}
