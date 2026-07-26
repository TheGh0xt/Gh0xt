import { useState, useEffect } from 'react';

interface Comment {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface BlogCommentsProps {
  postId: string;
}

export default function BlogComments({ postId }: BlogCommentsProps) {
  console.log('BlogComments initializing for post:', postId);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, ...formData }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Comment submitted! It will appear after approval.'
        });
        setFormData({ name: '', email: '', content: '' });
        setShowForm(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit comment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit comment. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-16 pt-8 border-t border-white/10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white">
          Comments {comments.length > 0 && <span className="text-white/40 text-lg ml-2">({comments.length})</span>}
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 text-sm font-medium"
          >
            Leave a comment
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-8 p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-500/5 border-green-500/20 text-green-400'
              : 'bg-red-500/5 border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-12 p-8 bg-white/5 border border-white/10 rounded-2xl relative">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            aria-label="Close form"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/60 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white transition-colors placeholder:text-white/20"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-2">
                  Email <span className="text-white/20 text-xs">(optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white transition-colors placeholder:text-white/20"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-white/60 mb-2">
                Comment <span className="text-red-400">*</span>
              </label>
              <textarea
                id="content"
                required
                maxLength={1000}
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white transition-colors placeholder:text-white/20 resize-none"
                placeholder="Share your thoughts..."
              />
              <div className="flex justify-end mt-2">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">
                  {formData.content.length}/1000 characters
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 p-8 bg-white/5 border border-dashed border-white/10 rounded-2xl">
          <p className="text-white/40 italic">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{comment.name}</h4>
                <time className="text-xs text-white/30 uppercase tracking-widest font-medium">
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
