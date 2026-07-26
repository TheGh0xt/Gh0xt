import type { APIRoute } from "astro";
import { sanity } from "../../utils/sanityClient";
import { sanityWriteClient } from "../../utils/sanityWriteClient";
import { rateLimit } from "../../utils/rateLimit";
import { validateComment } from "../../utils/validateComment";
import { isValidSessionId } from "../../utils/reactions";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const GET: APIRoute = async ({ url }) => {
  const postId = url.searchParams.get("postId");

  if (!postId) {
    return json({ error: "Post ID is required" }, 400);
  }

  try {
    // Projection deliberately excludes email — it must never reach a client.
    const comments = await sanity.fetch(
      `*[_type == "comment" && post._ref == $postId && approved == true]
        | order(createdAt desc) {
          _id,
          name,
          content,
          createdAt
        }`,
      { postId },
    );

    return json({ comments: comments ?? [] });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return json({ error: "Failed to fetch comments" }, 500);
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const result = validateComment(body);

  if (!result.ok) {
    return json({ error: result.error }, 400);
  }

  if (!rateLimit(`comments:${clientAddress}`, 3, 600_000).allowed) {
    return json(
      { error: "You're posting too often. Try again in a few minutes." },
      429,
    );
  }

  if (!import.meta.env.SANITY_API_WRITE_TOKEN) {
    console.error("SANITY_API_WRITE_TOKEN is not configured");
    return json({ error: "Not configured" }, 500);
  }

  const { postId, name, email, content } = result.value;
  const rawSession = (body as Record<string, unknown>)?.sessionId;

  try {
    await sanityWriteClient.create({
      _type: "comment",
      post: { _type: "reference", _ref: postId },
      name,
      content,
      ...(email ? { email } : {}),
      ...(isValidSessionId(rawSession) ? { sessionId: rawSession } : {}),
      // Always false. Never read from the request body.
      approved: false,
      createdAt: new Date().toISOString(),
    });

    return json({ message: "Comment submitted for review" }, 201);
  } catch (error) {
    console.error("Failed to submit comment:", error);
    return json({ error: "Failed to submit comment" }, 500);
  }
};
