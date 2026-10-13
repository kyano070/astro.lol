import Link from 'next/link';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <svg viewBox="0 0 64 64" className="h-7 w-7 transition duration-500 group-hover:rotate-90" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <path d="M32 6l6.5 19.5L58 32l-19.5 6.5L32 58l-6.5-19.5L6 32l19.5-6.5z" fill="url(#logo-g)" />
      </svg>
      <span className="text-lg text-white">
        Astro<span className="text-astro-soft">.lol</span>
      </span>
    </Link>
  );
}
