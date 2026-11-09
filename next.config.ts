import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The dev component gallery must not exist in production: rewrite it (before
  // filesystem routes) to a path that does not exist, so it answers 404 at the router.
  async rewrites() {
    if (process.env.NODE_ENV !== "production") return []
    return { beforeFiles: [{ source: "/dev/:path*", destination: "/__not-found__" }], afterFiles: [], fallback: [] }
  },
}

export default nextConfig
