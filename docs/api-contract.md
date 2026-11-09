# API contract

The backend (FastAPI) OpenAPI document is pinned in `contracts/openapi.json`
(snapshot of backend commit `8e0cd49`, 1218 operations). TypeScript types are
generated from it into `src/lib/api-types.ts` (do not edit by hand).

## Commands

| Command | What it does |
| --- | --- |
| `pnpm gen:api` | Regenerate `src/lib/api-types.ts` from `contracts/openapi.json` |
| `pnpm check:api` | Fails if `api-types.ts` differs from what the snapshot generates |
| `pnpm check:endpoints` | Scans `src` for `apiClient` / `api()` / `fetch("/api/backend/...")` / `authedBackendFetch` path literals and fails on any path or method missing from the snapshot |

## Re-pinning when the backend changes

The frontend must be re-pinned whenever the backend API changes:

1. Export the new schema from the backend (`GET /openapi.json`, or dump `app.openapi()`).
2. Replace `contracts/openapi.json`.
3. `pnpm gen:api`, then `pnpm typecheck` and `pnpm check:endpoints`.
4. Fix call sites that no longer match; commit snapshot + generated types together.

## Typed helper

`src/lib/typed-api.ts` exports `api(method, path, { path, query, body })`.
`path` is the OpenAPI path without the `/api/v1` prefix (the BFF adds it), e.g.
`api("get", "/students", { query: { branch_id } })` or
`api("put", "/students/{student_id}", { path: { student_id }, body })`.
Unknown paths, methods not defined for a path, and unknown query keys are
compile errors. Adopt it per call site; plain `apiClient` calls keep working.
Examples: `useStudents`, `useUpdateStudent`, `useBranches`.
Note: hooks currently cast results to the legacy `types/*` types (e.g. the
schema has `guardians` optional on `StudentRead`); drop the casts as the legacy
types are replaced by `components["schemas"][...]`.

## Routers (path families under `/api/v1`)

171 first-segment families. Largest: `admission` (117), `hr` (54), `exam` (44),
`students` (36), `staff` (30), `attendance` (26), `auth` (23), `events` (22),
`wise` (19), `standard-sections` (17), `subjects` (15). The rest are small CRUD
families (`branches`, `grades`, `sections`, `notices`, `homework`, `houses`,
`transport-*`, `hostel*`, `concessions`, `invoices`, ...); see the `paths`
keys in `contracts/openapi.json` for the full list.

## Public (unauthenticated) operations

Every operation carries the `OAuth2PasswordBearer` security requirement except:

- `GET /health` (outside `/api/v1`)
- `POST /api/v1/auth/login`, `/auth/2fa/verify`, `/auth/refresh`, `/auth/logout`
- `POST /api/v1/auth/password-reset/request`, `/auth/password-reset/confirm`
- `POST /api/v1/auth/otp/request`, `/auth/otp/verify`, `/auth/google`
- `POST /api/v1/tenants` (tenant sign-up)
- `POST /api/v1/hr/machine-attendance` (biometric device ingest; presumably device-authenticated, confirm with backend)
- `POST /api/v1/event-portal/login`
- `POST /api/v1/webhooks/razorpay/{tenant_id}` (signature-verified webhook; never call from the browser)

Public does not mean browser-callable: the browser only talks to the Next.js
BFF (`/api/backend/*`, `/api/auth/*`), which holds tokens in httpOnly cookies.
