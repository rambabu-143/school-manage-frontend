import type { Role } from "../../types/auth"

// Declarative screen configs for the operations module. Pure data (no React) so
// tests/ops.test.mjs can check every path, method and field against the OpenAPI snapshot.

export type RefKind =
  | "branch" | "year" | "grade" | "section" | "student" | "route" | "stop"
  | "product" | "user" | "department" | "club" | "stream" | "hostel" | "house" | "staff"

export type FieldKind =
  | "text" | "number" | "date" | "time" | "datetime" | "bool" | "textarea" | "password" | "email"
  | "select" | "file" | "lines" | "multi" | RefKind

export interface Field {
  name: string
  label: string
  kind?: FieldKind
  options?: readonly string[]
  /** multi: which picker adds entries. */
  ref?: RefKind
  /** stop: name of the sibling route field. */
  routeField?: string
  required?: boolean
  /** Sent on create only (not in the PUT body). */
  createOnly?: boolean
  /** Sent on edit only (not in the POST body). */
  editOnly?: boolean
  /** Required on create, optional when editing (e.g. passwords). */
  optionalOnEdit?: boolean
  /** Filled from the scope bar (branch_id / academic_year_id), not shown. */
  scoped?: boolean
  /** Path parameter of an upsert PUT, not a body property. */
  pathParam?: boolean
  help?: string
}

export interface Column { key: string; label: string; kind?: "bool" | "date" | "datetime" | "short" }

export interface RowAction { label: string; method: "post" | "put" | "delete"; path: string; when?: { key: string; equals: string }; confirm?: string; /** Backend allows only these roles; hidden for others. */ roles?: readonly Role[] }

export interface Resource {
  key: string
  title: string
  noun: string
  /** Scope bar: branch, or branch + academic year. Values fill same-named query params and scoped fields. */
  scope?: "branch" | "branch+year"
  /** Scope must be chosen before the list is requested (backend marks the params required). */
  scopeRequired?: boolean
  filters?: { name: string; label: string; kind: "select" | RefKind; options?: readonly string[]; required?: boolean }[]
  list: string
  create?: string
  /** Item path with {id}; used for PUT and DELETE. */
  item?: string
  idKey?: string
  /** create and edit both PUT the item path (id from the idKey field). */
  upsert?: boolean
  noUpdate?: boolean
  noDelete?: boolean
  /** read: who may list (page shows a notice otherwise); write: who may create/edit/delete. Omit = any staff. */
  roles?: { read?: readonly Role[]; write?: readonly Role[] }
  columns: Column[]
  fields: Field[]
  actions?: RowAction[]
  downloads?: { label: string; path: string; fallbackName: string }[]
}

export interface Report {
  key: string
  title: string
  method: "get" | "post"
  path: string
  /** Filters: query params (get) or body fields (post). */
  fields: Field[]
  scope?: "branch" | "branch+year"
  /** Property holding nested rows to flatten (e.g. transactions). */
  flatten?: string
}

export interface ActionFormCfg {
  key: string
  title: string
  method: "post" | "put"
  path: string
  scope?: "branch" | "branch+year"
  fields: Field[]
  submit: string
  /** multipart/form-data instead of JSON (any "file" field). */
  multipart?: boolean
  /** Backend allows only these roles; form hidden for others. */
  roles?: readonly Role[]
}
