import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, __resetRateLimit } from "../src/utils/rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimit();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit", () => {
    expect(rateLimit("a", 3, 1000).allowed).toBe(true);
    expect(rateLimit("a", 3, 1000).allowed).toBe(true);
    expect(rateLimit("a", 3, 1000).allowed).toBe(true);
  });

  it("blocks once the limit is exceeded", () => {
    rateLimit("a", 2, 1000);
    rateLimit("a", 2, 1000);
    expect(rateLimit("a", 2, 1000).allowed).toBe(false);
  });

  it("reports the remaining budget", () => {
    expect(rateLimit("a", 3, 1000).remaining).toBe(2);
    expect(rateLimit("a", 3, 1000).remaining).toBe(1);
    expect(rateLimit("a", 3, 1000).remaining).toBe(0);
  });

  it("reports zero remaining when blocked", () => {
    rateLimit("a", 1, 1000);
    expect(rateLimit("a", 1, 1000).remaining).toBe(0);
  });

  it("isolates distinct keys", () => {
    rateLimit("a", 1, 1000);
    expect(rateLimit("a", 1, 1000).allowed).toBe(false);
    expect(rateLimit("b", 1, 1000).allowed).toBe(true);
  });

  it("resets after the window elapses", () => {
    rateLimit("a", 1, 1000);
    expect(rateLimit("a", 1, 1000).allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(rateLimit("a", 1, 1000).allowed).toBe(true);
  });

  it("does not reset before the window elapses", () => {
    rateLimit("a", 1, 1000);
    vi.advanceTimersByTime(999);
    expect(rateLimit("a", 1, 1000).allowed).toBe(false);
  });
});
