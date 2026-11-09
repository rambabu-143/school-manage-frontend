// Fails if src/lib/api-types.ts is not what openapi-typescript generates from contracts/openapi.json.
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const dir = mkdtempSync(join(tmpdir(), "api-types-"))
const out = join(dir, "api-types.ts")
try {
  execFileSync("pnpm", ["exec", "openapi-typescript", "contracts/openapi.json", "-o", out], { stdio: "ignore" })
  if (readFileSync(out, "utf8") !== readFileSync("src/lib/api-types.ts", "utf8")) {
    console.error("src/lib/api-types.ts is stale. Run `pnpm gen:api` and commit.")
    process.exit(1)
  }
  console.log("api-types.ts is up to date")
} finally {
  rmSync(dir, { recursive: true, force: true })
}
