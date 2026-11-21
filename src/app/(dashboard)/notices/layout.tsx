import { SectionLinks } from "@/components/ops/section-links"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SectionLinks items={[{ href: "/notices", label: "Notices" }, { href: "/notices/posts", label: "Posts" }]} />
      {children}
    </>
  )
}
