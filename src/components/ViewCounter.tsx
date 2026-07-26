import { useEffect, useState } from "react";

interface Props {
  postId: string;
  initialCount?: number;
}

export default function ViewCounter({ postId, initialCount = 0 }: Props) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const key = `viewed:${postId}`;

    let alreadyViewed = false;
    try {
      alreadyViewed = localStorage.getItem(key) === "1";
    } catch {
      // localStorage unavailable — fall through and count the view.
    }

    if (alreadyViewed) return;

    // Fire-and-forget. A failed count must never affect the article.
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.viewCount === "number") setCount(data.viewCount);
        try {
          localStorage.setItem(key, "1");
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, [postId]);

  if (count <= 0) return null;

  return (
    <span className="text-xs text-muted">
      {count.toLocaleString()} {count === 1 ? "view" : "views"}
    </span>
  );
}
