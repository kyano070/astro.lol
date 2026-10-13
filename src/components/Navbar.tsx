import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/server';
import Logo from './Logo';

export default async function Navbar() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link href="/explore" className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white">
            Explore
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost !px-4 !py-2">
                Dashboard
              </Link>
              <form action={logout}>
                <button className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white">
                Log in
              </Link>
              <Link href="/register" className="btn-primary !px-4 !py-2">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
