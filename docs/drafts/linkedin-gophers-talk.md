# LinkedIn post — Nigerian Gophers Meetup talk

Post with the desk photo (`public/speaking/gophers-nigeria-2026/desk.jpg`) attached.
One link, in the post body, pointing at the talk page.

---

I gave my first talk on 22 August, to the Nigerian Gophers Meetup.

"Building Production-Ready MCP Servers for AI Applications and Agents" — a room of backend engineers, and the first time I'd presented to a technical audience.

The argument fits in a sentence: a production-grade MCP server is the backend engineering you already have. Structs. A map behind a mutex. An HTTP client that handles its own failure. Service boundaries. Least privilege. What changes isn't the engineering — it's who is calling it, and how much you can trust the caller.

Three things worth carrying out of it:

→ Tools, resources and prompts are three different cost and trust boundaries, not three names for the same thing. Tools have side effects and cost tokens on every call. Resources are cheap, cacheable context. Prompts belong to the domain that owns them, not to every client that talks about it.

→ Test locally on the transport you intend to run in production. Building against stdio and switching to streamableHTTP at deploy time is where the subtle bugs hide — buffering, connection lifecycle and error propagation all differ.

→ Least privilege applies to agents exactly as it applies to service accounts. One MCP server: an organizer agent with the full toolset, an attendee agent with a read-only subset. Two blast radii.

The demo is a Go MCP server for running a meetup — built for the meetup I was presenting at. Google ADK on the agent side, one real GitHub call, tests that drive the real protocol with no network. It's open source.

First time presenting to a technical audience. I built the demo, ran it live, and I'd do it again — so if your community wants this talk, it's ready.

Slides, write-up and source → https://thegh0xt.vercel.app/speaking/production-ready-mcp-servers

#golang #MCP #AI #agents

---

## Notes

- Once the article is published, a second post a few days later can lead with
  the article instead and link the talk page underneath — same audience, second
  touch, no repetition.
- If the meetup organisers posted a recap or a recording, comment the link on
  your own post rather than editing it in; edited posts lose reach.
