import type { APIRoute } from "astro";
import { sanityWriteClient } from "../../utils/sanityWriteClient";
import { rateLimit } from "../../utils/rateLimit";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let postId: unknown;

  try {
    ({ postId } = await request.json());
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (typeof postId !== "string" || !postId.trim()) {
    return json({ error: "Post ID is required" }, 400);
  }

  if (!rateLimit(`views:${clientAddress}`, 10, 60_000).allowed) {
    return json({ error: "Too many requests" }, 429);
  }

  if (!import.meta.env.SANITY_API_WRITE_TOKEN) {
    console.error("SANITY_API_WRITE_TOKEN is not configured");
    return json({ error: "Not configured" }, 500);
  }

  try {
    const result = await sanityWriteClient
      .patch(postId.trim())
      .setIfMissing({ viewCount: 0 })
      .inc({ viewCount: 1 })
      .commit();

    return json({ viewCount: result.viewCount ?? 0 });
  } catch (error) {
    console.error("Failed to record view:", error);
    return json({ error: "Failed to record view" }, 500);
  }
};
