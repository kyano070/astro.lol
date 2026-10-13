'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaEarthAmericas,
  FaGripVertical,
  FaLock,
  FaPlus,
  FaTrash,
  FaUpload,
} from 'react-icons/fa6';
import { saveProfile } from '@/app/actions/profile';
import {
  FONT_IDS,
  FONTS,
  MAX_LINKS,
  PLATFORM_IDS,
  PLATFORM_LABELS,
  THEME_IDS,
  THEMES,
  type FontId,
  type Platform,
  type ThemeId,
} from '@/lib/constants';
import type { LinkItem, Profile } from '@/lib/types';
import { cn } from '@/lib/utils';
import ProfileView from './ProfileView';

type EditorLink = { key: string; platform: Platform; label: string; url: string };

type Form = {
  username: string;
  display_name: string;
  bio: string;
  status: string;
  avatar_url: string | null;
  background_url: string | null;
  music_url: string;
  accent_color: string;
  bg_color: string;
  text_color: string;
  font: FontId;
  theme: ThemeId;
  effect_animation: boolean;
  effect_glow: boolean;
  effect_particles: boolean;
  effect_blur: boolean;
  is_public: boolean;
};

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-ink-800/60 px-4 py-3 text-left transition hover:border-white/20"
    >
      <span>
        <span className="block text-sm font-medium text-zinc-100">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
      <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-astro' : 'bg-zinc-700')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </span>
    </button>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-800/80 p-1.5">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
        <span className="font-mono text-xs text-zinc-400">{value}</span>
      </span>
    </label>
  );
}

async function upload(kind: 'avatar' | 'background' | 'music', file: File): Promise<string> {
  const body = new FormData();
  body.set('kind', kind);
  body.set('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? 'Upload failed.');
  return json.url as string;
}

export default function Editor({ profile, links }: { profile: Profile; links: LinkItem[] }) {
  const [form, setForm] = useState<Form>({
    username: profile.username,
    display_name: profile.display_name ?? '',
    bio: profile.bio ?? '',
    status: profile.status ?? '',
    avatar_url: profile.avatar_url,
    background_url: profile.background_url,
    music_url: profile.music_url ?? '',
    accent_color: profile.accent_color,
    bg_color: profile.bg_color,
    text_color: profile.text_color,
    font: profile.font,
    theme: (THEME_IDS as readonly string[]).includes(profile.theme) ? (profile.theme as ThemeId) : 'midnight',
    effect_animation: profile.effect_animation,
    effect_glow: profile.effect_glow,
    effect_particles: profile.effect_particles,
    effect_blur: profile.effect_blur,
    is_public: profile.is_public,
  });
  const [items, setItems] = useState<EditorLink[]>(
    links.map((l) => ({ key: l.id, platform: l.platform, label: l.label, url: l.url })),
  );
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dragIndex = useRef<number | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const applyTheme = (id: ThemeId) => {
    const t = THEMES[id];
    setForm((f) => ({ ...f, theme: id, bg_color: t.bg, accent_color: t.accent, text_color: t.text }));
  };

  const handleUpload = async (kind: 'avatar' | 'background' | 'music', file: File | undefined) => {
    if (!file) return;
    setBusy(kind);
    setMessage(null);
    try {
      const url = await upload(kind, file);
      if (kind === 'avatar') set('avatar_url', url);
      if (kind === 'background') set('background_url', url);
      if (kind === 'music') set('music_url', url);
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Upload failed.' });
    } finally {
      setBusy(null);
    }
  };

  // --- links ---
  const addLink = () =>
    setItems((l) => (l.length >= MAX_LINKS ? l : [...l, { key: crypto.randomUUID(), platform: 'discord', label: '', url: '' }]));
  const updateLink = (i: number, patch: Partial<EditorLink>) => setItems((l) => l.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removeLink = (i: number) => setItems((l) => l.filter((_, idx) => idx !== i));
  const moveLink = (from: number, to: number) =>
    setItems((l) => {
      if (to < 0 || to >= l.length || from === to) return l;
      const copy = [...l];
      const [m] = copy.splice(from, 1);
      copy.splice(to, 0, m);
      return copy;
    });

  const save = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProfile({
        ...form,
        links: items.map(({ platform, label, url }) => ({ platform, label, url })),
      });
      setMessage(result.ok ? { type: 'ok', text: 'Saved! Your profile is up to date.' } : { type: 'error', text: result.error });
    });
  };

  // Live preview-data (alleen geldige links tonen)
  const previewProfile = useMemo(
    () => ({
      username: form.username || profile.username,
      display_name: form.display_name || null,
      bio: form.bio || null,
      status: form.status || null,
      avatar_url: form.avatar_url,
      background_url: form.background_url,
      music_url: form.music_url || null,
      accent_color: form.accent_color,
      bg_color: form.bg_color,
      text_color: form.text_color,
      font: form.font,
      effect_animation: form.effect_animation,
      effect_glow: form.effect_glow,
      effect_particles: form.effect_particles,
      effect_blur: form.effect_blur,
      views: profile.views,
    }),
    [form, profile.username, profile.views],
  );
  const previewLinks = items.filter((l) => /^https?:\/\//i.test(l.url));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <a href={`/${profile.username}`} target="_blank" rel="noopener" className="text-sm text-astro-soft hover:underline">
            astro.lol/{profile.username} ↗
          </a>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <p role="status" className={cn('text-sm', message.type === 'ok' ? 'text-emerald-400' : 'text-rose-400')}>
              {message.text}
            </p>
          )}
          <button onClick={save} disabled={pending || busy !== null} className="btn-primary">
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Mobiel: wisselen tussen bewerken en preview */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-ink-900 p-1 lg:hidden">
        {(['edit', 'preview'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('rounded-lg py-2 text-sm font-medium capitalize transition', tab === t ? 'bg-astro text-white' : 'text-zinc-400')}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* ---------- Formulier ---------- */}
        <div className={cn('space-y-6', tab === 'preview' && 'hidden lg:block lg:space-y-6')}>
          {/* Profiel */}
          <section className="panel space-y-5">
            <h2 className="font-semibold text-white">Profile</h2>

            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/10 bg-ink-700">
                {form.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="btn-ghost cursor-pointer !py-2">
                  <FaUpload /> {busy === 'avatar' ? 'Uploading…' : 'Change avatar'}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => { handleUpload('avatar', e.target.files?.[0]); e.target.value = ''; }} />
                </label>
                {form.avatar_url && (
                  <button className="btn-ghost !py-2" onClick={() => set('avatar_url', null)}>Remove</button>
                )}
              </div>
              <p className="hidden text-xs text-zinc-500 sm:block">PNG, JPG, WebP or GIF · max 3 MB</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="username">Username</label>
                <div className="flex items-center rounded-xl border border-white/10 bg-ink-800/80 focus-within:border-astro-soft/60 focus-within:ring-2 focus-within:ring-astro/20">
                  <span className="pl-3.5 text-sm text-zinc-500">astro.lol/</span>
                  <input id="username" value={form.username} maxLength={20} onChange={(e) => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="w-full bg-transparent px-1.5 py-2.5 text-sm text-zinc-100 outline-none" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="display_name">Display name</label>
                <input id="display_name" className="input" maxLength={40} value={form.display_name} onChange={(e) => set('display_name', e.target.value)} placeholder="How should we call you?" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="status">Status</label>
              <input id="status" className="input" maxLength={80} value={form.status} onChange={(e) => set('status', e.target.value)} placeholder="Online · Streaming tonight · Away" />
            </div>

            <div>
              <label className="label" htmlFor="bio">Bio <span className="normal-case text-zinc-600">({form.bio.length}/300)</span></label>
              <textarea id="bio" className="input min-h-28 resize-y" maxLength={300} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Tell the world who you are." />
            </div>
          </section>

          {/* Links */}
          <section className="panel space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Links <span className="text-sm font-normal text-zinc-500">({items.length}/{MAX_LINKS})</span></h2>
              <button onClick={addLink} disabled={items.length >= MAX_LINKS} className="btn-ghost !py-2"><FaPlus /> Add link</button>
            </div>

            {items.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">No links yet. Add your Discord, YouTube, Twitch, GitHub or Instagram.</p>}

            <ul className="space-y-3">
              {items.map((l, i) => (
                <li
                  key={l.key}
                  draggable
                  onDragStart={() => (dragIndex.current = i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex.current !== null) moveLink(dragIndex.current, i);
                    dragIndex.current = null;
                  }}
                  className="flex gap-2 rounded-xl border border-white/10 bg-ink-800/60 p-3"
                >
                  <span className="mt-2.5 hidden cursor-grab text-zinc-600 sm:block" aria-hidden><FaGripVertical /></span>
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[140px_1fr]">
                    <select aria-label="Platform" className="input" value={l.platform} onChange={(e) => updateLink(i, { platform: e.target.value as Platform })}>
                      {PLATFORM_IDS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
                    </select>
                    <input aria-label="Label" className="input" maxLength={40} placeholder={`Label (default: ${PLATFORM_LABELS[l.platform]})`} value={l.label} onChange={(e) => updateLink(i, { label: e.target.value })} />
                    <input aria-label="URL" className="input sm:col-span-2" type="url" maxLength={500} placeholder="https://…" value={l.url} onChange={(e) => updateLink(i, { url: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <button aria-label="Move up" disabled={i === 0} onClick={() => moveLink(i, i - 1)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30"><FaArrowUp /></button>
                    <button aria-label="Move down" disabled={i === items.length - 1} onClick={() => moveLink(i, i + 1)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30"><FaArrowDown /></button>
                    <button aria-label="Delete link" onClick={() => removeLink(i)} className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"><FaTrash /></button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Uiterlijk */}
          <section className="panel space-y-5">
            <h2 className="font-semibold text-white">Appearance</h2>

            <div>
              <span className="label">Theme</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {THEME_IDS.map((id) => (
                  <button
                    key={id}
                    onClick={() => applyTheme(id)}
                    className={cn('flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition', form.theme === id ? 'border-astro-soft bg-astro/10 text-white' : 'border-white/10 text-zinc-300 hover:border-white/25')}
                  >
                    <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: `linear-gradient(135deg, ${THEMES[id].bg} 50%, ${THEMES[id].accent} 50%)` }} />
                    {THEMES[id].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ColorField label="Accent" value={form.accent_color} onChange={(v) => set('accent_color', v)} />
              <ColorField label="Background" value={form.bg_color} onChange={(v) => set('bg_color', v)} />
              <ColorField label="Text" value={form.text_color} onChange={(v) => set('text_color', v)} />
            </div>

            <div>
              <span className="label">Font</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {FONT_IDS.map((id) => (
                  <button key={id} onClick={() => set('font', id)} style={{ fontFamily: FONTS[id].css }} className={cn('rounded-xl border px-3 py-2.5 text-sm transition', form.font === id ? 'border-astro-soft bg-astro/10 text-white' : 'border-white/10 text-zinc-300 hover:border-white/25')}>
                    {FONTS[id].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="label">Background image</span>
              <div className="flex flex-wrap items-center gap-2">
                <label className="btn-ghost cursor-pointer !py-2">
                  <FaUpload /> {busy === 'background' ? 'Uploading…' : 'Upload background'}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => { handleUpload('background', e.target.files?.[0]); e.target.value = ''; }} />
                </label>
                {form.background_url && <button className="btn-ghost !py-2" onClick={() => set('background_url', null)}>Remove</button>}
                <span className="text-xs text-zinc-500">max 8 MB</span>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="music">Music (optional)</label>
              <div className="flex flex-wrap gap-2">
                <input id="music" type="url" className="input min-w-0 flex-1" placeholder="https://…/track.mp3" maxLength={500} value={form.music_url} onChange={(e) => set('music_url', e.target.value)} />
                <label className="btn-ghost cursor-pointer !py-2">
                  <FaUpload /> {busy === 'music' ? 'Uploading…' : 'Upload'}
                  <input type="file" accept="audio/mpeg,audio/ogg,audio/wav" className="sr-only" onChange={(e) => { handleUpload('music', e.target.files?.[0]); e.target.value = ''; }} />
                </label>
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">MP3, OGG or WAV · max 10 MB. Visitors start it with “click to enter”.</p>
            </div>
          </section>

          {/* Effecten + privacy */}
          <section className="panel space-y-3">
            <h2 className="mb-1 font-semibold text-white">Effects & privacy</h2>
            <Toggle checked={form.effect_animation} onChange={(v) => set('effect_animation', v)} label="Entrance animations" hint="Fade-in for the card and links" />
            <Toggle checked={form.effect_glow} onChange={(v) => set('effect_glow', v)} label="Glow" hint="Soft accent glow around the card and avatar" />
            <Toggle checked={form.effect_particles} onChange={(v) => set('effect_particles', v)} label="Floating particles" hint="Subtle stars drifting in the background" />
            <Toggle checked={form.effect_blur} onChange={(v) => set('effect_blur', v)} label="Glass blur" hint="Frosted-glass effect behind the card" />
            <div className="pt-2">
              <Toggle checked={form.is_public} onChange={(v) => set('is_public', v)} label={form.is_public ? 'Public profile' : 'Private profile'} hint={form.is_public ? 'Anyone with the link can see it, and it shows up in Explore' : 'Only you can see it'} />
              <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">{form.is_public ? <FaEarthAmericas /> : <FaLock />} {form.is_public ? 'Visible on Explore' : 'Hidden from Explore and search'}</p>
            </div>
          </section>
        </div>

        {/* ---------- Live preview ---------- */}
        <aside className={cn('lg:block', tab === 'edit' && 'hidden')}>
          <div className="sticky top-24">
            <p className="label">Live preview</p>
            <div className="h-[calc(100vh-10rem)] min-h-[560px] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl shadow-black/50">
              <ProfileView profile={previewProfile} links={previewLinks} preview />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
