/** Backend errors come back as {message} (validation, via
 * src/exception_handlers.py), {detail} (a plain FastAPI HTTPException, e.g.
 * 400/403/404/409 - the most common case), or {error} - check all three. */
export function errorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string; detail?: string; error?: string }
    return data.message ?? data.detail ?? data.error ?? "Something went wrong"
  }
  return "Something went wrong"
}
