import { describe, it, expect } from "vitest";
import {
  REACTIONS,
  isAllowedEmoji,
  isValidSessionId,
  buildReactionQuery,
  shapeCounts,
} from "../src/utils/reactions";

describe("reactions", () => {
  it("exposes exactly four reactions", () => {
    expect(REACTIONS).toEqual(["👍", "❤️", "🔥", "💡"]);
  });

  it("accepts allowlisted emoji", () => {
    for (const emoji of REACTIONS) {
      expect(isAllowedEmoji(emoji)).toBe(true);
    }
  });

  it("rejects non-allowlisted emoji", () => {
    expect(isAllowedEmoji("🎉")).toBe(false);
    expect(isAllowedEmoji("<script>")).toBe(false);
    expect(isAllowedEmoji("")).toBe(false);
    expect(isAllowedEmoji(null)).toBe(false);
    expect(isAllowedEmoji(42)).toBe(false);
  });

  it("accepts well-formed session ids", () => {
    expect(isValidSessionId("a1b2c3d4")).toBe(true);
    expect(isValidSessionId("abcdefgh12345678")).toBe(true);
  });

  it("rejects malformed session ids", () => {
    expect(isValidSessionId("short")).toBe(false);
    expect(isValidSessionId("x".repeat(33))).toBe(false);
    expect(isValidSessionId("has spaces!!")).toBe(false);
    expect(isValidSessionId("UPPERCASE123")).toBe(false);
    expect(isValidSessionId(42)).toBe(false);
    expect(isValidSessionId(null)).toBe(false);
  });

  it("builds a query that parameterises every emoji", () => {
    const { emojiParams } = buildReactionQuery();
    expect(Object.keys(emojiParams)).toHaveLength(REACTIONS.length);
    expect(emojiParams.e0).toBe("👍");
  });

  it("never inlines emoji values into the query string", () => {
    const { query } = buildReactionQuery();
    for (const emoji of REACTIONS) {
      expect(query).not.toContain(emoji);
    }
  });

  it("queries the caller's own reactions", () => {
    const { query } = buildReactionQuery();
    expect(query).toContain("mine");
    expect(query).toContain("$sessionId");
  });

  it("maps raw count keys back onto emoji", () => {
    const counts = shapeCounts({ c0: 5, c1: 2, c2: 0, c3: 9 });
    expect(counts).toEqual({ "👍": 5, "❤️": 2, "🔥": 0, "💡": 9 });
  });

  it("defaults missing or non-numeric counts to zero", () => {
    const counts = shapeCounts({ c0: 5, c1: "nope" });
    expect(counts["❤️"]).toBe(0);
    expect(counts["🔥"]).toBe(0);
    expect(counts["👍"]).toBe(5);
  });
});
