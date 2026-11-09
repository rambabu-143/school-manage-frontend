import fs from "node:fs"
import { createRequire } from "node:module"
import vm from "node:vm"

const require = createRequire(import.meta.url)
const ts = require(process.env.TYPESCRIPT_PATH || "typescript")

/** Load a TS source file in a vm with mocked imports (keyed by specifier). */
export async function loadTs(relPath, mocks = {}, globals = {}) {
  const source = fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  const context = vm.createContext({ Response, Request, Buffer, JSON, URL, URLSearchParams, ...globals })
  const mod = new vm.SourceTextModule(outputText, { context })
  await mod.link((specifier) => {
    const exports = mocks[specifier]
    if (!exports) throw new Error(`unmocked import ${specifier}`)
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [k, v] of Object.entries(exports)) this.setExport(k, v)
    }, { context })
  })
  await mod.evaluate()
  return mod.namespace
}

export function fakeCookies(initial = {}) {
  const jar = new Map(Object.entries(initial))
  return {
    jar,
    get: (n) => (jar.has(n) ? { name: n, value: jar.get(n) } : undefined),
    set: (n, v) => jar.set(n, v),
    delete: (n) => jar.delete(typeof n === "string" ? n : n.name),
  }
}
