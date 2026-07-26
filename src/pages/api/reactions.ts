import type { APIRoute } from "astro";
import { sanity } from "../../utils/sanityClient";
import { sanityWriteClient } from "../../utils/sanityWriteClient";
import { rateLimit } from "../../utils/rateLimit";
import {
  isAllowedEmoji,
  isValidSessionId,
  buildReactionQuery,
  shapeCounts,
} from "../../utils/reactions";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Returns per-emoji counts plus the CALLER'S OWN reactions only.
 * No other visitor's sessionId is ever included in a response.
 */
async function readState(postId: string, sessionId: string) {
  const { query, emojiParams } = buildReactionQuery();

  const raw = await sanity.fetch(query, {
    postId,
    sessionId,
    ...emojiParams,
  });

  return {
    counts: shapeCounts(raw ?? {}),
    mine: Array.isArray(raw?.mine) ? raw.mine.filter(isAllowedEmoji) : [],
  };
}

export const GET: APIRoute = async ({ url }) => {
  const postId = url.searchParams.get("postId");
  const sessionId = url.searchParams.get("sessionId") ?? "";

  if (!postId) {
    return json({ error: "Post ID is required" }, 400);
  }

  // An absent or malformed session simply has no reactions of its own.
  const safeSession = isValidSessionId(sessionId) ? sessionId : "__none__";

  try {
    return json(await readState(postId, safeSession));
  } catch (error) {
    console.error("Failed to fetch reactions:", error);
    return json({ error: "Failed to fetch reactions" }, 500);
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { postId, emoji, sessionId } = body ?? {};

  if (typeof postId !== "string" || !postId.trim()) {
    return json({ error: "Post ID is required" }, 400);
  }

  if (!isAllowedEmoji(emoji)) {
    return json({ error: "Unsupported reaction" }, 400);
  }

  if (!isValidSessionId(sessionId)) {
    return json({ error: "Invalid session" }, 400);
  }

  if (!rateLimit(`reactions:${clientAddress}`, 30, 60_000).allowed) {
    return json({ error: "Too many requests" }, 429);
  }

  if (!import.meta.env.SANITY_API_WRITE_TOKEN) {
    console.error("SANITY_API_WRITE_TOKEN is not configured");
    return json({ error: "Not configured" }, 500);
  }

  try {
    const existing = await sanity.fetch(
      `*[_type == "reaction" && post._ref == $postId && emoji == $emoji && sessionId == $sessionId][0]{_id}`,
      { postId, emoji, sessionId },
    );

    if (existing?._id) {
      await sanityWriteClient.delete(existing._id);
    } else {
      await sanityWriteClient.create({
        _type: "reaction",
        post: { _type: "reference", _ref: postId },
        emoji,
        sessionId,
        createdAt: new Date().toISOString(),
      });
    }

    // Return fresh state so the client needs no follow-up request.
    return json(await readState(postId, sessionId));
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return json({ error: "Failed to toggle reaction" }, 500);
  }
};
