/**
 * Validates a redirect_url query param. Only same-origin relative paths are
 * allowed — anything else is discarded in favor of the fallback, to prevent
 * open-redirect phishing (e.g. /sign-in?redirect_url=https://evil.com).
 */
export function safeRedirectPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  // Must start with a single `/` and not `//` (protocol-relative) or `/\`.
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  return raw;
}
