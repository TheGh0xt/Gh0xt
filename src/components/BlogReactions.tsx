import { useState, useEffect } from "react";
import { REACTIONS, REACTION_LABELS } from "../utils/reactions";
import { getSessionId } from "../utils/session";

interface Props {
  postId: string;
}

type Counts = Record<string, number>;

export default function BlogReactions({ postId }: Props) {
  const [counts, setCounts] = useState<Counts>({});
  const [mine, setMine] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);

    fetch(`/api/reactions?postId=${encodeURIComponent(postId)}&sessionId=${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCounts(data.counts ?? {});
          setMine(data.mine ?? []);
        }
      })
      .catch(() => {
        /* reactions are non-critical; leave them empty */
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const toggle = async (emoji: string) => {
    if (!sessionId) return;

    const adding = !mine.includes(emoji);
    const previousCounts = counts;
    const previousMine = mine;

    // Optimistic update
    setMine(adding ? [...mine, emoji] : mine.filter((e) => e !== emoji));
    setCounts({
      ...counts,
      [emoji]: Math.max(0, (counts[emoji] ?? 0) + (adding ? 1 : -1)),
    });

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, emoji, sessionId }),
      });

      if (!res.ok) throw new Error("request failed");

      const data = await res.json();
      setCounts(data.counts ?? {});
      setMine(data.mine ?? []);
    } catch {
      setCounts(previousCounts);
      setMine(previousMine);
    }
  };

  if (loading) {
    return <div className="h-9 w-56 bg-line/50 animate-pulse my-8" />;
  }

  return (
    <div className="flex flex-wrap gap-2 my-8">
      {REACTIONS.map((emoji) => {
        const active = mine.includes(emoji);

        return (
          <button
            key={emoji}
            onClick={() => toggle(emoji)}
            aria-pressed={active}
            title={REACTION_LABELS[emoji]}
            className={`flex items-center gap-2 px-3 py-1.5 border transition-colors ${
              active
                ? "border-accent text-accent"
                : "border-line text-muted hover:border-accent/40"
            }`}
          >
            <span className="text-base">{emoji}</span>
            <span className="text-xs tabular-nums">{counts[emoji] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
