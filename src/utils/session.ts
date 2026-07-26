const KEY = "blog_session_id";

/** Generates a 16-char [a-z0-9] id matching the server's session format. */
function generate(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Anonymous, client-generated, and freely forgeable. Good enough to keep a
 * visitor's own reactions consistent across reloads; not an identity.
 */
export function getSessionId(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing && /^[a-z0-9]{8,32}$/.test(existing)) return existing;

    const fresh = generate();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // localStorage unavailable (private mode, blocked cookies)
    return generate();
  }
}
