import Link from 'next/link';
import {
  FaBolt,
  FaChartLine,
  FaImage,
  FaMusic,
  FaPalette,
  FaShieldHalved,
} from 'react-icons/fa6';
import ProfileView, { type ViewProfile } from '@/components/ProfileView';

const base: ViewProfile = {
  username: 'nova',
  display_name: 'Nova',
  bio: null,
  status: null,
  avatar_url: null,
  background_url: null,
  music_url: null,
  accent_color: '#8b5cf6',
  bg_color: '#07070d',
  text_color: '#f4f4f8',
  font: 'sans',
  effect_animation: false,
  effect_glow: true,
  effect_particles: true,
  effect_blur: true,
  views: 12480,
};

const demos: Array<{ profile: ViewProfile; links: Array<{ platform: 'discord' | 'twitch' | 'github' | 'youtube' | 'instagram' | 'spotify'; label: string; url: string }> }> = [
  {
    profile: { ...base, bio: 'Night owl. Streams, synths & stardust.', status: 'Live from the void ✦' },
    links: [
      { platform: 'twitch', label: 'Twitch', url: 'https://twitch.tv' },
      { platform: 'discord', label: 'Join the server', url: 'https://discord.com' },
    ],
  },
  {
    profile: {
      ...base,
      username: 'kairo',
      display_name: 'Kairo',
      bio: 'Building tiny tools for big ideas.',
      status: 'Shipping on Fridays',
      accent_color: '#3b82f6',
      bg_color: '#050b18',
      text_color: '#eaf2ff',
      font: 'mono',
      views: 8230,
    },
    links: [
      { platform: 'github', label: 'GitHub', url: 'https://github.com' },
      { platform: 'youtube', label: 'Dev diaries', url: 'https://youtube.com' },
    ],
  },
  {
    profile: {
      ...base,
      username: 'luma',
      display_name: 'Luma',
      bio: 'Photos, playlists and pastel skies.',
      status: 'Listening to lo-fi',
      accent_color: '#f43f5e',
      bg_color: '#0d0707',
      text_color: '#fff1f2',
      font: 'rounded',
      views: 5107,
    },
    links: [
      { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com' },
      { platform: 'spotify', label: 'My playlists', url: 'https://spotify.com' },
    ],
  },
];

const features = [
  { icon: FaPalette, title: 'Make it yours', text: 'Themes, accent colors, fonts and glow. Your page, your vibe.' },
  { icon: FaImage, title: 'Backgrounds & avatars', text: 'Upload your own images and set the mood in seconds.' },
  { icon: FaMusic, title: 'Built-in music player', text: 'Add a track and let visitors press “click to enter”.' },
  { icon: FaBolt, title: 'Live preview editor', text: 'See every change instantly while you build your profile.' },
  { icon: FaChartLine, title: 'Visitor counter', text: 'Know how many people stopped by your corner of the web.' },
  { icon: FaShieldHalved, title: 'Safe by default', text: 'Server-side validation, row-level security and private mode.' },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(139,92,246,0.25),transparent_70%),radial-gradient(40%_40%_at_85%_20%,rgba(96,165,250,0.12),transparent_70%)]" />
        <div className="mx-auto max-w-4xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <p className="mx-auto mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-astro-soft" /> Free · No code · Ready in a minute
          </p>
          <h1 className="animate-fade-up text-5xl font-extrabold tracking-tight text-white [animation-delay:80ms] sm:text-7xl">
            Your corner of the <span className="bg-gradient-to-r from-astro-soft via-indigo-300 to-astro-blue bg-clip-text text-transparent">internet</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg text-zinc-400 [animation-delay:160ms]">
            One link for everything you are. Build a beautiful, fully customizable profile with your socials, music and style —
            and claim <span className="text-zinc-200">astro.lol/you</span>.
          </p>
          <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
            <Link href="/register" className="btn-primary !px-7 !py-3.5 text-base">
              Create your profile
            </Link>
            <Link href="/explore" className="btn-ghost !px-7 !py-3.5 text-base">
              Explore profiles
            </Link>
          </div>
        </div>
      </section>

      {/* Voorbeeldprofielen */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Profiles that stand out</h2>
          <p className="mt-2 text-zinc-400">A few examples of what you can build.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {demos.map((d) => (
            <div key={d.profile.username} className="h-[560px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
              <ProfileView profile={d.profile} links={d.links} preview />
            </div>
          ))}
        </div>
      </section>

      {/* Functies */}
      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Everything you need</h2>
          <p className="mt-2 text-zinc-400">Simple to start, deep enough to make it unmistakably yours.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="panel group transition duration-300 hover:-translate-y-1 hover:border-astro/40">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-astro/15 text-astro-soft transition group-hover:bg-astro/25">
                <Icon />
              </span>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-28 max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-astro/20 via-ink-900 to-ink-900 p-10 text-center">
          <h2 className="text-3xl font-bold text-white">Claim your username before someone else does.</h2>
          <p className="mx-auto mt-3 max-w-lg text-zinc-400">It takes less than a minute and it’s free.</p>
          <Link href="/register" className="btn-primary mt-7 !px-7 !py-3.5">
            Create your profile
          </Link>
        </div>
      </section>
    </main>
  );
}
