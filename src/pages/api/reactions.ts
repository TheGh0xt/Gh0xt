import type { APIRoute } from "astro";
import { sanity } from "../../utils/sanityClient";
import { sanityWriteClient } from "../../utils/sanityWriteClient";

export const GET: APIRoute = async ({ url }) => {
  const postId = url.searchParams.get("postId");

  if (!postId) {
    return new Response(JSON.stringify({ error: "Post ID is required" }), {
      status: 400,
    });
  }

  try {
    const query = `*[_type == "reaction" && post._ref == $postId] {
      emoji,
      sessionId
    }`;
    const reactions = await sanity.fetch(query, { postId });

    // Group and count reactions
    const counts = reactions.reduce((acc: any, curr: any) => {
      acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
      return acc;
    }, {});

    return new Response(JSON.stringify({ counts, reactions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch reactions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch reactions" }),
      { status: 500 },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { postId, emoji, sessionId } = body;

    if (!postId || !emoji || !sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    if (!import.meta.env.SANITY_API_WRITE_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Sanity write token not configured" }),
        { status: 500 },
      );
    }

    // Check if the user already reacted with this emoji
    const existingQuery = `*[_type == "reaction" && post._ref == $postId && emoji == $emoji && sessionId == $sessionId][0]`;
    const existing = await sanity.fetch(existingQuery, {
      postId,
      emoji,
      sessionId,
    });

    if (existing) {
      // Toggle off: Delete the reaction
      await sanityWriteClient.delete(existing._id);
      return new Response(JSON.stringify({ message: "Reaction removed" }), {
        status: 200,
      });
    } else {
      // Toggle on: Create the reaction
      const result = await sanityWriteClient.create({
        _type: "reaction",
        post: {
          _type: "reference",
          _ref: postId,
        },
        emoji,
        sessionId,
        createdAt: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({ message: "Reaction added", result }),
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return new Response(
      JSON.stringify({ error: "Failed to toggle reaction" }),
      { status: 500 },
    );
  }
};
