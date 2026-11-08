// Lets node's native TS stripping resolve extensionless relative imports in src/lib.
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context)
  } catch (e) {
    if (specifier.startsWith(".") && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
    throw e
  }
}
