import type { Metadata } from 'next';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import ExploreGrid from '@/components/ExploreGrid';
import { searchProfiles } from '@/lib/profiles';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Explore profiles' };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').slice(0, 40);
  const { profiles, hasMore } = await searchProfiles(await createClient(), q, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">Explore profiles</h1>
        <p className="mt-2 text-zinc-400">Discover people and the pages they’ve made.</p>

        <form action="/explore" className="relative mt-6" role="search">
          <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden />
          <input
            name="q"
            defaultValue={q}
            maxLength={40}
            placeholder="Search by username…"
            aria-label="Search by username"
            className="input !rounded-2xl !py-3.5 !pl-11 !pr-28 text-base"
          />
          <button className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 !px-4 !py-2">Search</button>
        </form>
      </div>

      {/* key: reset de lijst als de zoekterm verandert */}
      <ExploreGrid key={q} initial={profiles} initialHasMore={hasMore} q={q} />
    </main>
  );
}
