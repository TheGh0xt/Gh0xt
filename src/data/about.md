I'm a software engineer who cares about what's happening underneath the abstraction layers. These days that means two things: backend systems that hold up, and the tooling that lets AI agents act on real systems without falling over.

I build primarily in **Go and Python**, with Rust where it earns its place. I don't have a favorite framework — I have a bias toward whatever leaves the system understandable a year later.

### How I build

Most of what separates a demo from a system is what happens on the unhappy path. The principles I hold to:

- **Failure is a design input.** Timeouts, retries, and idempotency decided up front — not bolted on after the first incident.
- **Least privilege, especially for agents.** An agent with a tool is an actor with permissions. Scope it like one.
- **You must be able to answer "what happened?"** Tracing and structured logs, so behavior is reconstructable rather than guessed at.
- **Boundaries before cleverness.** Clear contracts between components beat a clever monolith every time.
- **Tests where the risk is.** Not coverage theater — tests on the logic that will actually hurt when it breaks.

### Agentic systems

This is what interests me most now: the layer where language models stop answering questions and start operating infrastructure. I've built with **ADK, LangChain, LangGraph**, and **MCP** — and equally often decided a framework was overhead and written the orchestration directly. Knowing which call to make is most of the value.

It pulls me in because it isn't one discipline. It's distributed systems, protocol design, and infrastructure work wearing a new hat — and most of the hard problems are the old ones: what happens when a call fails, who's allowed to do what, and how you know what actually happened.

[MergeOracle](https://github.com/TheGh0xt/MergeOracle) is where I work this out in practice: a Go CLI that reads GitHub issue and PR threads, summarizes the conversation, and drafts a response with Gemini.

### Where it came from

What pushed me furthest was open source. Contributing to large projects put me in front of problems product work never surfaces: how infrastructure serving millions of people is actually designed, maintained, and argued about in public.

My foundation came from **Linux** — years of installing distributions, breaking them, recovering them, and rebuilding environments until the operating system stopped feeling like magic. That was my unofficial systems engineering training, and it still shapes how I read a stack trace.

I was an Outreachy intern with the **GNOME Foundation (2024–2025)**, working on [librsvg](https://gitlab.gnome.org/GNOME/librsvg) — implementing parts of the **SVG2 text layout algorithm** in Rust. Text shaping, bidi handling, specification-driven work where the spec is the argument. I'm still a contributor. I've also written edge-case test coverage for [Kubernetes' cloud-provider-openstack](https://github.com/kubernetes/cloud-provider-openstack) and contributed to [Namecoin's pkcs11mod](https://github.com/namecoin/pkcs11mod).

Before that I led the **Google Developer Student Club** (now GDG on Campus) at my university from 2022 to 2023, running technical events and growing a local engineering community.

### Outside engineering

**Photography** 📸, reading 📚, and deep-researching historical events and the patterns behind them. Some of that ends up in my [non-technical](/articles/non-technical) writing.

I'll leave you with a line from [Survivor's Guilt](https://youtu.be/oh0vj_eKHeE) by Dave:

**"when you feel like givin' up, know you're close"**

---

_Available for backend and AI-systems engineering — [get in touch](/reach)._
