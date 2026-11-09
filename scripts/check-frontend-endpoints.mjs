// Scans src for backend path literals (apiClient.<method>, api(<method>, ...), fetch("/api/backend/...")
// and reports any whose method + path shape is absent from contracts/openapi.json.
// Usage: node scripts/check-frontend-endpoints.mjs   (exit 1 on mismatch)
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const spec = JSON.parse(readFileSync("contracts/openapi.json", "utf8"))
const PREFIX = "/api/v1"
const norm = (p) => p.replace(/\{[^}]*\}|\$\{[^}]*\}/g, "{}").replace(/\/+$/, "")
const known = new Map() // normalized path -> Set of methods
for (const [p, ops] of Object.entries(spec.paths)) {
  if (!p.startsWith(PREFIX)) continue
  const key = norm(p.slice(PREFIX.length))
  const set = known.get(key) ?? new Set()
  for (const m of Object.keys(ops)) set.add(m)
  known.set(key, set)
}

// A "{}" segment in a frontend path (template expression) may be a path param or a literal
// (e.g. `/exams/${id}/${locked ? "lock" : "unlock"}`), so match segment-wise.
function lookup(p) {
  const exact = known.get(p)
  if (exact) return exact
  const segs = p.split("/")
  const hit = new Set()
  for (const [k, ms] of known) {
    const ks = k.split("/")
    if (ks.length === segs.length && segs.every((s, i) => s === ks[i] || s === "{}" || ks[i] === "{}")) ms.forEach((m) => hit.add(m))
  }
  return hit.size ? hit : undefined
}

function* walk(dir) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f)
    if (statSync(full).isDirectory()) yield* walk(full)
    else if (/\.(ts|tsx)$/.test(f) && !full.endsWith("api-types.ts")) yield full
  }
}

const lit = String.raw`(?<q>["'\x60])(?<p>(?:\\.|(?!\k<q>)[^\\])*)\k<q>`
const patterns = [
  { re: new RegExp(String.raw`apiClient\s*\.\s*(?<m>get|post|put|patch|delete)\s*(?:<[^()]*>)?\s*\(\s*${lit}`, "g") },
  { re: new RegExp(String.raw`\bapi\s*\(\s*["'](?<m>get|post|put|patch|delete)["']\s*,\s*${lit}`, "g") },
  { re: new RegExp(String.raw`authedBackendFetch\s*\(\s*\w+\s*,\s*${lit}(?:\s*,\s*\{[^}]*?method:\s*["'](?<m>\w+)["'])?`, "g") },
  { re: new RegExp(String.raw`fetch\s*\(\s*${lit}(?:\s*,\s*\{[^}]*?method:\s*["'](?<m>\w+)["'])?`, "g"), backendOnly: true },
]

const problems = []
let checked = 0
for (const file of walk("src")) {
  const text = readFileSync(file, "utf8")
  for (const { re, backendOnly } of patterns) {
    for (const m of text.matchAll(re)) {
      let p = m.groups.p
      if (backendOnly) {
        if (!p.startsWith("/api/backend/")) continue
        p = p.slice("/api/backend".length)
      }
      const line = text.slice(0, m.index).split("\n").length
      p = norm(p).split("?")[0]
      if (!p.startsWith("/")) continue // dynamic base, cannot check statically
      checked++
      const meth = (m.groups.m ?? "get").toLowerCase()
      const methods = lookup(p)
      if (!methods) problems.push(`${file}:${line}  ${meth.toUpperCase()} ${p}  -> path not in OpenAPI`)
      else if (!methods.has(meth)) problems.push(`${file}:${line}  ${meth.toUpperCase()} ${p}  -> method not allowed (spec: ${[...methods].join(",").toUpperCase()})`)
    }
  }
}
console.log(`checked ${checked} call sites`)
if (problems.length) {
  console.error(problems.join("\n"))
  console.error(`${problems.length} mismatch(es)`)
  process.exit(1)
}
