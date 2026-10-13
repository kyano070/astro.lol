'use server';

import { PLATFORM_LABELS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validation';

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveProfile(input: unknown): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You need to be signed in.' };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };

  const { links, ...profile } = parsed.data;

  // Afbeeldingen mogen alleen uit de eigen map in onze storage komen
  const ownPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${user.id}/`;
  for (const url of [profile.avatar_url, profile.background_url]) {
    if (url && !url.startsWith(ownPrefix)) {
      return { ok: false, error: 'Images must be uploaded through the editor.' };
    }
  }
  const ownStorage = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/`;
  if (profile.music_url?.startsWith(ownStorage) && !profile.music_url.startsWith(ownPrefix)) {
    return { ok: false, error: 'Invalid music file.' };
  }

  const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'That username is already taken.' };
    return { ok: false, error: 'Could not save your profile. Please try again.' };
  }

  const { error: linkError } = await supabase.rpc('save_links', {
    p_links: links.map((l) => ({ platform: l.platform, label: l.label || PLATFORM_LABELS[l.platform], url: l.url })),
  });
  if (linkError) return { ok: false, error: 'Could not save your links. Please try again.' };

  return { ok: true };
}
