import Link from 'next/link';

export default function ProfileNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm tracking-[0.3em] text-astro-soft uppercase">404</p>
      <h1 className="mt-3 text-3xl font-bold text-white">This profile doesn’t exist</h1>
      <p className="mt-2 max-w-sm text-zinc-400">It may be private, renamed or never claimed. Maybe it’s yours?</p>
      <div className="mt-6 flex gap-3">
        <Link href="/register" className="btn-primary">Claim a username</Link>
        <Link href="/explore" className="btn-ghost">Explore profiles</Link>
      </div>
    </main>
  );
}
