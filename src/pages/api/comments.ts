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
    const query = `*[_type == "comment" && post._ref == $postId && approved == true] | order(createdAt desc) {
      _id,
      name,
      content,
      createdAt
    }`;
    const comments = await sanity.fetch(query, { postId });

    return new Response(JSON.stringify({ comments }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch comments" }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { postId, name, email, content } = body;

    if (!postId || !name || !content) {
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

    const result = await sanityWriteClient.create({
      _type: "comment",
      post: {
        _type: "reference",
        _ref: postId,
      },
      name,
      email,
      content,
      approved: false,
      createdAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ message: "Comment submitted", result }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Failed to submit comment:", error);
    return new Response(JSON.stringify({ error: "Failed to submit comment" }), {
      status: 500,
    });
  }
};
