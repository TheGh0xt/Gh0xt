Most MCP tutorials teach you tools and stop there. You end up with a server where everything is a function call — the menu is a function call, the house style is a function call — and the model has to reason about whether to invoke each one. That version of MCP works. It also costs you latency, tokens and permission surface you never needed to spend.

The protocol gives you three primitives, not one. They are not three names for the same idea. They are three different boundaries, and the reason to keep them straight is operational rather than aesthetic.

## The three, precisely

**Tools are verbs.** Actions the agent decides to invoke: `get_speaker(handle)`, `rsvp(event_id, name)`, `enrich_speaker_from_github(handle)`. The model reasons about whether to call one, then calls it. This is the part most people already have from function calling.

**Resources are nouns.** Passive data the application reads, addressed by URI: `meetup://events/next`. Either a fixed URI, or a template with parameters. There is no "should I call this?" step in front of a resource — the host reads it and the contents go into the context window.

```go
res, err := session.ReadResource(ctx, &mcp.ReadResourceParams{
    URI: "meetup://events/next",
})
// res.Contents goes straight into the agent's context.
```

**Prompts are templates.** Reusable, parameterised prompts the server ships for its own domain — `draft_rsvp_reminder`, say. They are user-controlled: something explicitly invokes them, nothing triggers them automatically.

```go
p, err := session.GetPrompt(ctx, &mcp.GetPromptParams{
    Name: "draft_rsvp_reminder",
})
// p.Messages is ready to hand to the model.
```

If you want one line to remember it by: you are at a restaurant. A tool is ordering the dish. A resource is the menu. A prompt is the waiter's recommended pairing.

## Why the distinction is a boundary

The metaphor is how you remember it. Here is why it earns its place in a design review.

**Tools cost on every call, and they are your permission surface.** A tool invocation is a reasoning step, a round trip, tokens in and tokens out, and — the part that matters — a possible side effect. Anything that can be called can be called wrongly, at the wrong time, by an agent that has misread the situation. So the set of tools you expose to a given client is the set of things that client is allowed to do. That is not a modelling detail; it is an authorisation decision.

Which means the same server can serve two clients with two different blast radii:

```go
readOnly := []string{"get_speaker", "list_events"}

attendeeTools := tool.FilterToolset(meetupTools, func(t tool.Tool) bool {
    for _, name := range readOnly {
        if t.Name() == name {
            return true
        }
    }
    return false
})
```

One MCP server. An organizer agent with the full toolset, an attendee agent with a read-only subset. Least privilege applies to agents exactly as it applies to service accounts and API keys — and the toolset is where you apply it.

**Resources are cheap, cacheable context.** When something is just data the agent should have — the next event, the current config, today's schedule — making it a tool means paying a reasoning step to decide whether to fetch a thing you already knew you wanted. A resource skips the decision. It also caches, because a URI is a cache key and an action is not.

**Prompts move domain expertise to where the domain lives.** The team that owns the meetup server knows better than any client how to phrase a request about events and RSVPs. Ship that phrasing as a prompt and every client stops maintaining its own copy — and stops drifting out of date when the domain changes. Prompt engineering becomes a versioned artefact of the service that owns the domain, instead of a string duplicated across four codebases.

## The rule that falls out of it

When you are deciding where something belongs:

- Is it an **action you want taken**, with a consequence? Tool. And now decide, deliberately, which clients get it.
- Is it **context you want available**? Resource. Give it a URI and stop making the model ask permission to know things.
- Is it **phrasing you keep rewriting in every client** that talks to this domain? Prompt. Ship it from the server.

The failure mode of ignoring all this is not that your server breaks. It is that everything becomes a tool, every piece of context costs a reasoning step, every client reinvents the same prompt slightly differently, and the permission surface is simply "all of it" — because nobody ever drew the line where the boundaries already were.

If you want the wider tour — transports, why I build these in Go, how MCP fits an agent stack — I wrote that up earlier in [Notes on MCP (and why I'm building with Go)](/articles/notes-on-mcp-and-why-i-m-building-with-go).

---

I gave a talk on this — *Building Production-Ready MCP Servers for AI Applications and Agents* — to the [Nigerian Gophers Meetup](/speaking/production-ready-mcp-servers) on 22 August 2026. The demo server is Go, the agents are Google ADK, and the whole thing is on [GitHub](https://github.com/TheGh0xt/meetup-ops-mcp): tools, resources, prompts, two agents with two blast radii, and a test suite that drives the real protocol with no network.
