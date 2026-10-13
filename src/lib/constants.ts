export const PLATFORM_IDS = [
  'discord',
  'youtube',
  'twitch',
  'github',
  'instagram',
  'x',
  'tiktok',
  'spotify',
  'website',
] as const;
export type Platform = (typeof PLATFORM_IDS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  discord: 'Discord',
  youtube: 'YouTube',
  twitch: 'Twitch',
  github: 'GitHub',
  instagram: 'Instagram',
  x: 'X',
  tiktok: 'TikTok',
  spotify: 'Spotify',
  website: 'Website',
};

export const FONT_IDS = ['sans', 'rounded', 'serif', 'mono'] as const;
export type FontId = (typeof FONT_IDS)[number];

export const FONTS: Record<FontId, { label: string; css: string }> = {
  sans: {
    label: 'Modern',
    css: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  rounded: {
    label: 'Rounded',
    css: 'ui-rounded, "SF Pro Rounded", Nunito, "Varela Round", system-ui, sans-serif',
  },
  serif: { label: 'Serif', css: 'Georgia, "Times New Roman", Times, serif' },
  mono: {
    label: 'Mono',
    css: 'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
  },
};

export const THEME_IDS = ['midnight', 'ocean', 'nebula', 'ember', 'mint', 'mono'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const THEMES: Record<ThemeId, { label: string; bg: string; accent: string; text: string }> = {
  midnight: { label: 'Midnight', bg: '#07070d', accent: '#8b5cf6', text: '#f4f4f8' },
  ocean: { label: 'Ocean', bg: '#050b18', accent: '#3b82f6', text: '#eaf2ff' },
  nebula: { label: 'Nebula', bg: '#0b0614', accent: '#c084fc', text: '#f5ecff' },
  ember: { label: 'Ember', bg: '#0d0707', accent: '#f43f5e', text: '#fff1f2' },
  mint: { label: 'Mint', bg: '#06100d', accent: '#34d399', text: '#ecfdf5' },
  mono: { label: 'Mono', bg: '#0a0a0a', accent: '#e5e5e5', text: '#fafafa' },
};

export const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or scam' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'other', label: 'Something else' },
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number]['id'];

export const RESERVED_USERNAMES = [
  'admin', 'administrator', 'api', 'about', 'astro', 'auth', 'contact', 'dashboard',
  'explore', 'help', 'home', 'login', 'logout', 'moderator', 'new', 'privacy', 'register',
  'root', 'settings', 'signin', 'signup', 'staff', 'support', 'terms', 'www',
];

export const MAX_LINKS = 12;
export const PAGE_SIZE = 12;
