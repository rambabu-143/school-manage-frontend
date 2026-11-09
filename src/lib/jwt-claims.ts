// Display-only decode of a JWT payload. NOT verification: the backend is the
// only verifier. Used to show the impersonation banner and countdown.
export type TokenClaims = { imp?: string; exp?: number; nonce?: string }

export function decodeClaims(token: string | undefined): TokenClaims {
  try {
    const part = token?.split(".")[1]
    if (!part) return {}
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as TokenClaims
  } catch {
    return {}
  }
}
