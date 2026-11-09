# Shared UI components

Live demo (dev only, 404 in production): `/dev/components`. Pure logic lives in `src/lib/shared/*` (unit-tested by `pnpm test:shared`).

## Errors: `useApiError`
```tsx
const { handle } = useApiError()
useMutation({ mutationFn, onError: (e) => handle(e, form.setError) })
```
422 field errors go onto the form (first field focused); everything else is toasted. `parseApiError(e)` returns `{kind, message, fieldErrors, rowErrors, retryAfter}` for 401/403/404/409/422/429/503/5xx/network.

## Upload
```tsx
<FileUpload<ImportResult> path="/bulk-import/students" rule={CSV_RULE} onSuccess={...} />
```
`CSV_RULE` (10 MB, mirrors `documents_max_upload_bytes`), `IMAGE_RULE` (PNG/JPEG). A 422 with `detail.errors[{row,message}]` renders as a row report. Hook: `useUpload({path, rule})` gives `upload, cancel, progress, error, data`.

## Download
```tsx
<DownloadButton path={`/students/${id}/id-card.pdf`} fallbackName="id-card.pdf" open>Print</DownloadButton>
```
`useDownload()` honours Content-Disposition (path parts stripped) and toasts server errors.

## Filters (URL synced)
```tsx
<ReportFilterBar show={["branch", "year", "dates"]} />
const { values } = useReportFilters() // branch_id, academic_year_id, grade_id, section_id, date_from, date_to
```
Pages using these hooks need a `<Suspense>` boundary (`useSearchParams`).

## Server table
```tsx
const lp = useListParams()  // page, limit (<=100), sort, dir from the URL
const q = useQuery({ queryKey: ["x", lp], queryFn: () => apiClient.get("/x", { params: toApiParams(lp) }) })
<ServerDataTable columns={cols} rows={q.data} isLoading={q.isPending} sortable={["name"]} />
```
`toApiParams` sends `offset`/`limit` and `sort` (`-name` = desc; only useful where the endpoint supports it). Pass `total` if the API returns one; otherwise Next stays enabled while a full page returns.

## CRUD page
```tsx
<CrudPage cfg={{ noun: "grade", title: "Grades", queryKey: "grades", path: "/grades", columns, schema,
  fields: [{ name: "name", label: "Name" }], defaults: { name: "" }, rowLabel: (r) => r.name,
  roles: { delete: ["school_admin"] } }} />
```
Create = POST `path`, edit = PUT `path/{id}`, delete = DELETE `path/{id}`. No optimistic updates: toast, then refetch. Delete uses `ConfirmDialog` naming the record and noting the audit log. `roles` only hides buttons; the backend enforces.

## BFF notes
`/api/backend/[...path]` buffers multipart bodies (`arrayBuffer`), so uploads are held in memory (fine at the 10 MB cap) and are not streamed. Responses forward only Content-Type and Content-Disposition, so `Retry-After` is dropped and the 429 message loses its countdown until the proxy forwards it.
