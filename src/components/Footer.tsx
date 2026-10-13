import Link from 'next/link';
import Logo from './Logo';

const links = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Logo />
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition hover:text-white">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-zinc-500">© {new Date().getFullYear()} Astro.lol</p>
      </div>
    </footer>
  );
}
