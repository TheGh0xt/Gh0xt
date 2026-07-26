import { describe, it, expect } from "vitest";
import { validateComment } from "../src/utils/validateComment";

const base = {
  postId: "abc123",
  name: "Ada",
  content: "Nice write-up.",
  website: "",
  renderedAt: 1000,
};

const NOW = 10_000;

describe("validateComment", () => {
  it("accepts a well-formed payload", () => {
    const result = validateComment(base, NOW);
    expect(result.ok).toBe(true);
  });

  it("rejects a filled honeypot", () => {
    const result = validateComment({ ...base, website: "spam" }, NOW);
    expect(result).toEqual({ ok: false, error: "Rejected" });
  });

  it("rejects submissions faster than 3 seconds", () => {
    const result = validateComment(base, 2000);
    expect(result.ok).toBe(false);
  });

  it("accepts submissions at exactly 3 seconds", () => {
    const result = validateComment(base, 4000);
    expect(result.ok).toBe(true);
  });

  it("rejects a non-object payload", () => {
    expect(validateComment(null, NOW).ok).toBe(false);
    expect(validateComment("nope", NOW).ok).toBe(false);
  });

  it("rejects a missing postId", () => {
    expect(validateComment({ ...base, postId: "" }, NOW).ok).toBe(false);
  });

  it("rejects a missing name", () => {
    expect(validateComment({ ...base, name: "" }, NOW).ok).toBe(false);
  });

  it("rejects a name over 100 characters", () => {
    expect(validateComment({ ...base, name: "x".repeat(101) }, NOW).ok).toBe(
      false,
    );
  });

  it("rejects content over 1000 characters", () => {
    expect(
      validateComment({ ...base, content: "x".repeat(1001) }, NOW).ok,
    ).toBe(false);
  });

  it("rejects content that is only whitespace", () => {
    expect(validateComment({ ...base, content: "   " }, NOW).ok).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(validateComment({ ...base, email: "nope" }, NOW).ok).toBe(false);
  });

  it("accepts a well-formed email", () => {
    const result = validateComment({ ...base, email: "a@b.co" }, NOW);
    if (!result.ok) throw new Error("expected ok");
    expect(result.value.email).toBe("a@b.co");
  });

  it("omits email when not supplied", () => {
    const result = validateComment(base, NOW);
    if (!result.ok) throw new Error("expected ok");
    expect(result.value.email).toBeUndefined();
  });

  it("treats an empty email string as absent", () => {
    const result = validateComment({ ...base, email: "  " }, NOW);
    if (!result.ok) throw new Error("expected ok");
    expect(result.value.email).toBeUndefined();
  });

  it("trims whitespace from name and content", () => {
    const result = validateComment(
      { ...base, name: "  Ada  ", content: "  hello  " },
      NOW,
    );
    if (!result.ok) throw new Error("expected ok");
    expect(result.value.name).toBe("Ada");
    expect(result.value.content).toBe("hello");
  });

  it("never returns an approved flag from the payload", () => {
    const result = validateComment({ ...base, approved: true }, NOW);
    if (!result.ok) throw new Error("expected ok");
    expect("approved" in result.value).toBe(false);
  });
});
