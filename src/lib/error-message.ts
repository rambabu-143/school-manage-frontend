/** Backend errors come back as {message} (validation) or {error} (everything
 * else) via src/exception_handlers.py / auth routes - check both. */
export function errorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string; error?: string }
    return data.message ?? data.error ?? "Something went wrong"
  }
  return "Something went wrong"
}
