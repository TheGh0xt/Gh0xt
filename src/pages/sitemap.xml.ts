import type { APIRoute } from "astro";
import { getSanityPosts } from "../utils/getSanityPosts";

export const prerender = false;

const SITE = "https://thegh0xt.vercel.app";

const STATIC_PATHS = [
  "/",
  "/about",
  "/articles",
  "/articles/technical",
  "/articles/non-technical",
  "/open-source-contributions",
  "/reach",
];

export const GET: APIRoute = async () => {
  let posts: any[] = [];

  try {
    posts = await getSanityPosts();
  } catch (error) {
    console.error("Failed to build sitemap:", error);
  }

  const urls = [
    ...STATIC_PATHS.map((path) => `  <url><loc>${SITE}${path}</loc></url>`),
    ...posts
      .filter((post) => post.slug?.current)
      .map((post) => {
        const lastmod = post.publishedAt
          ? `<lastmod>${new Date(post.publishedAt).toISOString()}</lastmod>`
          : "";
        return `  <url><loc>${SITE}/articles/${post.slug.current}</loc>${lastmod}</url>`;
      }),
  ].join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
};
