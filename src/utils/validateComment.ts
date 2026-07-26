export type CleanComment = {
  postId: string;
  name: string;
  email?: string;
  content: string;
};

export type ValidationResult =
  | { ok: true; value: CleanComment }
  | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FILL_MS = 3000;

const MAX_NAME = 100;
const MAX_CONTENT = 1000;

/**
 * Validates an inbound comment payload and returns only the fields we are
 * willing to persist. Notably `approved` is never read from the request —
 * the API route sets it to false server-side.
 */
export function validateComment(
  body: unknown,
  now: number = Date.now(),
): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid payload" };
  }

  const b = body as Record<string, unknown>;

  // Honeypot: hidden in the form, so a real user never fills it.
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return { ok: false, error: "Rejected" };
  }

  // Client-supplied and therefore spoofable. Costs a naive bot a round
  // trip; stops nothing sophisticated.
  if (typeof b.renderedAt === "number" && now - b.renderedAt < MIN_FILL_MS) {
    return { ok: false, error: "Submitted too quickly" };
  }

  const postId = typeof b.postId === "string" ? b.postId.trim() : "";
  if (!postId) {
    return { ok: false, error: "Missing post" };
  }

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name || name.length > MAX_NAME) {
    return { ok: false, error: `Name must be 1-${MAX_NAME} characters` };
  }

  const content = typeof b.content === "string" ? b.content.trim() : "";
  if (!content || content.length > MAX_CONTENT) {
    return { ok: false, error: `Comment must be 1-${MAX_CONTENT} characters` };
  }

  let email: string | undefined;
  if (typeof b.email === "string" && b.email.trim() !== "") {
    const candidate = b.email.trim();
    if (!EMAIL.test(candidate)) {
      return { ok: false, error: "Invalid email" };
    }
    email = candidate;
  }

  return {
    ok: true,
    value: { postId, name, content, ...(email ? { email } : {}) },
  };
}
