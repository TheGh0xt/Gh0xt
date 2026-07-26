import { useState, useEffect, useRef } from "react";
import { getSessionId } from "../utils/session";

interface Comment {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface Props {
  postId: string;
}

const MAX_CONTENT = 1000;

export default function BlogComments({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    content: "",
    website: "", // honeypot
  });

  // Captured on mount so the server can reject instant submissions.
  const renderedAt = useRef(Date.now());

  useEffect(() => {
    fetch(`/api/comments?postId=${encodeURIComponent(postId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setComments(data?.comments ?? []))
      .catch(() => {
        /* comments are non-critical; leave the list empty */
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          ...form,
          renderedAt: renderedAt.current,
          sessionId: getSessionId(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "Submitted. It'll appear once approved.",
        });
        setForm({ name: "", email: "", content: "", website: "" });
        setShowForm(false);
      } else {
        setMessage({
          type: "error",
          text: data.error ?? "Failed to submit comment",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Failed to submit comment. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const field =
    "w-full px-3 py-2 bg-transparent border border-line focus:border-accent focus:outline-none text-fg text-sm transition-colors placeholder:text-muted/60";

  return (
    <section className="mt-16 pt-8 border-t border-line">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted">
          Comments{comments.length > 0 && ` (${comments.length})`}
        </h2>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-accent hover:opacity-80 transition-opacity"
          >
            + leave a comment
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-8 p-3 border text-sm ${
            message.type === "success"
              ? "border-accent/40 text-accent"
              : "border-red-500/40 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-12 space-y-4">
          {/* Honeypot — hidden from real users, tempting to bots. */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-[10px] uppercase tracking-widest text-muted mb-2"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                required
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={field}
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[10px] uppercase tracking-widest text-muted mb-2"
              >
                Email (optional)
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={field}
                placeholder="Never shown publicly"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-[10px] uppercase tracking-widest text-muted mb-2"
            >
              Comment *
            </label>
            <textarea
              id="content"
              required
              maxLength={MAX_CONTENT}
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`${field} resize-none`}
              placeholder="Share your thoughts..."
            />
            <div className="mt-1.5 text-right text-[10px] text-muted tabular-nums">
              {form.content.length}/{MAX_CONTENT}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 border border-accent text-accent text-xs hover:bg-accent hover:text-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "submitting..." : "post comment"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-line text-muted text-xs hover:border-fg/30 transition-colors"
            >
              cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-20 bg-line/50 animate-pulse" />
          <div className="h-20 bg-line/50 animate-pulse" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted">
          No comments yet. Be the first to say something.
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <article key={comment._id} className="py-4 border-b border-line">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h3 className="text-sm text-fg">{comment.name}</h3>
                <time className="text-xs text-muted shrink-0">
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
