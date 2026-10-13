import Link from 'next/link';
import { FaEye } from 'react-icons/fa6';
import type { CardProfile } from '@/lib/types';
import { withAlpha } from '@/lib/utils';

export default function ProfileCard({ profile: p }: { profile: CardProfile }) {
  const name = p.display_name || p.username;
  return (
    <Link
      href={`/${p.username}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl hover:shadow-black/40"
    >
      <div
        className="h-20 bg-cover bg-center"
        style={{
          backgroundColor: p.bg_color,
          backgroundImage: p.background_url
            ? `url(${p.background_url})`
            : `radial-gradient(80% 120% at 50% 0%, ${withAlpha(p.accent_color, 0.5)}, transparent)`,
        }}
      />
      <div className="-mt-9 px-5 pb-5">
        <div className="h-[72px] w-[72px] overflow-hidden rounded-full border-4 border-ink-900" style={{ boxShadow: `0 0 0 2px ${withAlpha(p.accent_color, 0.7)}` }}>
          {p.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar_url} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: p.accent_color }}>
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="mt-3 truncate font-semibold text-white">{name}</h3>
        <p className="truncate text-xs text-zinc-500">@{p.username}</p>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-zinc-400">{p.bio || 'No bio yet.'}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500">
          <FaEye aria-hidden /> {p.views.toLocaleString('en-US')}
        </p>
      </div>
    </Link>
  );
}
