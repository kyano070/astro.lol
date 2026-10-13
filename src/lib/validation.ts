import { z } from 'zod';
import {
  FONT_IDS,
  MAX_LINKS,
  PLATFORM_IDS,
  RESERVED_USERNAMES,
  THEME_IDS,
} from './constants';

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export const usernameSchema = z
  .string({ required_error: 'Choose a username.' })
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, 'Username must be 3–20 characters: letters, numbers or underscores.')
  .refine((v) => !RESERVED_USERNAMES.includes(v), 'That username is reserved.');

export const emailSchema = z
  .string({ required_error: 'Enter your email.' })
  .trim()
  .toLowerCase()
  .max(254)
  .email('Enter a valid email address.');

export const passwordSchema = z
  .string({ required_error: 'Enter a password.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password can be at most 72 characters.');

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.').max(72),
});

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colors must be hex values like #8b5cf6.');

const optionalText = (max: number, name: string) =>
  z
    .string()
    .trim()
    .max(max, `${name} can be at most ${max} characters.`)
    .nullish()
    .transform((v) => v || null);

const optionalUrl = (name: string) =>
  z
    .string()
    .trim()
    .max(500)
    .nullish()
    .transform((v) => v || null)
    .refine((v) => v === null || isHttpUrl(v), `${name} must be a valid http(s) URL.`);

export const linkSchema = z.object({
  platform: z.enum(PLATFORM_IDS),
  label: z.string().trim().max(40, 'Link labels can be at most 40 characters.'),
  url: z
    .string()
    .trim()
    .max(500, 'Link URLs can be at most 500 characters.')
    .refine(isHttpUrl, 'Every link needs a valid http(s) URL.'),
});

export const profileSchema = z.object({
  username: usernameSchema,
  display_name: optionalText(40, 'Display name'),
  bio: optionalText(300, 'Bio'),
  status: optionalText(80, 'Status'),
  avatar_url: optionalUrl('Avatar'),
  background_url: optionalUrl('Background'),
  music_url: optionalUrl('Music'),
  accent_color: hex,
  bg_color: hex,
  text_color: hex,
  font: z.enum(FONT_IDS),
  theme: z.enum(THEME_IDS),
  effect_animation: z.boolean(),
  effect_glow: z.boolean(),
  effect_particles: z.boolean(),
  effect_blur: z.boolean(),
  is_public: z.boolean(),
  links: z.array(linkSchema).max(MAX_LINKS, `You can add up to ${MAX_LINKS} links.`),
});

export type ProfileInput = z.input<typeof profileSchema>;

export const reportSchema = z.object({
  username: usernameSchema,
  reason: z.enum(['spam', 'impersonation', 'inappropriate', 'harassment', 'other']),
  details: optionalText(500, 'Details'),
});
