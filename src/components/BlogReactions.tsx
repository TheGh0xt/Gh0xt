import { useState, useEffect } from 'react';

const REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '💡', label: 'Insightful' },
];

interface BlogReactionsProps {
  postId: string;
}

export default function BlogReactions({ postId }: BlogReactionsProps) {
  console.log('BlogReactions initializing for post:', postId);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [userReactions, setUserReactions] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Get or create session ID
    let sId = localStorage.getItem('blog_session_id');
    if (!sId) {
      sId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('blog_session_id', sId);
    }
    setSessionId(sId);

    fetchReactions(sId);
  }, [postId]);

  const fetchReactions = async (currentSessionId: string) => {
    try {
      const response = await fetch(`/api/reactions?postId=${postId}`);
      const data = await response.json();
      setCounts(data.counts || {});
      
      // Check which reactions belong to this session
      const userHasReacted: { [key: string]: boolean } = {};
      data.reactions?.forEach((r: any) => {
        if (r.sessionId === currentSessionId) {
          userHasReacted[r.emoji] = true;
        }
      });
      setUserReactions(userHasReacted);
    } catch (error) {
      console.error('Failed to fetch reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (emoji: string) => {
    if (!sessionId) return;

    // Optimistic UI update
    const isAdding = !userReactions[emoji];
    setUserReactions(prev => ({ ...prev, [emoji]: isAdding }));
    setCounts(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + (isAdding ? 1 : -1)
    }));

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, emoji, sessionId }),
      });

      if (!response.ok) {
        // Rollback on error
        setUserReactions(prev => ({ ...prev, [emoji]: !isAdding }));
        setCounts(prev => ({
          ...prev,
          [emoji]: (prev[emoji] || 0) + (isAdding ? -1 : 1)
        }));
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      // Rollback on error
      setUserReactions(prev => ({ ...prev, [emoji]: !isAdding }));
      setCounts(prev => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + (isAdding ? -1 : 1)
      }));
    }
  };

  if (loading) return <div className="h-10 animate-pulse bg-white/5 rounded-full w-64" />;

  return (
    <div className="flex flex-wrap gap-2 my-8">
      {REACTIONS.map(({ emoji, label }) => (
        <button
          key={emoji}
          onClick={() => handleToggle(emoji)}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
            userReactions[emoji]
              ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
          }`}
          title={label}
        >
          <span className="text-lg transition-transform group-hover:scale-110">{emoji}</span>
          <span className="text-sm font-medium">{counts[emoji] || 0}</span>
        </button>
      ))}
    </div>
  );
}
