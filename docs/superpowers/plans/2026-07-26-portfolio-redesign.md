# Portfolio Redesign & Blog Engagement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the portfolio around backend + AI/agentic systems engineering, commit to a deliberate minimal terminal aesthetic, remove dead code, and ship blog engagement (views, comments with approval, reactions) — delivered as a draft PR with a Vercel preview.

**Architecture:** Astro 5 with a single shared `Base.astro` layout and semantic Tailwind tokens. Static prerendering for pure-content pages, SSR retained only for Sanity-backed article routes and API routes. Engagement is three API routes writing to Sanity via an authenticated write client, with pure logic (rate limiting, validation, count aggregation) extracted into testable utilities.

**Tech Stack:** Astro 5, Tailwind 3, React 19 (islands only), Sanity v7 client, Vitest, Vercel adapter.

## Global Constraints

- Accent color is `#ec4899`. The Tailwind color key is `accent` — the old key `default` is removed entirely.
- Copy must not claim capabilities beyond: Go, Python, Rust, ADK, LangChain, LangGraph, MCP, Linux, Kubernetes, distributed systems. No Docker/Postgres/Terraform/cloud vendors.
- All blockchain references removed from copy — not demoted to "formerly."
- Reaction allowlist is exactly `['👍','❤️','🔥','💡']`.
- No response from any API route may contain another visitor's `sessionId`, or any commenter's `email`.
- `approved` is always set server-side to `false`; never read from the request body.
- Node 20.x per `package.json` engines.
- Branch: `redesign/minimal-terminal`. Four staged commits. Draft PR only — never merge.

---

## File Structure

**Created:**
- `src/layouts/Base.astro` — document shell, all `<head>` concerns
- `src/components/Prompt.astro` — terminal prompt line motif
- `src/components/Section.astro` — labelled section wrapper
- `src/components/PostCard.astro` — one article row
- `src/components/WorkCard.astro` — one project/contribution entry
- `src/components/CapabilityRow.astro` — spec-sheet strip
- `src/utils/rateLimit.ts` — in-memory sliding window
- `src/utils/validateComment.ts` — comment payload validation
- `src/utils/reactions.ts` — allowlist + count query building
- `src/pages/api/views.ts` — view counter
- `src/pages/404.astro`, `src/pages/rss.xml.ts`, `src/pages/sitemap.xml.ts`, `public/robots.txt`
- `blog/structure.ts` — Sanity desk structure with Pending view
- `tests/*.test.ts` — Vitest unit tests
- `vitest.config.ts`

**Modified:** `tailwind.config.mjs`, `src/style/index.css`, all 7 pages, `src/components/BlogComments.tsx`, `src/components/BlogReactions.tsx`, `src/pages/api/comments.ts`, `src/pages/api/reactions.ts`, `src/utils/getSanityPosts.ts`, `src/utils/getSanityPostBySlug.ts`, `src/data/intro.md`, `src/data/about.md`, `src/data/contact.md`, `blog/schemaTypes/post.ts`, `blog/sanity.config.ts`, `package.json`

**Deleted:** `src/utils/RENDER_EXAMPLES.ts`, `src/utils/contentRenderer.ts`, `src/utils/PortableTextRenderer.tsx`, `src/utils/blockContent.ts`, `src/components/ui/menu.astro`, `src/content/config.ts`, `db/seed.ts`, `pnpm-lock.yaml`, `yarn.lock`

---

## Task 1: Design tokens and CSS foundation

**Files:**
- Modify: `tailwind.config.mjs`
- Modify: `src/style/index.css`

**Interfaces:**
- Produces: Tailwind classes `bg-bg`, `text-fg`, `text-muted`, `border-line`, `text-accent`, `bg-accent`, `border-accent`. Every later task uses these instead of hardcoded colors.

- [ ] **Step 1: Replace the Tailwind theme**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        bg: "#141414",
        fg: "#c8ccda",
        muted: "#6b7280",
        line: "#262626",
        accent: "#ec4899",
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Rewrite the global stylesheet**

Replace the entire contents of `src/style/index.css`. The `@import url(...)` for fonts is removed (it moves to a `<link>` with preconnect in Task 2), the `* { !important }` rule is gone, and all 14 `.ibm-plex-mono-*` classes are deleted.

```css
@import "./portable-text.css";

html {
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace;
  scroll-behavior: smooth;
}

body {
  background-color: #141414;
  color: #c8ccda;
  line-height: 1.75;
  margin: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

:focus-visible {
  outline: 2px solid #ec4899;
  outline-offset: 2px;
}

/* Markdown-authored content: links carry accent without inline classes */
.content a {
  color: #ec4899;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.content a:hover {
  opacity: 0.8;
}

.content p {
  margin-bottom: 1.25rem;
}

.content h3 {
  color: #c8ccda;
  font-weight: 600;
  margin: 2rem 0 0.75rem;
}

.content ul {
  list-style: disc;
  padding-left: 1.25rem;
  margin-bottom: 1.25rem;
}

.content li {
  margin-bottom: 0.5rem;
}

.content hr {
  border: 0;
  border-top: 1px solid #262626;
  margin: 2rem 0;
}
```

- [ ] **Step 3: Verify no references to the removed classes remain**

Run: `grep -rn "ibm-plex-mono-\|text-default\|border-default\|bg-default" src/ | wc -l`
Expected: a non-zero count — these are fixed in Tasks 2–5. Record the number; it must reach 0 by end of Task 5.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.mjs src/style/index.css
git commit -m "refactor(style): semantic color tokens, drop !important font rule and 14 utility classes"
```

---

## Task 2: Base layout and component primitives

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Prompt.astro`, `src/components/Section.astro`, `src/components/PostCard.astro`, `src/components/WorkCard.astro`, `src/components/CapabilityRow.astro`

**Interfaces:**
- Produces:
  - `Base.astro` props: `{ title: string; description?: string; image?: string; type?: 'website'|'article'; publishedAt?: string }`
  - `Prompt.astro` props: `{ path?: string; label?: string }`
  - `Section.astro` props: `{ title: string; id?: string }`
  - `PostCard.astro` props: `{ title: string; slug: string; description?: string; publishedAt?: string; viewCount?: number; tags?: string[] }`
  - `WorkCard.astro` props: `{ name: string; description: string; url: string; meta?: string[] }`
  - `CapabilityRow.astro` props: `{ label: string; items: string[] }`

- [ ] **Step 1: Create the base layout**

This absorbs all seven `<head>` blocks. Note the analytics fix: the current homepage has an ES `import` inside `<script is:inline>`, which throws and prevents `gtag('config')` from ever running.

```astro
---
import "../style/index.css";

interface Props {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  publishedAt?: string;
}

const {
  title,
  description = "Software engineer building backend systems and AI / agentic tooling.",
  image,
  type = "website",
  publishedAt,
} = Astro.props;

const canonical = new URL(Astro.url.pathname, Astro.site ?? Astro.url.origin).href;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content={Astro.generator} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={canonical} />

    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="author" content="Adetoye Anointing" />

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    <meta property="og:url" content={canonical} />
    {image && <meta property="og:image" content={image} />}
    {publishedAt && <meta property="article:published_time" content={publishedAt} />}

    <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {image && <meta name="twitter:image" content={image} />}

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap"
    />

    <link rel="alternate" type="application/rss+xml" title="Articles" href="/rss.xml" />

    <script
      async
      is:inline
      src="https://www.googletagmanager.com/gtag/js?id=G-GSQTWFBD18"></script>
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-GSQTWFBD18");
    </script>
  </head>
  <body class="bg-bg text-fg">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Create the Prompt primitive**

The recurring terminal motif. Used for the hero and section headers.

```astro
---
interface Props {
  path?: string;
  label?: string;
}
const { path = "~", label = "adetoye@systems" } = Astro.props;
---

<div class="flex items-center gap-2 text-xs text-muted">
  <span>{label}</span>
  <span>{path}</span>
  <span class="text-accent">%</span>
  <slot />
  <span class="inline-block w-2 h-4 bg-accent animate-pulse" aria-hidden="true"></span>
</div>
```

- [ ] **Step 3: Create the Section primitive**

```astro
---
interface Props {
  title: string;
  id?: string;
}
const { title, id } = Astro.props;
---

<section id={id} class="mb-16">
  <div class="flex items-center gap-3 mb-6">
    <h2 class="text-xs uppercase tracking-[0.2em] text-muted">{title}</h2>
    <div class="h-px flex-1 bg-line"></div>
  </div>
  <slot />
</section>
```

- [ ] **Step 4: Create PostCard**

```astro
---
interface Props {
  title: string;
  slug: string;
  description?: string;
  publishedAt?: string;
  viewCount?: number;
  tags?: string[];
}
const { title, slug, description, publishedAt, viewCount } = Astro.props;

const date = publishedAt
  ? new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  : null;
---

<a href={`/articles/${slug}`} class="group block py-5 border-b border-line">
  <div class="flex items-baseline justify-between gap-4">
    <h3 class="text-base group-hover:text-accent transition-colors">{title}</h3>
    {date && <time class="text-xs text-muted shrink-0">{date}</time>}
  </div>
  {description && <p class="mt-2 text-sm text-muted line-clamp-2">{description}</p>}
  {
    typeof viewCount === "number" && (
      <p class="mt-2 text-xs text-muted">{viewCount.toLocaleString()} views</p>
    )
  }
</a>
```

- [ ] **Step 5: Create WorkCard**

```astro
---
interface Props {
  name: string;
  description: string;
  url: string;
  meta?: string[];
}
const { name, description, url, meta = [] } = Astro.props;
---

<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  class="group block py-5 border-b border-line"
>
  <div class="flex items-baseline justify-between gap-4">
    <h3 class="text-base text-accent">{name}</h3>
    <span class="text-xs text-muted group-hover:text-accent transition-colors" aria-hidden="true">↗</span>
  </div>
  <p class="mt-2 text-sm text-muted">{description}</p>
  {
    meta.length > 0 && (
      <div class="mt-3 flex flex-wrap gap-2">
        {meta.map((m) => (
          <span class="text-[10px] uppercase tracking-widest text-muted border border-line px-2 py-0.5">
            {m}
          </span>
        ))}
      </div>
    )
  }
</a>
```

- [ ] **Step 6: Create CapabilityRow**

```astro
---
interface Props {
  label: string;
  items: string[];
}
const { label, items } = Astro.props;
---

<div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 text-sm">
  <span class="text-[10px] uppercase tracking-[0.2em] text-muted w-24 shrink-0">{label}</span>
  <span class="text-fg">{items.join(" · ")}</span>
</div>
```

- [ ] **Step 7: Verify the project still builds**

Run: `npm run build`
Expected: succeeds. Nothing consumes the new primitives yet, so this only proves they compile.

- [ ] **Step 8: Commit**

```bash
git add src/layouts src/components/Prompt.astro src/components/Section.astro src/components/PostCard.astro src/components/WorkCard.astro src/components/CapabilityRow.astro
git commit -m "feat(ui): add Base layout and terminal component primitives"
```

---

## Task 3: Rewrite positioning copy

**Files:**
- Modify: `src/data/intro.md`, `src/data/about.md`, `src/data/contact.md`

**Interfaces:**
- Produces: markdown with no inline `class=` attributes. Link styling comes from `.content a` (Task 1).

- [ ] **Step 1: Replace `src/data/intro.md`**

```markdown
I'm a software engineer building backend systems and AI / agentic tooling — the layer where models stop answering questions and start operating real infrastructure.

I work primarily in **Go and Python**, and I'm deliberately unattached to tools: **ADK, LangChain, LangGraph**, or plain HTTP calls and a state machine — whichever one actually fits the problem. Frameworks are a means. Reaching for the fashionable one costs more than writing the thing yourself.

What I care about is how a system behaves when things go wrong. Failure as a design input rather than a retrofit: timeouts and retries that are safe to repeat, tool access scoped to least privilege, and enough tracing that you can answer _"what did the agent actually do?"_ after the fact. Agents that touch real systems need the same rigor as any distributed system — because that's what they are.

Most of what I know about infrastructure I learned in public: contributing to **librsvg** with the GNOME Foundation, edge-case coverage for **Kubernetes' cloud-provider-openstack**, and a PKCS#11 module for **Namecoin**.

When I'm not at the terminal — photography 📸, reading 📚, and the history of systems that shaped the modern world.

_Available for backend and AI-systems engineering work — contract or full-time._
```

- [ ] **Step 2: Replace `src/data/about.md`**

Use the full approved text from spec §4.2 verbatim, converting the raw `<a class='text-default …'>` anchors to plain markdown links.

- [ ] **Step 3: Replace `src/data/contact.md`**

```markdown
I'm available for **backend and AI-systems engineering** — contract or full-time. Typical work: Go and Python services, agentic tooling and MCP integrations, and making existing systems observable enough to debug.

The fastest way to reach me is email. Everything else is below.
```

- [ ] **Step 4: Verify no stale references**

Run: `grep -rn "blockchain\|decentralized\|text-default" src/data/`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "content: reposition around backend and AI/agentic systems engineering"
```

---

## Task 4: Migrate pages onto the layout and delete dead code

**Files:**
- Modify: `src/pages/index.astro`, `src/pages/about/index.astro`, `src/pages/reach/index.astro`, `src/pages/open-source-contributions/index.astro`, `src/pages/articles/index.astro`, `src/pages/articles/technical.astro`, `src/pages/articles/non-technical.astro`, `src/pages/articles/[slug].astro`, `src/components/sections/about.astro`, `src/components/project.astro`, `src/components/header/index.astro`, `src/components/header/nav.astro`
- Delete: `src/utils/RENDER_EXAMPLES.ts`, `src/utils/contentRenderer.ts`, `src/utils/PortableTextRenderer.tsx`, `src/utils/blockContent.ts`, `src/components/ui/menu.astro`, `src/content/config.ts`, `db/seed.ts`, `pnpm-lock.yaml`, `yarn.lock`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Base.astro`, `Section.astro`, `PostCard.astro`, `WorkCard.astro` from Task 2.

- [ ] **Step 1: Delete dead files**

`src/utils/blockContent.ts` is unused. `blog/schemaTypes/blockContent.ts` is referenced by the post schema and must be kept.

```bash
git rm -f src/utils/RENDER_EXAMPLES.ts src/utils/contentRenderer.ts \
  src/utils/PortableTextRenderer.tsx src/utils/blockContent.ts \
  src/components/ui/menu.astro src/content/config.ts db/seed.ts \
  pnpm-lock.yaml yarn.lock
rmdir db 2>/dev/null || true
```

- [ ] **Step 2: Prune dependencies**

```bash
npm uninstall styled-components @astrojs/db integration react-is
npm uninstall prettier && npm install -D prettier
```

- [ ] **Step 3: Migrate each page to `Base.astro`**

Every page drops its hand-rolled `<html>/<head>/<body>` and wraps content in `<Base title=… description=…>`. Add `export const prerender = true;` to `index`, `about`, `reach`, `open-source-contributions`, and `articles/index`. Leave `prerender = false` on `articles/technical`, `articles/non-technical`, and `articles/[slug]`.

Replace every `text-default` with `text-accent`, `border-default` with `border-accent`, `text-white` with `text-fg`, and `gray-400`/`gray-500`/`gray-600` with `muted`, `gray-800`/`gray-900` with `line`.

- [ ] **Step 4: Add edge caching to the SSR article routes**

In the frontmatter of `articles/technical.astro`, `articles/non-technical.astro`, and `articles/[slug].astro`:

```ts
Astro.response.headers.set(
  "Cache-Control",
  "public, s-maxage=60, stale-while-revalidate=300",
);
```

- [ ] **Step 5: Switch read queries to the Sanity CDN**

In `src/utils/sanityClient.ts`, set `useCdn: true`. The write client in `src/utils/sanityWriteClient.ts` stays `useCdn: false`.

- [ ] **Step 6: Verify the token rename is complete**

Run: `grep -rn "ibm-plex-mono-\|text-default\|border-default\|bg-default" src/ | wc -l`
Expected: `0`

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: succeeds with no `astro check` errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: migrate pages to shared layout, remove dead code and unused deps"
```

---

## Task 5: SEO and error routes

**Files:**
- Create: `src/pages/404.astro`, `src/pages/rss.xml.ts`, `src/pages/sitemap.xml.ts`, `public/robots.txt`
- Modify: `astro.config.mjs` (add `site`)

- [ ] **Step 1: Add `site` to the Astro config**

Required for canonical URLs and RSS. Set `site: "https://thegh0xt.vercel.app"`.

- [ ] **Step 2: Create `404.astro`** using `Base.astro`, terminal-styled: `command not found: <path>` with a link home.

- [ ] **Step 3: Create `rss.xml.ts`** — an `APIRoute` GET returning `application/xml`, listing posts from `getSanityPosts()` with title, link, description, and `pubDate`.

- [ ] **Step 4: Create `sitemap.xml.ts`** — static routes plus one `<url>` per post slug.

- [ ] **Step 5: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://thegh0xt.vercel.app/sitemap.xml
```

- [ ] **Step 6: Verify**

Run: `npm run build && npx astro preview &` then `curl -s localhost:4321/rss.xml | head -5`
Expected: valid XML opening with `<?xml version="1.0"`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/404.astro src/pages/rss.xml.ts src/pages/sitemap.xml.ts public/robots.txt astro.config.mjs
git commit -m "feat(seo): add sitemap, RSS, robots.txt and 404 page"
```

---

## Task 6: Rate limiter (TDD)

**Files:**
- Create: `vitest.config.ts`, `src/utils/rateLimit.ts`, `tests/rateLimit.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number }` — used by all three API routes in Task 8.

- [ ] **Step 1: Install Vitest and add the test script**

```bash
npm install -D vitest
npm pkg set scripts.test="vitest run"
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Write the failing test**

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimit, __resetRateLimit } from "../src/utils/rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimit();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("allows requests up to the limit", () => {
    expect(rateLimit("a", 3, 1000).allowed).toBe(true);
    expect(rateLimit("a", 3, 1000).allowed).toBe(true);
    expect(rateLimit("a", 3, 1000).allowed).toBe(true);
  });

  it("blocks past the limit", () => {
    rateLimit("a", 2, 1000);
    rateLimit("a", 2, 1000);
    expect(rateLimit("a", 2, 1000).allowed).toBe(false);
  });

  it("reports remaining budget", () => {
    expect(rateLimit("a", 3, 1000).remaining).toBe(2);
    expect(rateLimit("a", 3, 1000).remaining).toBe(1);
  });

  it("isolates distinct keys", () => {
    rateLimit("a", 1, 1000);
    expect(rateLimit("b", 1, 1000).allowed).toBe(true);
  });

  it("resets after the window elapses", () => {
    rateLimit("a", 1, 1000);
    expect(rateLimit("a", 1, 1000).allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit("a", 1, 1000).allowed).toBe(true);
  });
});
```

- [ ] **Step 4: Run the test to confirm it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/utils/rateLimit`.

- [ ] **Step 5: Implement**

```ts
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Test-only hook. Not used at runtime. */
export function __resetRateLimit(): void {
  buckets.clear();
}

/**
 * In-memory sliding window. State is per serverless instance, so this is a
 * deterrent against casual abuse, not a security boundary.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
```

- [ ] **Step 6: Run the tests to confirm they pass**

Run: `npm test`
Expected: 5 passing.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts src/utils/rateLimit.ts tests/rateLimit.test.ts package.json package-lock.json
git commit -m "feat(api): add in-memory rate limiter with tests"
```

---

## Task 7: Comment validation and reaction helpers (TDD)

**Files:**
- Create: `src/utils/validateComment.ts`, `src/utils/reactions.ts`, `tests/validateComment.test.ts`, `tests/reactions.test.ts`

**Interfaces:**
- Produces:
  - `validateComment(body: unknown, now?: number): { ok: true; value: CleanComment } | { ok: false; error: string }` where `CleanComment = { postId: string; name: string; email?: string; content: string }`
  - `REACTIONS: readonly string[]` — the allowlist
  - `isAllowedEmoji(e: unknown): e is string`
  - `isValidSessionId(s: unknown): s is string`
  - `buildReactionQuery(): { query: string; emojiParams: Record<string, string> }`

- [ ] **Step 1: Write the failing validation tests**

```ts
import { describe, it, expect } from "vitest";
import { validateComment } from "../src/utils/validateComment";

const base = {
  postId: "abc123",
  name: "Ada",
  content: "Nice write-up.",
  website: "",
  renderedAt: 1000,
};

describe("validateComment", () => {
  it("accepts a well-formed payload", () => {
    const r = validateComment(base, 10000);
    expect(r.ok).toBe(true);
  });

  it("rejects a filled honeypot", () => {
    const r = validateComment({ ...base, website: "spam" }, 10000);
    expect(r).toEqual({ ok: false, error: "Rejected" });
  });

  it("rejects submissions faster than 3s", () => {
    const r = validateComment(base, 2000);
    expect(r.ok).toBe(false);
  });

  it("rejects a missing postId", () => {
    const r = validateComment({ ...base, postId: "" }, 10000);
    expect(r.ok).toBe(false);
  });

  it("rejects content over 1000 chars", () => {
    const r = validateComment({ ...base, content: "x".repeat(1001) }, 10000);
    expect(r.ok).toBe(false);
  });

  it("rejects a name over 100 chars", () => {
    const r = validateComment({ ...base, name: "x".repeat(101) }, 10000);
    expect(r.ok).toBe(false);
  });

  it("rejects a malformed email", () => {
    const r = validateComment({ ...base, email: "nope" }, 10000);
    expect(r.ok).toBe(false);
  });

  it("omits email when not supplied", () => {
    const r = validateComment(base, 10000);
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.email).toBeUndefined();
  });

  it("trims whitespace", () => {
    const r = validateComment({ ...base, name: "  Ada  " }, 10000);
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.name).toBe("Ada");
  });

  it("rejects content that is only whitespace", () => {
    const r = validateComment({ ...base, content: "   " }, 10000);
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Write the failing reaction tests**

```ts
import { describe, it, expect } from "vitest";
import { REACTIONS, isAllowedEmoji, isValidSessionId, buildReactionQuery } from "../src/utils/reactions";

describe("reactions", () => {
  it("exposes exactly four reactions", () => {
    expect(REACTIONS).toEqual(["👍", "❤️", "🔥", "💡"]);
  });

  it("accepts allowlisted emoji", () => {
    expect(isAllowedEmoji("🔥")).toBe(true);
  });

  it("rejects non-allowlisted emoji", () => {
    expect(isAllowedEmoji("🎉")).toBe(false);
    expect(isAllowedEmoji("<script>")).toBe(false);
    expect(isAllowedEmoji(null)).toBe(false);
  });

  it("accepts well-formed session ids", () => {
    expect(isValidSessionId("a1b2c3d4e5")).toBe(true);
  });

  it("rejects malformed session ids", () => {
    expect(isValidSessionId("short")).toBe(false);
    expect(isValidSessionId("x".repeat(33))).toBe(false);
    expect(isValidSessionId("has spaces!!")).toBe(false);
    expect(isValidSessionId(42)).toBe(false);
  });

  it("builds a query parameterising every emoji", () => {
    const { query, emojiParams } = buildReactionQuery();
    expect(Object.keys(emojiParams)).toHaveLength(4);
    expect(query).toContain("$e0");
    expect(query).toContain("mine");
    // emoji values must never be inlined into the query string
    for (const e of REACTIONS) expect(query).not.toContain(e);
  });
});
```

- [ ] **Step 3: Run to confirm both fail**

Run: `npm test`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement `src/utils/validateComment.ts`**

```ts
export type CleanComment = {
  postId: string;
  name: string;
  email?: string;
  content: string;
};

export type ValidationResult =
  | { ok: true; value: CleanComment }
  | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FILL_MS = 3000;

export function validateComment(body: unknown, now: number = Date.now()): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid payload" };
  }
  const b = body as Record<string, unknown>;

  // Honeypot: real users never see this field.
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return { ok: false, error: "Rejected" };
  }

  // Client-supplied and therefore spoofable — a speed bump, not a control.
  if (typeof b.renderedAt === "number" && now - b.renderedAt < MIN_FILL_MS) {
    return { ok: false, error: "Submitted too quickly" };
  }

  const postId = typeof b.postId === "string" ? b.postId.trim() : "";
  if (!postId) return { ok: false, error: "Missing post" };

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name || name.length > 100) return { ok: false, error: "Name must be 1-100 characters" };

  const content = typeof b.content === "string" ? b.content.trim() : "";
  if (!content || content.length > 1000) {
    return { ok: false, error: "Comment must be 1-1000 characters" };
  }

  let email: string | undefined;
  if (typeof b.email === "string" && b.email.trim() !== "") {
    const candidate = b.email.trim();
    if (!EMAIL.test(candidate)) return { ok: false, error: "Invalid email" };
    email = candidate;
  }

  return { ok: true, value: { postId, name, content, ...(email ? { email } : {}) } };
}
```

- [ ] **Step 5: Implement `src/utils/reactions.ts`**

```ts
export const REACTIONS = ["👍", "❤️", "🔥", "💡"] as const;
export type Reaction = (typeof REACTIONS)[number];

const SESSION_ID = /^[a-z0-9]{8,32}$/;

export function isAllowedEmoji(e: unknown): e is Reaction {
  return typeof e === "string" && (REACTIONS as readonly string[]).includes(e);
}

export function isValidSessionId(s: unknown): s is string {
  return typeof s === "string" && SESSION_ID.test(s);
}

/**
 * One query returning per-emoji counts plus the caller's own reactions.
 * Counts use count() so the payload stays O(1) in reaction volume, and
 * emoji values are passed as parameters rather than interpolated.
 */
export function buildReactionQuery(): { query: string; emojiParams: Record<string, string> } {
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

/** Maps the c0..cN shape back onto emoji keys. */
export function shapeCounts(raw: Record<string, unknown>): Record<string, number> {
  const counts: Record<string, number> = {};
  REACTIONS.forEach((emoji, i) => {
    const v = raw[`c${i}`];
    counts[emoji] = typeof v === "number" ? v : 0;
  });
  return counts;
}
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: all passing (5 rate limit + 10 validation + 6 reactions).

- [ ] **Step 7: Commit**

```bash
git add src/utils/validateComment.ts src/utils/reactions.ts tests/
git commit -m "feat(api): add comment validation and reaction helpers with tests"
```

---

## Task 8: Sanity schema and API routes

**Files:**
- Modify: `blog/schemaTypes/post.ts`, `blog/sanity.config.ts`, `src/pages/api/comments.ts`, `src/pages/api/reactions.ts`, `src/utils/getSanityPosts.ts`, `src/utils/getSanityPostBySlug.ts`
- Create: `blog/structure.ts`, `src/pages/api/views.ts`

**Interfaces:**
- Consumes: `rateLimit` (Task 6), `validateComment`, `REACTIONS`, `isAllowedEmoji`, `isValidSessionId`, `buildReactionQuery`, `shapeCounts` (Task 7).
- Produces: `POST /api/views → { viewCount }`, `GET|POST /api/reactions → { counts, mine }`, `GET /api/comments → { comments }`, `POST /api/comments → { message }`.

- [ ] **Step 1: Add `viewCount` to the post schema**

```ts
defineField({
  name: 'viewCount',
  title: 'View Count',
  type: 'number',
  initialValue: 0,
  readOnly: true,
  description: 'Incremented automatically. Do not edit by hand.',
}),
```

- [ ] **Step 2: Add `viewCount` to both read projections**

Add `viewCount,` to the projection in `getSanityPosts.ts` and `getSanityPostBySlug.ts`.

- [ ] **Step 3: Create `blog/structure.ts`**

```ts
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('post').title('Posts'),
      S.divider(),
      S.listItem()
        .title('Comments — Pending')
        .child(
          S.documentList()
            .title('Pending Comments')
            .filter('_type == "comment" && approved != true')
            .defaultOrdering([{field: 'createdAt', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Comments — Approved')
        .child(
          S.documentList()
            .title('Approved Comments')
            .filter('_type == "comment" && approved == true')
            .defaultOrdering([{field: 'createdAt', direction: 'desc'}]),
        ),
      S.divider(),
      S.documentTypeListItem('reaction').title('Reactions'),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('category').title('Categories'),
    ])
```

Wire it into `blog/sanity.config.ts` via `structureTool({structure})`.

- [ ] **Step 4: Create `src/pages/api/views.ts`**

```ts
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
      .patch(postId)
      .setIfMissing({ viewCount: 0 })
      .inc({ viewCount: 1 })
      .commit();
    return json({ viewCount: result.viewCount ?? 0 });
  } catch (error) {
    console.error("Failed to record view:", error);
    return json({ error: "Failed to record view" }, 500);
  }
};
```

- [ ] **Step 5: Rewrite `src/pages/api/reactions.ts`**

GET and POST both return `{ counts, mine }` via `buildReactionQuery()` + `shapeCounts()`. `mine` is derived only from the caller's own `sessionId`. Reject non-allowlisted emoji and malformed session ids with 400. Rate limit POST at 30/min.

- [ ] **Step 6: Rewrite `src/pages/api/comments.ts`**

GET projects only `_id, name, content, createdAt` for approved comments — never `email`. POST runs `validateComment`, rate limits at 3 per 10 minutes, and always writes `approved: false` server-side.

- [ ] **Step 7: Verify the reactions route leaks nothing**

Run: `grep -n "sessionId" src/pages/api/reactions.ts`
Expected: `sessionId` appears only as a query parameter and in the `mine` filter — never in a projection returned to the client.

- [ ] **Step 8: Run tests and build**

Run: `npm test && npm run build`
Expected: all tests pass, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add blog src/pages/api src/utils
git commit -m "feat(blog): view counter, hardened reactions and comments API"
```

---

## Task 9: Engagement components

**Files:**
- Modify: `src/components/BlogComments.tsx`, `src/components/BlogReactions.tsx`, `src/pages/articles/[slug].astro`
- Create: `src/components/ViewCounter.tsx`

- [ ] **Step 1: Rewrite `BlogReactions.tsx`** — remove `console.log`, import `REACTIONS` from `src/utils/reactions.ts` (single source of truth), send `sessionId` on GET, consume `{ counts, mine }`, keep optimistic update with rollback, restyle to tokens.

- [ ] **Step 2: Rewrite `BlogComments.tsx`** — remove `console.log`, add the hidden `website` honeypot input and a `renderedAt` timestamp captured on mount, restyle to tokens.

- [ ] **Step 3: Create `ViewCounter.tsx`** — on mount, check `localStorage` key `viewed:<postId>`; if absent, POST to `/api/views`, set the key, and display the returned count. If present, display the server-rendered count unchanged.

- [ ] **Step 4: Mount all three in `[slug].astro`**

```astro
<ViewCounter client:load postId={post._id} initialCount={post.viewCount ?? 0} />
<BlogReactions client:visible postId={post._id} />
<BlogComments client:visible postId={post._id} />
```

- [ ] **Step 5: Verify no debug logging remains**

Run: `grep -rn "console.log" src/components/ src/pages/`
Expected: no output.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components src/pages/articles
git commit -m "feat(blog): mount views, reactions and comments on article pages"
```

---

## Task 10: Landing page

**Files:**
- Modify: `src/pages/index.astro`, `src/components/sections/about.astro`, `src/components/project.astro`

- [ ] **Step 1: Rebuild `index.astro`** with the section order from spec §7: hero (Prompt + name + one-line positioning), capability strip, positioning prose, selected work, recent writing, now, footer.

- [ ] **Step 2: Capability strip content**

```astro
<CapabilityRow label="Languages" items={["Go", "Python", "Rust"]} />
<CapabilityRow label="Agentic" items={["ADK", "LangGraph", "LangChain", "MCP"]} />
<CapabilityRow label="Systems" items={["Linux", "Kubernetes", "distributed systems"]} />
```

Do not add entries beyond these — see Global Constraints.

- [ ] **Step 3: Selected work ordering** — MergeOracle first from `projects.json`, then librsvg and cloud-provider-openstack as inline `WorkCard` entries linking to the existing contribution URLs.

- [ ] **Step 4: Recent writing** — fetch posts, take the three most recent, render with `PostCard`. Because `index.astro` is prerendered, this data is build-time; that is acceptable for a "recent" list.

- [ ] **Step 5: Build and verify**

Run: `npm run build && npm test`
Expected: both succeed.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/components
git commit -m "feat(landing): rebuild homepage around backend and AI/agentic positioning"
```

---

## Task 11: Ship the draft PR

- [ ] **Step 1: Full verification**

Run: `npm test && npm run build`
Expected: all tests pass, build succeeds. Do not proceed on failure.

- [ ] **Step 2: Push**

```bash
git push -u origin redesign/minimal-terminal
```

- [ ] **Step 3: Open the draft PR**

```bash
gh pr create --draft --base main --title "Portfolio redesign: minimal terminal, repositioning, blog engagement" --body "..."
```

Body must list the four commits, the two prerequisites from spec §11, and the honest limitations from spec §6.4.

- [ ] **Step 4: Report the preview URL**

Retrieve the `thegh0xt` preview deployment and report it. Note that `gh0xt` will also deploy until the user disconnects it.

---

## Self-Review

**Spec coverage:** §4 copy → Task 3; §5.1 foundation → Tasks 1–2; §5.2 rendering → Task 4 steps 3–5; §5.3 primitives → Task 2; §5.4 deletions → Task 4; §6.1 schema → Task 8; §6.2 contracts → Task 8; §6.3 reaction set → Task 7; §6.4 abuse → Tasks 6–8; §7 landing → Task 10; §8 error handling → Task 8 (typed JSON, fail-closed) + Task 5 (404); §9 testing → Tasks 6–7; §10 delivery → Task 11. SEO additions from §5.2 → Task 5. No gaps.

**Placeholders:** none — every code step carries real code. Tasks 4/5/8/9/10 describe mechanical edits across many files in prose rather than reproducing every file verbatim; the exact substitutions and verification greps are specified.

**Type consistency:** `rateLimit` returns `{allowed, remaining}` in Task 6 and is consumed as `.allowed` in Task 8. `validateComment` returns a discriminated union checked via `.ok` in both. `REACTIONS` is defined once in Task 7 and imported by Task 9 rather than redeclared — this is the fix for the current duplication between the component and the Sanity schema. `buildReactionQuery` emits `c0..cN` keys which `shapeCounts` maps back to emoji.
