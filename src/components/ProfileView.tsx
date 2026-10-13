'use client';

import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaCopy, FaEye, FaPause, FaPlay, FaShareNodes, FaVolumeHigh } from 'react-icons/fa6';
import { FONTS, PLATFORM_LABELS } from '@/lib/constants';
import type { Profile } from '@/lib/types';
import type { LinkItem } from '@/lib/types';
import { cn, withAlpha } from '@/lib/utils';
import Particles from './Particles';
import PlatformIcon from './PlatformIcon';
import ReportButton from './ReportButton';

export type ViewProfile = Pick<
  Profile,
  | 'username'
  | 'display_name'
  | 'bio'
  | 'status'
  | 'avatar_url'
  | 'background_url'
  | 'music_url'
  | 'accent_color'
  | 'bg_color'
  | 'text_color'
  | 'font'
  | 'effect_animation'
  | 'effect_glow'
  | 'effect_particles'
  | 'effect_blur'
  | 'views'
>;

type Props = {
  profile: ViewProfile;
  links: Array<Pick<LinkItem, 'platform' | 'label' | 'url'>>;
  /** true = ingebed (editor/homepage): geen overlay, geen teller, geen rapporteren */
  preview?: boolean;
  /** true = bezoeker is de eigenaar: bezoek niet meetellen */
  isOwner?: boolean;
  notice?: string;
};

export default function ProfileView({ profile: p, links, preview = false, isOwner = false, notice }: Props) {
  const name = p.display_name || p.username;
  const accent = p.accent_color;
  const hasMusic = !!p.music_url;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [entered, setEntered] = useState(preview || !hasMusic);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [copied, setCopied] = useState<'info' | 'link' | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => setCanShare(typeof navigator !== 'undefined' && !!navigator.share), []);
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Bezoek tellen (eenmaal per sessie, niet voor de eigenaar)
  useEffect(() => {
    if (preview || isOwner) return;
    const key = `astro:viewed:${p.username}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* sessionStorage kan geblokkeerd zijn */
    }
    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: p.username }),
      keepalive: true,
    }).catch(() => {});
  }, [preview, isOwner, p.username]);

  const profileUrl = () => `${window.location.origin}/${p.username}`;

  const flash = (what: 'info' | 'link') => {
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  };

  const copyInfo = async () => {
    const lines = [`${name} (@${p.username})`, p.status, p.bio, '', profileUrl(), ...links.map((l) => `${l.label || PLATFORM_LABELS[l.platform]}: ${l.url}`)];
    try {
      await navigator.clipboard.writeText(lines.filter((l) => l !== null && l !== undefined).join('\n'));
      flash('info');
    } catch {
      /* clipboard geweigerd */
    }
  };

  const share = async () => {
    const url = profileUrl();
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} on Astro.lol`, text: p.bio ?? undefined, url });
      } else {
        await navigator.clipboard.writeText(url);
        flash('link');
      }
    } catch {
      /* gebruiker heeft delen geannuleerd */
    }
  };

  const enter = () => {
    setEntered(true);
    audioRef.current?.play().catch(() => {});
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  const bgLayer = p.background_url
    ? `linear-gradient(180deg, ${withAlpha(p.bg_color, 0.55)}, ${withAlpha(p.bg_color, 0.8)})`
    : `radial-gradient(70% 55% at 50% 0%, ${withAlpha(accent, 0.22)}, transparent 70%), radial-gradient(50% 40% at 90% 100%, ${withAlpha(accent, 0.12)}, transparent 70%)`;

  return (
    <div
      className={cn(
        'relative isolate flex w-full justify-center overflow-hidden',
        preview ? 'min-h-full items-center py-10' : 'min-h-screen items-center px-4 py-14',
      )}
      style={{ backgroundColor: p.bg_color, color: p.text_color, fontFamily: FONTS[p.font]?.css ?? FONTS.sans.css }}
    >
      {p.background_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.background_url} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 -z-10" style={{ background: bgLayer }} />
      {p.effect_particles && <Particles color={accent} />}

      {/* Click to enter (alleen als er muziek is) */}
      {!entered && (
        <button
          onClick={enter}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-md"
          aria-label="Click to enter"
        >
          <span className="animate-pulse text-sm tracking-[0.3em] uppercase opacity-80">click to enter</span>
        </button>
      )}

      <main
        className={cn(
          'relative w-full max-w-md rounded-3xl border p-7 text-center',
          p.effect_blur ? 'backdrop-blur-xl' : '',
          p.effect_animation && entered ? 'animate-fade-up' : '',
        )}
        style={{
          backgroundColor: withAlpha('#000000', p.effect_blur ? 0.38 : 0.62),
          borderColor: withAlpha(accent, 0.28),
          boxShadow: p.effect_glow
            ? `0 0 70px -12px ${withAlpha(accent, 0.55)}, 0 20px 50px -20px rgba(0,0,0,.8)`
            : '0 20px 50px -20px rgba(0,0,0,.8)',
        }}
      >
        {notice && (
          <p className="mb-4 rounded-lg bg-white/10 px-3 py-1.5 text-xs opacity-90">{notice}</p>
        )}

        {/* Avatar */}
        <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full" style={{ boxShadow: `0 0 0 3px ${withAlpha(accent, 0.8)}, 0 0 30px ${withAlpha(accent, p.effect_glow ? 0.5 : 0)}` }}>
          {p.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar_url} alt={`${name}'s avatar`} className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-4xl font-bold"
              style={{ background: `linear-gradient(135deg, ${accent}, ${withAlpha(accent, 0.35)})`, color: '#fff' }}
            >
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight" style={p.effect_glow ? { textShadow: `0 0 24px ${withAlpha(accent, 0.6)}` } : undefined}>
          {name}
        </h1>
        <p className="text-sm opacity-60">@{p.username}</p>

        {p.status && (
          <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: accent }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
            </span>
            <span className="truncate">{p.status}</span>
          </p>
        )}

        {p.bio && <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed opacity-85">{p.bio}</p>}

        {/* Links */}
        {links.length > 0 && (
          <ul className="mt-6 space-y-2.5">
            {links.map((l, i) => (
              <li
                key={`${l.platform}-${i}`}
                className={p.effect_animation && entered ? 'animate-fade-up' : ''}
                style={p.effect_animation ? { animationDelay: `${120 + i * 70}ms` } : undefined}
              >
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className="group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition duration-200 hover:-translate-y-0.5"
                  style={{ borderColor: withAlpha(accent, 0.25), backgroundColor: withAlpha(accent, 0.08) }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = withAlpha(accent, 0.2);
                    e.currentTarget.style.borderColor = withAlpha(accent, 0.6);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = withAlpha(accent, 0.08);
                    e.currentTarget.style.borderColor = withAlpha(accent, 0.25);
                  }}
                >
                  <PlatformIcon platform={l.platform} className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{l.label || PLATFORM_LABELS[l.platform]}</span>
                  <span className="opacity-0 transition group-hover:opacity-70" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Muziekspeler */}
        {hasMusic && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5">
            <audio ref={audioRef} src={p.music_url ?? undefined} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:scale-105"
              style={{ backgroundColor: accent }}
              aria-label={playing ? 'Pause music' : 'Play music'}
            >
              {playing ? <FaPause className="h-3.5 w-3.5" /> : <FaPlay className="ml-0.5 h-3.5 w-3.5" />}
            </button>
            <FaVolumeHigh className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-full cursor-pointer"
              style={{ accentColor: accent }}
              aria-label="Volume"
            />
          </div>
        )}

        {/* Acties */}
        <div className="mt-6 flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 opacity-70" title="Profile views">
            <FaEye aria-hidden /> {p.views.toLocaleString('en-US')}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={copyInfo} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 transition hover:bg-white/20">
              {copied === 'info' ? <FaCheck aria-hidden /> : <FaCopy aria-hidden />}
              {copied === 'info' ? 'Copied' : 'Copy'}
            </button>
            <button onClick={share} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 transition hover:bg-white/20">
              {copied === 'link' ? <FaCheck aria-hidden /> : <FaShareNodes aria-hidden />}
              {copied === 'link' ? 'Link copied' : canShare ? 'Share' : 'Copy link'}
            </button>
            {!preview && !isOwner && <ReportButton username={p.username} />}
          </div>
        </div>

        {!preview && (
          <a href="/" className="mt-6 inline-block text-[11px] tracking-wider uppercase opacity-40 transition hover:opacity-80">
            astro.lol
          </a>
        )}
      </main>
    </div>
  );
}
