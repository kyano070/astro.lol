'use client';

import { useState } from 'react';
import type { CardProfile } from '@/lib/types';
import ProfileCard from './ProfileCard';

type Props = { initial: CardProfile[]; initialHasMore: boolean; q: string };

export default function ExploreGrid({ initial, initialHasMore, q }: Props) {
  const [profiles, setProfiles] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMore = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/explore?q=${encodeURIComponent(q)}&offset=${profiles.length}`);
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { profiles: CardProfile[]; hasMore: boolean };
      setProfiles((prev) => [...prev, ...json.profiles.filter((n) => !prev.some((p) => p.username === n.username))]);
      setHasMore(json.hasMore);
    } catch {
      setError('Could not load more profiles.');
    } finally {
      setLoading(false);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="panel mx-auto max-w-md text-center">
        <p className="font-medium text-white">No profiles found</p>
        <p className="mt-1 text-sm text-zinc-400">{q ? `Nothing matches “${q}”. Try another username.` : 'Be the first to create one!'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {profiles.map((p) => (
          <ProfileCard key={p.username} profile={p} />
        ))}
      </div>
      {error && <p className="mt-6 text-center text-sm text-rose-400">{error}</p>}
      {hasMore && (
        <div className="mt-10 text-center">
          <button onClick={loadMore} disabled={loading} className="btn-ghost !px-8">
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  );
}
