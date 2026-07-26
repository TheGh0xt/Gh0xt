import type { APIRoute } from "astro";
import { getSanityPosts } from "../utils/getSanityPosts";

export const prerender = false;

const SITE = "https://thegh0xt.vercel.app";

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET: APIRoute = async () => {
  let posts: any[] = [];

  try {
    posts = await getSanityPosts();
  } catch (error) {
    console.error("Failed to build RSS feed:", error);
  }

  const items = posts
    .filter((post) => post.slug?.current)
    .map((post) => {
      const link = `${SITE}/articles/${post.slug.current}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();

      return `    <item>
      <title>${escape(post.title ?? "Untitled")}</title>
      <link>${escape(link)}</link>
      <guid isPermaLink="true">${escape(link)}</guid>
      <description>${escape(post.description ?? "")}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Adetoye Anointing — Articles</title>
    <link>${SITE}</link>
    <description>Writing on backend systems, agentic tooling, history and photography.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
};
