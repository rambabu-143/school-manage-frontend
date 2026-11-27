// Headers the backend needs to trust our real-client-IP claim (see backend
// src/auth/rate_limit.py client_ip). Without them every user shares the
// frontend container's IP and hits the per-IP rate limits together.
// `forwardedFor` is Caddy's X-Forwarded-For; the frontend is only reachable via Caddy.
export function proxyHeaders(secret: string | undefined, forwardedFor: string | null | undefined): Record<string, string> {
  if (!secret) return {}
  const out: Record<string, string> = { "X-Internal-Proxy-Secret": secret }
  const ip = forwardedFor?.split(",")[0]?.trim()
  // The backend re-validates it as an IP address and falls back to the socket peer.
  if (ip && ip.length <= 45) out["X-Client-IP"] = ip
  return out
}
