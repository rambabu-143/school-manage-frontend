import { SectionLinks } from "@/components/ops/section-links"
import { requireSectionRole } from "@/lib/require-role"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSectionRole("/self-nomination")
  return (
    <>
      <SectionLinks items={[{ href: "/self-nomination", label: "Nominations" }, { href: "/self-nomination/settings", label: "Settings" }, { href: "/self-nomination/files", label: "Files" }]} />
      {children}
    </>
  )
}
