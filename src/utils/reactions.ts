export const REACTIONS = ["👍", "❤️", "🔥", "💡"] as const;

export type Reaction = (typeof REACTIONS)[number];

export const REACTION_LABELS: Record<Reaction, string> = {
  "👍": "Like",
  "❤️": "Love",
  "🔥": "Fire",
  "💡": "Insightful",
};

const SESSION_ID = /^[a-z0-9]{8,32}$/;

export function isAllowedEmoji(value: unknown): value is Reaction {
  return (
    typeof value === "string" && (REACTIONS as readonly string[]).includes(value)
  );
}

export function isValidSessionId(value: unknown): value is string {
  return typeof value === "string" && SESSION_ID.test(value);
}

/**
 * One query returning per-emoji counts plus the caller's own reactions.
 *
 * Counts use count() so the response stays O(1) in reaction volume rather
 * than shipping every reaction document to the browser. Emoji are passed
 * as parameters, never interpolated into the query string.
 */
export function buildReactionQuery(): {
  query: string;
  emojiParams: Record<string, string>;
} {
  const emojiParams: Record<string, string> = {};

  const projections = REACTIONS.map((emoji, i) => {
    emojiParams[`e${i}`] = emoji;
    return `"c${i}": count(*[_type == "reaction" && post._ref == $postId && emoji == $e${i}])`;
  });

  const query = `{
    ${projections.join(",\n    ")},
    "mine": *[_type == "reaction" && post._ref == $postId && sessionId == $sessionId].emoji
  }`;

  return { query, emojiParams };
}

/** Maps the c0..cN projection keys back onto their emoji. */
export function shapeCounts(raw: Record<string, unknown>): Record<string, number> {
  const counts: Record<string, number> = {};

  REACTIONS.forEach((emoji, i) => {
    const value = raw[`c${i}`];
    counts[emoji] = typeof value === "number" ? value : 0;
  });

  return counts;
}
