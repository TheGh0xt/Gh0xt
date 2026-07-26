# Portfolio Redesign & Blog Engagement — Design

**Date:** 2026-07-26
**Repo:** `TheGh0xt/Gh0xt` (Astro 5 + Sanity, Vercel)
**Status:** Approved for planning

## 1. Goals

1. Reposition the site around **backend + AI / agentic systems engineering**, aimed partly at prospective clients.
2. Optimize the codebase: remove dead weight, unify layout, fix broken behavior, make rendering honest.
3. Commit to a deliberate minimal aesthetic instead of an accidental one.
4. Ship blog engagement: view counts, comments with approval, reactions.
5. Deliver as a **draft PR with a Vercel preview**. No merge.

## 2. Locked decisions

| Decision | Choice |
|---|---|
| Aesthetic | Terminal, but deliberate — mono as identity, made intentional |
| Accent | Keep `#ec4899` pink, used with intent (links, caret, active nav, focus) |
| Articles structure | Keep the two-door technical / non-technical split, cleaned up |
| View storage | Sanity `viewCount` field, atomic `inc()`, deduped |
| Moderation | Sanity Studio with a dedicated Pending desk view |
| Blockchain | Removed entirely from positioning — not demoted to "formerly" |
| Approach | Primitives first, then migrate pages (staged, reviewable commits) |

## 3. Current-state findings

Verified by reading every file in `src/` and `blog/schemaTypes/`.

**Structural**
- No shared layout. All 7 pages hand-roll `<html><head>` and have drifted: `about/`, `reach/`, `open-source-contributions/` lack `<!doctype>`; `articles/index` and `articles/technical` carry `<link rel="stylesheet" href="/src/style/index.css">` which resolves to nothing in production; only `[slug]` has real OG/Twitter tags.
- `output: 'server'` globally — pages that are pure static content SSR on every request.
- `src/pages/index.astro:23` has an ES `import` inside `<script is:inline>`. That throws in the browser, so `gtag('config', …)` never executes. **Google Analytics has been silently dead.**

**Dead code** (all confirmed zero-reference by grep)
- `src/utils/RENDER_EXAMPLES.ts` (empty file), `src/utils/contentRenderer.ts`, `src/utils/PortableTextRenderer.tsx`, `src/utils/blockContent.ts`, `src/components/ui/menu.astro` (empty), `src/content/config.ts`, `db/seed.ts`
- Unused dependencies: `styled-components`, `@astrojs/db`, `integration`, `react-is`; `prettier` sits in prod dependencies
- Three lockfiles: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`

**CSS**
- `* { font-family: "IBM Plex Mono" !important }` applied to every element
- 14 hand-written `.ibm-plex-mono-*` classes restating Tailwind's `font-*` / `italic`
- Google Fonts loaded via CSS `@import url()` requesting **14 weights across 2 families**, render-blocking; Instrument Serif is loaded but never used
- `#141414` / `#c8ccda` hardcoded in CSS while components hardcode `text-white`, `gray-800`, `blue-400`; `tailwind.config.mjs` defines exactly one token

**Blog engagement WIP** (untracked, not shippable as written)
- `GET /api/reactions` returns **every visitor's `sessionId`** in the response body
- Same route ships the full reaction document list to the browser to be counted client-side
- Reactions keyed on a client-generated `localStorage` string; no rate limiting or spam protection on either route
- `console.log` on every render of both components
- Neither component is mounted in `[slug].astro`
- No view counting exists

## 4. Positioning & copy

Two files carry the positioning: `src/data/intro.md` (homepage) and `src/data/about.md`.

### 4.1 `intro.md` (final)

> I'm a software engineer building backend systems and AI / agentic tooling — the layer where models stop answering questions and start operating real infrastructure.
>
> I work primarily in **Go and Python**, and I'm deliberately unattached to tools: **ADK, LangChain, LangGraph**, or plain HTTP calls and a state machine — whichever one actually fits the problem. Frameworks are a means. Reaching for the fashionable one costs more than writing the thing yourself.
>
> What I care about is how a system behaves when things go wrong. Failure as a design input rather than a retrofit: timeouts and retries that are safe to repeat, tool access scoped to least privilege, and enough tracing that you can answer *"what did the agent actually do?"* after the fact. Agents that touch real systems need the same rigor as any distributed system — because that's what they are.
>
> Most of what I know about infrastructure I learned in public: contributing to **librsvg** with the GNOME Foundation, edge-case coverage for **Kubernetes' cloud-provider-openstack**, and a PKCS#11 module for **Namecoin**.
>
> When I'm not at the terminal — photography 📸, reading 📚, and the history of systems that shaped the modern world.
>
> *Available for backend and AI-systems engineering work — contract or full-time.*

### 4.2 `about.md` (final)

> I'm a software engineer who cares about what's happening underneath the abstraction layers. These days that means two things: backend systems that hold up, and the tooling that lets AI agents act on real systems without falling over.
>
> I build primarily in **Go and Python**, with Rust where it earns its place. I don't have a favorite framework — I have a bias toward whatever leaves the system understandable a year later.
>
> ### How I build
>
> Most of what separates a demo from a system is what happens on the unhappy path. The principles I hold to:
>
> - **Failure is a design input.** Timeouts, retries, and idempotency decided up front — not bolted on after the first incident.
> - **Least privilege, especially for agents.** An agent with a tool is an actor with permissions. Scope it like one.
> - **You must be able to answer "what happened?"** Tracing and structured logs, so behavior is reconstructable rather than guessed at.
> - **Boundaries before cleverness.** Clear contracts between components beat a clever monolith every time.
> - **Tests where the risk is.** Not coverage theater — tests on the logic that will actually hurt when it breaks.
>
> ### Agentic systems
>
> This is what interests me most now: the layer where language models stop answering questions and start operating infrastructure. I've built with **ADK, LangChain, LangGraph**, and **MCP** — and equally often decided a framework was overhead and written the orchestration directly. Knowing which call to make is most of the value.
>
> It pulls me in because it isn't one discipline. It's distributed systems, protocol design, and infrastructure work wearing a new hat — and most of the hard problems are the old ones: what happens when a call fails, who's allowed to do what, and how you know what actually happened.
>
> **MergeOracle** is where I work this out in practice: a Go CLI that reads GitHub issue and PR threads, summarizes the conversation, and drafts a response with Gemini.
>
> ### Where it came from
>
> What pushed me furthest was open source. Contributing to large projects put me in front of problems product work never surfaces: how infrastructure serving millions of people is actually designed, maintained, and argued about in public.
>
> My foundation came from **Linux** — years of installing distributions, breaking them, recovering them, and rebuilding environments until the operating system stopped feeling like magic. That was my unofficial systems engineering training, and it still shapes how I read a stack trace.
>
> I was an Outreachy intern with the **GNOME Foundation (2024–2025)**, working on librsvg — implementing parts of the **SVG2 text layout algorithm** in Rust. Text shaping, bidi handling, specification-driven work where the spec is the argument. I'm still a contributor. I've also written edge-case test coverage for **Kubernetes' cloud-provider-openstack** and contributed to **Namecoin's pkcs11mod**.
>
> Before that I led the **Google Developer Student Club** (now GDG on Campus) at my university from 2022 to 2023, running technical events and growing a local engineering community.
>
> ### Outside engineering
>
> **Photography** 📸, reading 📚, and deep-researching historical events and the patterns behind them. Some of that ends up in my [non-technical](/articles/non-technical) writing.
>
> I'll leave you with a line from [Survivor's Guilt](https://youtu.be/oh0vj_eKHeE) by Dave:
>
> **"when you feel like givin' up, know you're close"**
>
> ---
>
> *Available for backend and AI-systems engineering — [get in touch](/reach).*

Substantive changes from the current file:

- Backend **leads** rather than being described as where the journey started
- **Go and Python** together, Rust "where it earns its place"
- New **How I build** section naming concrete principles: failure as a design input; least privilege for agent tools; reconstructable behavior via tracing; boundaries before cleverness; tests where the risk is
- Agentic systems becomes the centerpiece, naming ADK / LangChain / LangGraph / MCP **framed as judgment** — including deciding a framework is overhead
- The seven-bullet interest list is deleted (the most generic element on the page)
- All blockchain references removed
- Dates and named projects retained — specific credentials are what keep this from reading as generated

### 4.3 Copy accuracy constraint

The `AGENTIC` capability row and the framework sentence assert hands-on use of ADK, LangChain, and LangGraph, per the user's statement. The `SYSTEMS` row is deliberately limited to **Linux · Kubernetes · distributed systems**, each independently supported by the librsvg and cloud-provider-openstack work. Nothing else (Docker, Postgres, Terraform, cloud vendors) goes on a client-facing page without explicit confirmation.

### 4.4 `contact.md`

Currently one line. Rewrite to a short client-oriented framing — what he can be engaged for, then the channels. Low-risk and independently droppable if unwanted.

### 4.5 Markdown link styling

Current `about.md` embeds raw `<a class='text-default font-semibold'>`. New copy uses plain markdown links, styled by a scoped rule on the content container. Removes presentation from content.

## 5. Architecture

### 5.1 Foundation (commit 1)

**Tokens** — `tailwind.config.mjs` gains named semantic colors:

```
bg      #141414   page background (unchanged)
fg      #c8ccda   body text (unchanged)
muted   #6b7280   metadata, dates, secondary labels
line    #262626   hairline borders and rules
accent  #ec4899   links, prompt caret, active nav, focus rings
```

`muted` on `bg` gives ~4.9:1 contrast and `fg` on `bg` ~11:1, both clearing WCAG AA for body text. `accent` on `bg` is ~5.4:1 — fine for links and UI, and it is never used for long-form body copy.

The color key `default` is **renamed to `accent`** across all files. `text-default` reads as "the default color" when it means "the pink one." Mechanical find/replace, ~30 occurrences.

**CSS** — `src/style/index.css` drops the 14 `.ibm-plex-mono-*` classes and the `* { … !important }` rule, replaced by `font-mono` on `html`. Font request narrows from 14 weights / 2 families to **IBM Plex Mono 400 + 600**, with `preconnect`. Instrument Serif removed (unused in this direction).

**Layout** — new `src/layouts/Base.astro` absorbs all seven `<head>` blocks. Props: `title`, `description`, `image?`, `type?`. Provides `<!doctype>`, viewport, canonical, OG + Twitter tags, and a **corrected** inline gtag snippet (no ES import), restoring analytics.

### 5.2 Rendering strategy

| Route | Mode | Why |
|---|---|---|
| `/`, `/about`, `/reach`, `/open-source-contributions`, `/articles` | `prerender = true` | Pure content, no per-request data |
| `/articles/technical`, `/articles/non-technical`, `/articles/[slug]` | SSR | Sanity-backed; new posts must appear without a rebuild |
| `/api/*` | SSR | Dynamic by nature |

Read queries switch to `useCdn: true` (write client stays `false`). SSR article routes set `Cache-Control: s-maxage=60, stale-while-revalidate=300` so repeat hits serve from Vercel's edge.

Additions: `sitemap.xml`, `rss.xml`, `robots.txt`, `404.astro` — none currently exist.

### 5.3 Component inventory (commit 1)

- `layouts/Base.astro` — document shell
- `components/Prompt.astro` — the terminal prompt line motif (hero + section headers)
- `components/Section.astro` — labelled section wrapper with hairline rule
- `components/PostCard.astro` — one article row (title, date, tags, view count), shared by both article lists
- `components/WorkCard.astro` — one project/contribution entry
- `components/CapabilityRow.astro` — the spec-sheet strip

Commit 1 **creates** these primitives. Migrating the existing `header/`, `project.astro`, and `sections/about.astro` onto them happens in commit 2 alongside the deletions, so the "new primitives" and "rewire everything" diffs stay separately reviewable. The `contact.md` rewrite (§4.4) also lands in commit 2 with the other copy changes.

### 5.4 Deletions (commit 2)

Files: `RENDER_EXAMPLES.ts`, `contentRenderer.ts`, `PortableTextRenderer.tsx`, `utils/blockContent.ts`, `ui/menu.astro`, `content/config.ts`, `db/seed.ts`, `pnpm-lock.yaml`, `yarn.lock`
Dependencies: `styled-components`, `@astrojs/db`, `integration`, `react-is`; `prettier` → devDependencies

`blog/schemaTypes/blockContent.ts` is **retained** — it is referenced by the Sanity post schema. Only the unused `src/utils/blockContent.ts` goes.

## 6. Blog engagement (commit 3)

### 6.1 Sanity schema changes (`blog/`)

- `post`: new `viewCount` field (number, default 0, read-only in Studio)
- `comment`, `reaction`: existing types retained; `comment.sessionId` is populated rather than left dangling
- New `blog/structure.ts`: desk structure with a **Pending** list (`approved != true`) separate from published comments

### 6.2 API contracts

**`POST /api/views`** → `{ viewCount }`
- Body: `{ postId }`
- `patch(postId).setIfMissing({viewCount: 0}).inc({viewCount: 1})` — atomic, no read-modify-write race
- Called **client-side after render, fire-and-forget**. Never during SSR: SSR counting lets bots and prefetch inflate the number and adds latency to TTFB.
- Dedupe: `localStorage` guard per post (kills refresh inflation) + server-side rate limit (kills trivial scripted loops)

**`GET /api/reactions?postId&sessionId`** → `{ counts: { emoji: n }, mine: [emoji] }`
- Counts computed **in GROQ** via one query of per-emoji `count()` projections built from the allowlist — O(1) payload regardless of reaction volume
- `mine` resolved server-side from the caller's own `sessionId`
- **No `sessionId` other than the caller's own ever appears in a response.** This is the fix for the current information leak.

**`POST /api/reactions`** → `{ counts, mine }`
- Body: `{ postId, emoji, sessionId }`
- `emoji` validated against the allowlist; `sessionId` validated against `/^[a-z0-9]{8,32}$/` so the field can't be used as arbitrary storage
- Toggles (delete if exists, else create); returns fresh counts so the client needs no refetch

**`GET /api/comments?postId`** → `{ comments: [{ _id, name, content, createdAt }] }`
- Approved only. **`email` is never projected into a response.**

**`POST /api/comments`** → `201 { message }`
- Body: `{ postId, name, email?, content, website, renderedAt }`
- `website` is a honeypot — must be empty
- `renderedAt` is the form render timestamp — reject submissions faster than 3s
- Validation: `name` 1–100, `content` 1–1000, `email` optional and well-formed
- `approved: false` always, set server-side; never trusted from the client

### 6.3 Reaction set

Trimmed from 6 to **4**: 👍 ❤️ 🔥 💡. Six buttons under a post is not minimal.

### 6.4 Abuse mitigation

Shared `src/utils/rateLimit.ts` — in-memory sliding window, key = `hash(clientAddress + salt + route)`.

| Route | Limit |
|---|---|
| `POST /api/comments` | 3 / 10 min |
| `POST /api/reactions` | 30 / min |
| `POST /api/views` | 10 / min |

**Documented limitations — these are deterrents, not security boundaries:**

1. Rate-limit state is per serverless instance, so an attacker spreading requests across cold starts gets more through. If abuse materializes, the upgrade path is Upstash Redis behind the same interface.
2. `sessionId` is client-generated and freely forgeable. Format validation stops it being abused as arbitrary storage, but it cannot establish identity — a determined actor can inflate reaction counts. Genuine one-vote-per-person needs auth, which §12 puts out of scope.
3. `renderedAt` is client-supplied and therefore spoofable. It costs a naive bot script a real round trip; it stops nothing sophisticated.

Together these raise the cost of casual abuse to more than it is worth on a portfolio, which is the actual goal. Nothing here should be described to a third party as spam-proof.

Both components also get their `console.log` calls removed and are finally **mounted in `[slug].astro`**, which is what makes any of this user-visible.

## 7. Landing page (commit 4)

The core content problem: the strongest credentials — merged GNOME work on the SVG2 text layout algorithm, Kubernetes cloud-provider-openstack, a named mention in the librsvg 2.59.2 release — are three clicks deep while the homepage leads with prose.

Structure:

1. **Hero** — prompt line, name, `Software engineer. Backend systems, and the tooling that lets AI agents act on them.`
2. **Capability strip** — `LANGUAGES / AGENTIC / SYSTEMS` spec sheet (see §4.3 for the accuracy constraint)
3. **Positioning** — the `intro.md` body
4. **Selected work** — **MergeOracle first** (direct evidence for the AI/agentic positioning), then librsvg and cloud-provider-openstack beneath it as the depth credential
5. **Writing** — three most recent posts with view counts
6. **Now** — dated: building MergeOracle, still contributing to librsvg, open to work
7. **Footer** — the five channels, condensed

No invented metrics, no "let's build something amazing together." Specific, verifiable credentials are the anti-generic mechanism.

## 8. Error handling

- API routes: typed JSON errors, correct status codes, no internal detail or stack traces in responses
- Missing `SANITY_API_WRITE_TOKEN`: write routes fail closed with a clear server-side log; **read paths and page rendering stay unaffected**
- Engagement components degrade gracefully — a failed reaction/comment/view fetch never blocks article content
- Reactions keep optimistic UI with rollback on failure (already present, retained)
- `404.astro` for unmatched routes; `[slug]` continues returning a real 404 for unknown posts

## 9. Testing

No test infrastructure exists. Adding **Vitest**, scoped to the pure logic extracted from the API routes — where the security-relevant behavior lives and where tests are cheap:

- `rateLimit` — window expiry, reset, per-key isolation
- `validateComment` — length bounds, honeypot rejection, minimum-time rejection, email shape
- `buildReactionCounts` — allowlist filtering, count shaping, `mine` derivation
- view dedupe guard

Explicitly **not** building an e2e suite for a portfolio. `astro check` + `astro build` remain the gate.

## 10. Delivery

- Branch: `redesign/minimal-terminal`
- Four staged commits (foundation → cleanup/migration → engagement → landing page), each independently reviewable on the preview
- **Draft PR** against `main` so it cannot be merged accidentally
- Vercel GitHub integration comments the preview URL on the PR

## 11. Prerequisites the user must handle

1. **`SANITY_API_WRITE_TOKEN` must be set in Vercel, including Preview scope.** Every write path (views, comments, reactions) depends on it; without it the preview renders but engagement fails.
2. **Sanity schema changes live in `blog/`, a separate Studio deploy.** New types and the Pending desk view do not appear in the hosted Studio until deployed. Flagged when ready — not deployed unilaterally.
3. **Vercel connection to be verified.** If the repo isn't on Vercel's GitHub integration, a one-time `vercel link` is needed, which requires an interactive login.

## 12. Out of scope

- Migrating off Sanity
- Auth / user accounts (moderation happens in Studio)
- Comment threading or replies
- Light theme
- E2E test suite
- Docker/Postgres/Terraform or other unverified capability claims

## 13. Risks

| Risk | Mitigation |
|---|---|
| Rate limiting is per-instance | Documented; interface allows a Redis swap without touching call sites |
| `default` → `accent` rename touches many files | Mechanical; `astro check` + build catch misses |
| Sanity write quota consumed by view counts | localStorage dedupe removes the dominant source (refreshes); portfolio traffic is far below quota |
| Static prerender means new posts need SSR routes | Article routes deliberately kept SSR for exactly this reason |
| Framework claims must be accurate | `SYSTEMS` row limited to verifiable items; user confirmed the agentic row |
