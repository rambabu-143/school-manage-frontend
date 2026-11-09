# Security and cache notes (BFF /api/backend)

## Cache architecture decisions
- Server state lives in TanStack Query only. Keys are `[scope, domain, ...parts]` (`src/lib/query-keys.ts`), scope = tenant|user|branch|academic year.
- Freshness is a per-domain table (`src/lib/query-policy.ts`): reference 5 min, lists 30 s, dashboards 20 s, attendance/notifications 5 s. Retry skips 401/403/404/422.
- Identity lifecycle (`src/lib/identity-lifecycle.ts`): the QueryCache watches the `["session"]` query; any change of user, tenant, branch or year cancels and removes all other-scope queries. Logout also calls `clear()`.
- Redis is NOT added on the Next.js side. Shared/server caching belongs behind FastAPI (per PLAN.md). The BFF stays stateless.
- Zustand is UI-only (`ui-store`: sidebar). `tests/cache-security.test.mjs` fails if a store references tokens, fetch/axios/useQuery, or if an unexpected store is persisted.

## BFF audit: findings and fixes
| # | Finding | Fix |
|---|---|---|
| 1 | No CSRF/Origin check on mutating BFF calls (SameSite=Lax only) | `isSameOriginRequest`: Origin host must match Host/X-Forwarded-Host, else Sec-Fetch-Site same-origin/none; otherwise 403. Applied to BFF and `/api/auth/logout`. |
| 2 | Path segments joined unvalidated (traversal, encoded separators) | `validateProxyPath`: rejects `.`/`..`, `/`, `\`, NUL, spaces, empty; default-denies all `auth/*` except a tiny allow-list (me, session, users, 2fa setup/enable/disable, otp/request) and denies docs, openapi, metrics, health, event-portal/login. |
| 3 | Headers: only Content-Type was forwarded (good) but no explicit allow-list | Allow-list in/out. Cookie, Host, Authorization, X-Forwarded-* never go upstream; upstream Set-Cookie and X-Powered-By never reach the browser. |
| 4 | Responses lacked explicit cache headers | `Cache-Control: private, no-store`, `Vary: Cookie`, `nosniff` on all BFF responses; proxy.ts sets no-store on authenticated page responses. |
| 5 | Whole responses buffered | Upstream body is streamed through. ETag, Last-Modified, Retry-After, Content-Disposition, Content-Range are forwarded. |
| 6 | Upstream 5xx bodies passed through (info leak) | 5xx replaced with `{"error":"Upstream service error"}`. 4xx pass through (forms need 422 detail). |
| 7 | No body size limit | 25 MB cap (Content-Length and bounded read) -> 413. |
| 8 | No cancellation | `request.signal` passed to the upstream fetch. |
| 9 | Concurrent 401s could race the refresh-token rotation | `singleFlight` keyed by refresh token in `authedBackendFetch`. |
| 10 | Login `next` check allowed `/\evil.com` and control chars | `safeNext` (also rejects `//`, absolute URLs, backslash, control chars). |
| 11 | Cookie flags | httpOnly, SameSite=Lax, Secure in production, path `/` already correct; asserted by test. |

## Review round 2 (PR #4 review)
- **Token-returning endpoints via the catch-all proxy (blocker, fixed).** Backend `auth/switch-branch`, `switch-year`, `switch-user`, `otp/verify`, `google` (and login, 2fa/verify, refresh, event-portal/login) return a TokenPair; any XSS could POST them same-origin and read the tokens. Now `auth/*` is default-deny with an allow-list of token-free routes. Defence in depth: proxied JSON bodies have `access_token` / `refresh_token` keys stripped with a server warning. A test reads `tests/fixtures/token-returning-ops.json` (generated from the OpenAPI snapshot 8e0cd49, 9 operations) and asserts each is denied. Token flows must use dedicated `/api/auth/*` handlers (PR feat/fe-auth).
- **Refresh single-flight (major, fixed).** Refresh tokens are single-use, so the settled result is retained 30 s keyed by SHA-256 of the refresh token; requests still carrying the old cookie reuse the rotated pair instead of getting a 401. Limit: per-process memory. Multi-instance deployments need sticky sessions or a shared store.
- **Identity scope (major, fixed).** Branch and academic year come from `/auth/session` (written to `["session-context"]` by `useSession` before the user). The identity guard re-scopes and purges on change, the provider re-mounts the tree under the scope key so all hooks re-key, and `subscribeIdentityChange()` (src/lib/session-events.ts) triggers a session refetch.
- **X-Forwarded-Host (minor, fixed):** first entry of a comma list is used.
- **GET endpoints with side effects (backend follow-up, not changed):** GET is exempt from the Origin check, so these are CSRF-able: `/admission/sibling-detail/send-sms/{sib_id}`, `/exam/report-junior/generate-qr/{section_id}`, `/exam/report-senior/generate-qr/{section_id}`, plus any other GET that sends SMS/email or generates records. They should become POST.

## Known limits
- Request bodies are buffered (needed to replay after a token refresh); uploads are capped at 25 MB. Streaming uploads would lose replay on 401.
- `/api/auth/login` and password-reset POSTs have no Origin check (unauthenticated, no cookie-based side effect); add the same guard if login CSRF becomes a concern.
- Not verified: end-to-end browser behavior (no running backend), `pnpm build` (Google Fonts fetch in sandbox).
